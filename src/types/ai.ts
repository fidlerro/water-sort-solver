export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TubeDetectionResult {
  numberOfTubes: number;
  tubeBoundingBoxes: BoundingBox[];
  tubeOrder: number[];
  confidence: number;
}

export interface ColorSegment {
  position: 0 | 1 | 2 | 3;
  color: string | "?";
  confidence: number;
}

export interface TubeConfiguration {
  tubeIndex: number;
  segments: ColorSegment[];
}

export interface DetectedColor {
  hexColor: string;
  frequency: number;
  letter: string;
  isComplete: boolean;
}
