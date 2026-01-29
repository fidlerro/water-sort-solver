export interface SolutionStep {
  stepNumber: number;
  from: number;
  to: number;
  color: string;
  tubeStates: string[];
  description: string;
}

export interface Solution {
  steps: SolutionStep[];
  totalMoves: number;
  confidence: "high" | "medium" | "low";
  warnings?: string[];
}
