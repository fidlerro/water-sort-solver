export type ColorValue = string | "?";

export interface TubeConfig {
  index: number;
  colors: ColorValue[];
}

export interface ColorPaletteEntry {
  hex: string;
  name: string;
  frequency: number;
}

export interface ColorPalette {
  [letter: string]: ColorPaletteEntry;
}

export interface PuzzleConfiguration {
  version: "1.2.0";
  timestamp: string;
  tubes: TubeConfig[];
  colorPalette: ColorPalette;
  hasUnknowns: boolean;
  metadata?: {
    source: "ai" | "manual";
    confidence?: number;
    originalImage?: string;
    detection?: {
      tubes: Array<{
        segments: Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          confidence: number;
          className?: string;
        }>;
        centerX: number;
        centerY?: number;
      }>;
      imageWidth: number;
      imageHeight: number;
      confidence?: number;
    };
  };
}
