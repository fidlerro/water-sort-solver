import { useCallback, useState } from "react";
import { PuzzleConfiguration } from "../types/puzzle";
import { buildPaletteFromTubes, DEFAULT_COLOR_MAP } from "../lib/utils/colors";
import { detectTubes, BoundingBox } from "../lib/ai/inference";
import { 
  groupSegmentsIntoTubes, 
  segmentClassToColorLetter,
  validateTubeConfiguration 
} from "../lib/ai/segmentProcessing";

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function closestLetter(hex: string): string {
  const target = hexToRgb(hex);
  if (!target) return "A";

  let bestLetter = "A";
  let bestDistance = Number.POSITIVE_INFINITY;

  const entries = Object.entries(DEFAULT_COLOR_MAP) as Array<
    [string, { hex: string; name: string }]
  >;

  for (const [letter, value] of entries) {
    const rgb = hexToRgb(value.hex);
    if (!rgb) continue;
    const distance = Math.hypot(
      rgb.r - target.r,
      rgb.g - target.g,
      rgb.b - target.b,
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      bestLetter = letter;
    }
  }

  return bestLetter;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

async function sampleDominantColors(file: File, count = 6): Promise<string[]> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const scale = Math.min(800 / bitmap.width, 1);
  canvas.width = Math.floor(bitmap.width * scale);
  canvas.height = Math.floor(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(((i + 1) / (count + 1)) * canvas.width);
    const y = Math.floor((((i % 3) + 1) / 4) * canvas.height);
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    colors.push(rgbToHex(r, g, b));
  }
  return colors;
}

async function estimateTubeCount(file: File): Promise<number | null> {
  const bitmap = await createImageBitmap(file);
  const targetWidth = 640;
  const scale = Math.min(targetWidth / bitmap.width, 1);
  const width = Math.floor(bitmap.width * scale);
  const height = Math.floor(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(bitmap, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height).data;

  function computeColumnScores(yStart: number, yEnd: number) {
    const scores = new Array<number>(width).fill(0);
    for (let y = yStart; y < yEnd; y += 2) {
      for (let x = 1; x < width - 1; x += 1) {
        const idxPrev = (y * width + (x - 1)) * 4;
        const idxNext = (y * width + (x + 1)) * 4;

        const grayPrev =
          0.2126 * imageData[idxPrev] +
          0.7152 * imageData[idxPrev + 1] +
          0.0722 * imageData[idxPrev + 2];
        const grayNext =
          0.2126 * imageData[idxNext] +
          0.7152 * imageData[idxNext + 1] +
          0.0722 * imageData[idxNext + 2];

        scores[x] += Math.abs(grayNext - grayPrev);
      }
    }
    return scores;
  }

  function smoothScores(scores: number[], windowSize = 5) {
    const smoothed = new Array<number>(scores.length).fill(0);
    const half = Math.floor(windowSize / 2);
    for (let i = 0; i < scores.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = -half; j <= half; j++) {
        const idx = i + j;
        if (idx >= 0 && idx < scores.length) {
          sum += scores[idx];
          count++;
        }
      }
      smoothed[i] = sum / Math.max(count, 1);
    }
    return smoothed;
  }

  function percentile(scores: number[], p: number) {
    const sorted = [...scores].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
    return sorted[idx];
  }

  function extractEdges(scores: number[]) {
    const mean = scores.reduce((acc, val) => acc + val, 0) / scores.length;
    const variance =
      scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      scores.length;
    const std = Math.sqrt(variance);
    const threshold = Math.max(mean + std * 0.35, percentile(scores, 0.85));

    const peaks: number[] = [];
    for (let x = 2; x < width - 2; x++) {
      if (
        scores[x] > threshold &&
        scores[x] > scores[x - 1] &&
        scores[x] >= scores[x + 1]
      ) {
        peaks.push(x);
      }
    }

    if (peaks.length === 0) return [];

    const clustered: number[] = [];
    let current = [peaks[0]];
    for (let i = 1; i < peaks.length; i++) {
      if (peaks[i] - peaks[i - 1] <= 4) {
        current.push(peaks[i]);
      } else {
        clustered.push(
          Math.round(current.reduce((a, b) => a + b, 0) / current.length),
        );
        current = [peaks[i]];
      }
    }
    clustered.push(
      Math.round(current.reduce((a, b) => a + b, 0) / current.length),
    );

    return clustered;
  }

  const topScores = smoothScores(
    computeColumnScores(Math.floor(height * 0.08), Math.floor(height * 0.45)),
  );
  const bottomScores = smoothScores(
    computeColumnScores(Math.floor(height * 0.55), Math.floor(height * 0.92)),
  );

  const topEdges = extractEdges(topScores);
  const bottomEdges = extractEdges(bottomScores);
  const allEdges = [...topEdges, ...bottomEdges].sort((a, b) => a - b);
  if (allEdges.length < 6) return null;

  const mergedEdges: number[] = [];
  let current = [allEdges[0]];
  for (let i = 1; i < allEdges.length; i++) {
    if (allEdges[i] - allEdges[i - 1] <= 6) {
      current.push(allEdges[i]);
    } else {
      mergedEdges.push(
        Math.round(current.reduce((a, b) => a + b, 0) / current.length),
      );
      current = [allEdges[i]];
    }
  }
  mergedEdges.push(
    Math.round(current.reduce((a, b) => a + b, 0) / current.length),
  );

  const tubeCount = Math.round(mergedEdges.length / 2);
  if (tubeCount < 3 || tubeCount > 18) return null;
  return tubeCount;
}

export function useImageAnalysis() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [configuration, setConfiguration] =
    useState<PuzzleConfiguration | null>(null);

  const analyzeImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Run segment detection with ONNX model
      const detectionResult = await detectTubes(file);
      
      console.log(`Detected ${detectionResult.boxes.length} segments`);
      
      // Use the organized tubes array from detection (already sorted and grouped)
      if (!detectionResult.tubes || detectionResult.tubes.length === 0) {
        throw new Error('No tubes detected in the image');
      }
      
      console.log(`Grouping ${detectionResult.boxes.length} segments with gap threshold: 55.7px`);
      console.log(`Grouped segments into ${detectionResult.tubes.length} tubes`);
      
      // Build tube configurations with actual detected colors
      const tubes = detectionResult.tubes.map((tube, index) => {
        // Map segments to color letters, filtering out empty segments
        const colors = tube.segments
          .map(seg => segmentClassToColorLetter(seg.className || 'unknown'))
          .filter(color => color !== ''); // Remove empty segments
        
        return {
          index,
          colors,
          metadata: {
            segmentCount: tube.segments.length,
            confidence: Math.min(...tube.segments.map(s => s.confidence)),
          },
        };
      });

      // Build color palette from detected colors
      const palette = buildPaletteFromTubes(tubes.map((tube) => tube.colors));

      const config: PuzzleConfiguration = {
        version: "1.2.0",
        timestamp: new Date().toISOString(),
        tubes,
        colorPalette: palette,
        hasUnknowns: tubes.some((tube) => tube.colors.includes("?")),
        metadata: {
          source: "ai",
          confidence: tubes.length > 0
            ? Math.min(...tubes.map((tube) => tube.metadata?.confidence || 0))
            : 0,
          originalImage: url,
          detection: {
            tubes: detectionResult.tubes,
            imageWidth: detectionResult.imageWidth,
            imageHeight: detectionResult.imageHeight,
            confidence: tubes.length > 0
              ? Math.min(...tubes.map((tube) => tube.metadata?.confidence || 0))
              : undefined,
          },
        },
      };

      setConfiguration(config);
      setIsProcessing(false);
      return config;
    } catch (error) {
      console.error("Image analysis failed:", error);
      setIsProcessing(false);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setConfiguration(null);
  }, [previewUrl]);

  return { isProcessing, previewUrl, configuration, analyzeImage, reset };
}
