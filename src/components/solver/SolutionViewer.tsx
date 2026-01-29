import React, { useMemo, useRef } from "react";
import { Solution } from "../../types/solution";
import { ColorPalette } from "../../types/puzzle";
import TubeCanvas from "./TubeCanvas";
import StepControls from "./StepControls";
import MoveDescription from "./MoveDescription";
import { useGestures } from "../../hooks/useGestures";

interface SolutionViewerProps {
  solution: Solution;
  states: string[][];
  palette: ColorPalette;
  stepIndex: number;
  onStepChange: (next: number) => void;
  guaranteedMoves: Array<{ from: number; to: number; color: string }>;
}

export default function SolutionViewer({
  solution,
  states,
  palette,
  stepIndex,
  onStepChange,
  guaranteedMoves,
}: SolutionViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGestures(containerRef, {
    onSwipeLeft: () => {
      if (stepIndex < solution.steps.length - 1) onStepChange(stepIndex + 1);
    },
    onSwipeRight: () => {
      if (stepIndex > 0) onStepChange(stepIndex - 1);
    },
  });

  const currentStep = solution.steps[stepIndex];
  const tubeStates = useMemo(() => {
    if (states.length === 0) return [];
    return states[Math.min(stepIndex + 1, states.length - 1)];
  }, [states, stepIndex]);

  const warning = guaranteedMoves.length
    ? `Guaranteed moves available: ${guaranteedMoves.length}`
    : undefined;

  return (
    <div className="card" ref={containerRef}>
      <h2 className="section-title">Solution Viewer</h2>
      <TubeCanvas tubeStates={tubeStates} palette={palette} />
      <MoveDescription step={currentStep} warning={warning} />
      <StepControls
        current={stepIndex}
        total={solution.steps.length}
        onNext={() =>
          onStepChange(Math.min(stepIndex + 1, solution.steps.length - 1))
        }
        onPrev={() => onStepChange(Math.max(stepIndex - 1, 0))}
      />
    </div>
  );
}
