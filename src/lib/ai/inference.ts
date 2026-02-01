import * as ort from 'onnxruntime-web';
import { loadSegmentDetectorModel } from './modelLoader';

/* ==========================================================================
   Types & Interfaces
   ========================================================================== */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId?: number;
  className?: string; // Human-readable class name
}

export interface Tube {
  segments: BoundingBox[];  // Ordered from top to bottom (index 0 = top)
  centerX: number;           // Average x position of all segments in this tube
  centerY?: number;          // Average y position of all segments in this tube
}

export interface DetectionResult {
  boxes: BoundingBox[];      // Raw unordered detections
  tubes: Tube[];             // Organized by tube, left to right
  imageWidth: number;
  imageHeight: number;
}

// Class mapping from color_reference.json
export const SEGMENT_CLASS_NAMES: Record<number, string> = {
  0: 'empty', 1: 'unknown', 2: 'royal_indigo', 3: 'crimson_red',
  4: 'burgundy_crimson', 5: 'royal_magenta', 6: 'burnished_bronze',
  7: 'rose_coral', 8: 'sky_azure', 9: 'electric_violet',
  10: 'amber_orange', 11: 'emerald_green', 12: 'forest_green',
  13: 'lavender_blush', 14: 'steel_gray', 15: 'soft_copper',
};

/* ==========================================================================
   User-Provided Optimization Logic (Clustering & Normalization)
   ========================================================================== */

type Box = {
  classId: number
  className: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
}

type InputData = { finalBoxes: Box[] }

type OutputBox = Box & {
  col: number
  tubeId: number
  rowInTube: number
}

type OutputData = { finalBoxes: OutputBox[] }

const median = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const a = [...arr].sort((a, b) => a - b);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

const cluster1D = (values: number[], threshold: number): number[] => {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const clusters: number[][] = [];
  let current = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i] - sorted[i - 1]) <= threshold) {
      current.push(sorted[i]);
    } else {
      clusters.push(current);
      current = [sorted[i]];
    }
  }
  clusters.push(current);
  return clusters.map(median);
};

const nearestIndex = (value: number, centers: number[]): number => {
  let best = 0;
  let dist = Infinity;
  centers.forEach((c, i) => {
    const d = Math.abs(value - c);
    if (d < dist) {
      dist = d;
      best = i;
    }
  });
  return best;
};

function normalizeAndTubeify(input: InputData): OutputData {
  const boxes = input.finalBoxes;
  if (boxes.length === 0) return { finalBoxes: [] };

  /* 1️⃣ normalize to grid */
  const xCenters = cluster1D(boxes.map(b => b.x), 25);
  const yCenters = cluster1D(boxes.map(b => b.y), 25);

  const normalized = boxes.map(b => {
    const col = nearestIndex(b.x, xCenters);
    const row = nearestIndex(b.y, yCenters);
    return {
      ...b,
      col,
      x: xCenters[col], // Snap to grid x
      y: yCenters[row], // Snap to grid y
      _row: row
    };
  });

  /* 2️⃣ split into tubes per column */
  const byCol = new Map<number, typeof normalized>();
  normalized.forEach(b => {
    if (!byCol.has(b.col)) byCol.set(b.col, []);
    byCol.get(b.col)!.push(b);
  });

  const tubed: OutputBox[] = [];

  byCol.forEach(colBoxes => {
    colBoxes.sort((a, b) => a.y - b.y);

    const diffs = colBoxes.slice(1).map((b, i) => b.y - colBoxes[i].y);
    const spacing = median(diffs) || 20;
    const gapThreshold = spacing * 1.6;

    let tubeBand = 0;
    let rowInTube = 0;

    colBoxes.forEach((b, i) => {
      if (i > 0) {
        const dy = b.y - colBoxes[i - 1].y;
        if (dy > gapThreshold || rowInTube >= 4) {
          tubeBand++;
          rowInTube = 0;
        }
      }
      tubed.push({ ...b, tubeId: tubeBand, rowInTube });
      rowInTube++;
    });
  });

  /* 3️⃣ renumber tubes: top-left → bottom-right */
  const tubeKeys = Array.from(new Set(tubed.map(b => `${b.col}:${b.tubeId}`)))
    .map(k => {
      const [col, band] = k.split(':').map(Number);
      return { col, band };
    });

  tubeKeys.sort((a, b) => a.band - b.band || a.col - b.col);

  const tubeMap = new Map<string, number>();
  tubeKeys.forEach((t, i) => {
    tubeMap.set(`${t.col}:${t.band}`, i + 1);
  });

  const finalBoxes = tubed
    .map(b => ({
      ...b,
      tubeId: tubeMap.get(`${b.col}:${b.tubeId}`)! || 0
    }))
    .sort((a, b) => a.tubeId - b.tubeId || a.rowInTube - b.rowInTube || a.col - b.col);

  return { finalBoxes };
}

/* ==========================================================================
   Core Detection Logic
   ========================================================================== */

/**
 * Run tube detection inference on an image
 */
export async function detectTubes(imageFile: File): Promise<DetectionResult> {
  try {
    console.log('[Inference] Starting detection...');
    
    const session = await loadSegmentDetectorModel();
    const img = await loadImage(imageFile);
    
    // Preprocess
    const { tensor, scale, offsetX, offsetY } = await preprocessInput(img);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[session.inputNames[0]] = tensor;
    
    // Inference
    const results = await session.run(feeds);
    const output = results[session.outputNames[0]];

    // Post-process (extract raw boxes)
    const boxes = postProcessOutput(output, scale, offsetX, offsetY);
    
    // Organize (Tubeify)
    const tubes = organizeSegmentsIntoTubes(boxes);

    console.log(`[Inference] Complete. Found ${tubes.length} tubes from ${boxes.length} raw segments.`);

    return {
      boxes,
      tubes,
      imageWidth: img.width,
      imageHeight: img.height,
    };
  } catch (error) {
    console.error('Inference error:', error);
    throw new Error('Failed to detect tubes in image');
  }
}

function organizeSegmentsIntoTubes(boxes: BoundingBox[]): Tube[] {
  // 1. Adapter: Convert to InputData
  const input: InputData = {
    finalBoxes: boxes.map(b => ({
      ...b,
      classId: b.classId || 0,
      className: b.className || 'unknown'
    }))
  };

  // 2. Run Logic
  const output = normalizeAndTubeify(input);
  
  // 3. Adapter: Convert back to Tube[]
  const tubeMap = new Map<number, OutputBox[]>();
  output.finalBoxes.forEach(box => {
    if (!tubeMap.has(box.tubeId)) tubeMap.set(box.tubeId, []);
    tubeMap.get(box.tubeId)?.push(box);
  });
  
  const sortedTubeIds = Array.from(tubeMap.keys()).sort((a, b) => a - b);
  
  return sortedTubeIds.map(id => {
    const segments = tubeMap.get(id) || [];
    segments.sort((a, b) => a.rowInTube - b.rowInTube);
    
    // Calculate geometric centers
    const centerX = segments[0].x + segments[0].width / 2;
    const centerY = segments.reduce((sum, s) => sum + s.y + s.height/2, 0) / segments.length;
    
    return {
      segments: segments.map(s => ({
        x: s.x, y: s.y,
        width: s.width, height: s.height,
        confidence: s.confidence,
        classId: s.classId, className: s.className
      })),
      centerX,
      centerY,
    };
  });
}

/**
 * Preprocess image to required format for YOLO model
 */
async function preprocessInput(
  imageElement: HTMLImageElement
): Promise<{ tensor: ort.Tensor; scale: number; offsetX: number; offsetY: number }> {
  const targetSize = 1280;
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const scale = Math.min(targetSize / imageElement.width, targetSize / imageElement.height);
  const scaledWidth = imageElement.width * scale;
  const scaledHeight = imageElement.height * scale;

  const x = (targetSize - scaledWidth) / 2;
  const y = (targetSize - scaledHeight) / 2;

  ctx.fillStyle = 'rgb(114, 114, 114)';
  ctx.fillRect(0, 0, targetSize, targetSize);
  ctx.drawImage(imageElement, x, y, scaledWidth, scaledHeight);

  const { data } = ctx.getImageData(0, 0, targetSize, targetSize);
  const float32Data = new Float32Array(3 * targetSize * targetSize);
  
  for (let i = 0; i < targetSize * targetSize; i++) {
    float32Data[i] = data[i * 4] / 255.0; // R
    float32Data[targetSize * targetSize + i] = data[i * 4 + 1] / 255.0; // G
    float32Data[2 * targetSize * targetSize + i] = data[i * 4 + 2] / 255.0; // B
  }

  return { 
    tensor: new ort.Tensor('float32', float32Data, [1, 3, targetSize, targetSize]), 
    scale, offsetX: x, offsetY: y 
  };
}

/**
 * Post-process YOLO model output to extract bounding boxes
 */
function postProcessOutput(
  output: ort.Tensor,
  scale: number,
  offsetX: number,
  offsetY: number,
  confidenceThreshold: number = 0.3,
  iouThreshold: number = 0.3
): BoundingBox[] {
  const boxes: BoundingBox[] = [];
  const outputData = output.data as Float32Array;
  
  const numPredictions = output.dims[2]; // 25600
  const dataChannels = output.dims[1]; 
  const numClasses = dataChannels - 4; // 16

  for (let i = 0; i < numPredictions; i++) {
    // Extract box (channels 0-3)
    const cx = outputData[0 * numPredictions + i];
    const cy = outputData[1 * numPredictions + i];
    const w = outputData[2 * numPredictions + i];
    const h = outputData[3 * numPredictions + i];
    
    // Find best class (channels 4+)
    let bestClassId = 0;
    let bestConfidence = 0;
    
    for (let classIdx = 0; classIdx < numClasses; classIdx++) {
      const conf = outputData[(4 + classIdx) * numPredictions + i];
      if (conf > bestConfidence) {
        bestConfidence = conf;
        bestClassId = classIdx;
      }
    }
    
    if (bestConfidence >= confidenceThreshold) {
      boxes.push({
        x: ((cx - w / 2) - offsetX) / scale,
        y: ((cy - h / 2) - offsetY) / scale,
        width: w / scale,
        height: h / scale,
        confidence: bestConfidence,
        classId: bestClassId,
        className: SEGMENT_CLASS_NAMES[bestClassId] || `class_${bestClassId}`,
      });
    }
  }

  // 1. Class NMS
  const classFiltered = applyNMSPerClass(boxes, iouThreshold);
  // 2. Global NMS (Overlap removal)
  const finalBoxes = applyGlobalNMS(classFiltered, 0.5);
  
  return finalBoxes;
}

function applyGlobalNMS(boxes: BoundingBox[], iouThreshold: number): BoundingBox[] {
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);
  const selected: BoundingBox[] = [];

  while (sorted.length > 0) {
    const best = sorted.shift()!;
    selected.push(best);
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (calculateIoU(best, sorted[i]) >= iouThreshold) sorted.splice(i, 1);
    }
  }
  return selected;
}

function applyNMSPerClass(boxes: BoundingBox[], iouThreshold: number): BoundingBox[] {
  const byClass: Record<number, BoundingBox[]> = {};
  boxes.forEach(b => {
    const id = b.classId ?? 0;
    if (!byClass[id]) byClass[id] = [];
    byClass[id].push(b);
  });

  const selected: BoundingBox[] = [];
  for (const id in byClass) {
    const classBoxes = byClass[id].sort((a, b) => b.confidence - a.confidence);
    while (classBoxes.length > 0) {
      const best = classBoxes.shift()!;
      selected.push(best);
      for (let i = classBoxes.length - 1; i >= 0; i--) {
        if (calculateIoU(best, classBoxes[i]) >= iouThreshold) classBoxes.splice(i, 1);
      }
    }
  }
  return selected;
}

function calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const u = (box1.width * box1.height) + (box2.width * box2.height) - intersection;
  return u > 0 ? intersection / u : 0;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
