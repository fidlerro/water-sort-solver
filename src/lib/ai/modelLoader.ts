import * as ort from "onnxruntime-web";

let modelSession: ort.InferenceSession | null = null;
let isInitialized = false;

/**
 * Initialize ONNX Runtime with WASM paths
 * This is crucial for production deployments
 */
async function initializeOnnxRuntime() {
  if (isInitialized) return;

  try {
    // Set WASM paths for production - critical for deployment
    // In production, these files need to be in the root public directory
    ort.env.wasm.wasmPaths = {
      "ort-wasm.wasm": "./ort-wasm.wasm",
      "ort-wasm-simd.wasm": "./ort-wasm-simd.wasm",
      "ort-wasm-threaded.wasm": "./ort-wasm-threaded.wasm",
      "ort-wasm-simd-threaded.wasm": "./ort-wasm-simd-threaded.wasm",
    };

    // Set number of threads (optional, but recommended)
    ort.env.wasm.numThreads = 1;

    isInitialized = true;
    console.log("ONNX Runtime initialized with WASM paths");
  } catch (error) {
    console.error("Failed to initialize ONNX Runtime:", error);
  }
}

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
    // Initialize ONNX Runtime first
    await initializeOnnxRuntime();

    // Load the 16-class segment detection model
    const modelPath = "./models/best_segments.onnx";

    modelSession = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["wasm"],
    });

    console.log(
      "ONNX segment detection model loaded successfully (16 classes)",
    );
    return modelSession;
  } catch (error) {
    console.error("Failed to load ONNX model:", error);
    throw new Error("Failed to load segment detector model");
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
    console.log("ONNX model unloaded");
  }
}
