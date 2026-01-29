import React from "react";
import { SolutionStep } from "../../types/solution";

interface MoveDescriptionProps {
  step?: SolutionStep;
  warning?: string;
}

export default function MoveDescription({
  step,
  warning,
}: MoveDescriptionProps) {
  if (!step) {
    return <p className="muted">No steps to display.</p>;
  }

  return (
    <div>
      <strong>{step.description}</strong>
      <div className="muted" style={{ marginTop: 4 }}>
        Color: {step.color}
      </div>
      {warning && (
        <div style={{ marginTop: 8, color: "var(--warning)" }}>{warning}</div>
      )}
    </div>
  );
}
