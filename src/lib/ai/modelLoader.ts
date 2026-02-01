import * as ort from 'onnxruntime-web';

let modelSession: ort.InferenceSession | null = null;

/**
 * Load the ONNX multi-class segment detection model
 * 
 * Model detects individual colored segments (not tubes) with 16 classes:
 * - 14 color classes (royal_indigo, crimson_red, etc.)
 * - 1 empty class
 * - 1 unknown class
 */
export async function loadSegmentDetectorModel(): Promise<ort.InferenceSession> {
  if (modelSession) {
    return modelSession;
  }

  try {
    // Load the 16-class segment detection model
    modelSession = await ort.InferenceSession.create('/models/best_segments.onnx', {
      executionProviders: ['wasm'],
    });
    
    console.log('ONNX segment detection model loaded successfully (16 classes)');
    return modelSession;
  } catch (error) {
    console.error('Failed to load ONNX model:', error);
    throw new Error('Failed to load segment detector model');
  }
}

/**
 * Get the current model session (if loaded)
 */
export function getModelSession(): ort.InferenceSession | null {
  return modelSession;
}

/**
 * Unload the model from memory
 */
export async function unloadModel(): Promise<void> {
  if (modelSession) {
    await modelSession.release();
    modelSession = null;
    console.log('ONNX model unloaded');
  }
}
