import * as ort from 'onnxruntime-web';
import { loadTubeDetectorModel } from './modelLoader';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId?: number;  // For multi-class detection
  className?: string; // Human-readable class name
}

export interface DetectionResult {
  boxes: BoundingBox[];
  imageWidth: number;
  imageHeight: number;
}

// Class mapping for segment colors (from color_reference.json)
export const SEGMENT_CLASS_NAMES: Record<number, string> = {
  0: 'unknown',
  1: 'empty',
  2: 'royal_indigo',
  3: 'crimson_red',
  4: 'burgundy_crimson',
  5: 'royal_magenta',
  6: 'burnished_bronze',
  7: 'rose_coral',
  8: 'sky_azure',
  9: 'electric_violet',
  10: 'amber_orange',
  11: 'emerald_green',
  12: 'forest_green',
  13: 'lavender_blush',
  14: 'steel_gray',
  15: 'soft_copper',
};

/**
 * Preprocess image for ONNX model input
 * Converts image to tensor format expected by YOLOv8
 */
async function preprocessImage(
  imageElement: HTMLImageElement,
  targetSize: number = 1280 // Match training size
): Promise<{ tensor: ort.Tensor; scale: number }> {
  console.log(`Preprocessing image: ${imageElement.width}x${imageElement.height} -> ${targetSize}x${targetSize}`);
  
  // Create canvas for image manipulation
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Calculate scaling to maintain aspect ratio
  const scale = Math.min(
    targetSize / imageElement.width,
    targetSize / imageElement.height
  );
  const scaledWidth = imageElement.width * scale;
  const scaledHeight = imageElement.height * scale;

  console.log(`Scale factor: ${scale}, Scaled dimensions: ${scaledWidth}x${scaledHeight}`);

  // Center the image on canvas with padding
  const x = (targetSize - scaledWidth) / 2;
  const y = (targetSize - scaledHeight) / 2;

  // Fill with gray background (114, 114, 114) - YOLO standard
  ctx.fillStyle = 'rgb(114, 114, 114)';
  ctx.fillRect(0, 0, targetSize, targetSize);

  // Draw the scaled image
  ctx.drawImage(imageElement, x, y, scaledWidth, scaledHeight);

  // Get image data
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const { data } = imageData;

  // Convert to CHW format and normalize to [0, 1]
  const float32Data = new Float32Array(3 * targetSize * targetSize);
  for (let i = 0; i < targetSize * targetSize; i++) {
    float32Data[i] = data[i * 4] / 255.0; // R
    float32Data[targetSize * targetSize + i] = data[i * 4 + 1] / 255.0; // G
    float32Data[2 * targetSize * targetSize + i] = data[i * 4 + 2] / 255.0; // B
  }

  // Create tensor
  const tensor = new ort.Tensor('float32', float32Data, [1, 3, targetSize, targetSize]);
  
  console.log('Created input tensor with shape:', tensor.dims);

  return { tensor, scale };
}

/**
 * Post-process YOLO model output to extract bounding boxes
 */
function postProcessOutput(
  output: ort.Tensor,
  scale: number,
  confidenceThreshold: number = 0.3,
  iouThreshold: number = 0.3
): BoundingBox[] {
  const boxes: BoundingBox[] = [];
  const outputData = output.data as Float32Array;
  
  // YOLOv8 output format: [batch, data_channels, num_predictions]
  // Shape: [1, 20, 25600] where 20 = 4 box coords + 16 class confidences
  // Data layout: [all_cx, all_cy, all_w, all_h, all_class0, all_class1, ..., all_class15]
  
  const batchSize = output.dims[0]; // 1
  const dataChannels = output.dims[1]; // 20 (4 + 16)
  const numPredictions = output.dims[2]; // 25600
  const numClasses = dataChannels - 4; // 16

  console.log('YOLOv8 Multi-class output shape:', output.dims);
  console.log('Data channels:', dataChannels, '(4 box + ' + numClasses + ' classes)');
  console.log('Number of predictions:', numPredictions);

  for (let i = 0; i < numPredictions; i++) {
    // Extract box coordinates (first 4 channels)
    const cx = outputData[0 * numPredictions + i]; // Channel 0
    const cy = outputData[1 * numPredictions + i]; // Channel 1
    const w = outputData[2 * numPredictions + i];  // Channel 2
    const h = outputData[3 * numPredictions + i];  // Channel 3
    
    // Find best class confidence (channels 4-19)
    let bestClassId = 0;
    let bestConfidence = 0;
    
    for (let classIdx = 0; classIdx < numClasses; classIdx++) {
      const channelIdx = 4 + classIdx; // Channels 4, 5, 6, ..., 19
      const classConfidence = outputData[channelIdx * numPredictions + i];
      if (classConfidence > bestConfidence) {
        bestConfidence = classConfidence;
        bestClassId = classIdx;
      }
    }
    
    if (bestConfidence >= confidenceThreshold) {
      boxes.push({
        x: (cx - w / 2) / scale,
        y: (cy - h / 2) / scale,
        width: w / scale,
        height: h / scale,
        confidence: bestConfidence,
        classId: bestClassId,
        className: SEGMENT_CLASS_NAMES[bestClassId] || `class_${bestClassId}`,
      });
    }
  }

  console.log(`Found ${boxes.length} segments above confidence threshold ${confidenceThreshold}`);
  console.log('Class distribution:', 
    boxes.reduce((acc, box) => {
      const className = box.className || 'unknown';
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );

  // Apply Non-Maximum Suppression per class
  const finalBoxes = applyNMSPerClass(boxes, iouThreshold);
  console.log(`After NMS: ${finalBoxes.length} segments`);
  
  return finalBoxes;
}

/**
 * Apply Non-Maximum Suppression to remove overlapping boxes (per class)
 */
function applyNMSPerClass(boxes: BoundingBox[], iouThreshold: number): BoundingBox[] {
  // Group boxes by class
  const boxesByClass: Record<number, BoundingBox[]> = {};
  boxes.forEach(box => {
    const classId = box.classId ?? 0;
    if (!boxesByClass[classId]) {
      boxesByClass[classId] = [];
    }
    boxesByClass[classId].push(box);
  });

  // Apply NMS per class
  const selected: BoundingBox[] = [];
  for (const classId in boxesByClass) {
    const classBoxes = boxesByClass[classId];
    // Sort by confidence descending
    classBoxes.sort((a, b) => b.confidence - a.confidence);

    const classSelected: BoundingBox[] = [];
    while (classBoxes.length > 0) {
      const best = classBoxes.shift()!;
      classSelected.push(best);

      // Filter out overlapping boxes
      for (let i = classBoxes.length - 1; i >= 0; i--) {
        const iou = calculateIoU(best, classBoxes[i]);
        if (iou >= iouThreshold) {
          classBoxes.splice(i, 1);
        }
      }
    }
    selected.push(...classSelected);
  }

  return selected;
}

/**
 * Calculate Intersection over Union between two boxes
 */
function calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const union = area1 + area2 - intersection;

  return union > 0 ? intersection / union : 0;
}

/**
 * Run tube detection inference on an image
 */
export async function detectTubes(imageFile: File): Promise<DetectionResult> {
  try {
    console.log('Starting tube detection...');
    
    // Load model if not already loaded
    const session = await loadTubeDetectorModel();
    console.log('Model session loaded. Input names:', session.inputNames);
    console.log('Model session output names:', session.outputNames);

    // Load image
    const img = await loadImage(imageFile);
    console.log(`Image loaded: ${img.width}x${img.height}`);

    // Preprocess
    const { tensor, scale } = await preprocessImage(img);
    console.log('Preprocessing complete, scale:', scale);

    // Run inference
    const feeds: Record<string, ort.Tensor> = {};
    feeds[session.inputNames[0]] = tensor;
    
    console.log('Running inference...');
    const results = await session.run(feeds);
    console.log('Inference complete');

    // Get output tensor
    const output = results[session.outputNames[0]];
    console.log('Output tensor retrieved');

    // Post-process
    const boxes = postProcessOutput(output, scale);

    return {
      boxes,
      imageWidth: img.width,
      imageHeight: img.height,
    };
  } catch (error) {
    console.error('Inference error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to detect tubes in image');
  }
}

/**
 * Helper function to load image from File
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
