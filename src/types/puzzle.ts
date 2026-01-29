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
  };
}
