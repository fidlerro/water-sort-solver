import React from "react";
import Button from "../shared/Button";

interface StepControlsProps {
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function StepControls({
  current,
  total,
  onNext,
  onPrev,
}: StepControlsProps) {
  return (
    <div className="step-controls">
      <Button variant="secondary" onClick={onPrev} disabled={current <= 0}>
        ◀ Back
      </Button>
      <div className="badge">
        Step {Math.min(current + 1, total)} of {total}
      </div>
      <Button onClick={onNext} disabled={current >= total - 1}>
        Next ▶
      </Button>
    </div>
  );
}
