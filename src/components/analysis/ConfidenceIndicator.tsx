import React from "react";

interface ConfidenceIndicatorProps {
  confidence?: number;
}

export default function ConfidenceIndicator({
  confidence = 0,
}: ConfidenceIndicatorProps) {
  const percent = Math.round(confidence * 100);
  const label = percent > 70 ? "High" : percent > 40 ? "Medium" : "Low";

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="muted">Detection Confidence</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>
        {label} ({percent}%)
      </div>
    </div>
  );
}
