import * as ort from 'onnxruntime-web';

let modelSession: ort.InferenceSession | null = null;

/**
 * Load the ONNX tube detection model
 */
export async function loadTubeDetectorModel(): Promise<ort.InferenceSession> {
  if (modelSession) {
    return modelSession;
  }

  try {
    // Load the segment detection model (16 classes: 14 colors + empty + unknown)
    modelSession = await ort.InferenceSession.create('/models/best_segments.onnx', {
      executionProviders: ['wasm'],
    });
    
    console.log('ONNX model loaded successfully');
    return modelSession;
  } catch (error) {
    console.error('Failed to load ONNX model:', error);
    throw new Error('Failed to load tube detector model');
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
