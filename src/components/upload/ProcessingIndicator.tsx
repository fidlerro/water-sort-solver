import React from "react";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
}

export default function ProcessingIndicator({
  isProcessing,
}: ProcessingIndicatorProps) {
  if (!isProcessing) return null;

  return (
    <div className="card" style={{ marginTop: 16 }} aria-live="polite">
      <strong>Analyzing screenshot...</strong>
      <p className="muted">Detecting tubes, colors, and hidden segments.</p>
    </div>
  );
}
