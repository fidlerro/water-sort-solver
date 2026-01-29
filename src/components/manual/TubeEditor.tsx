import React from "react";
import { isValidTubeInput } from "../../lib/utils/validation";

interface TubeEditorProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
}

export default function TubeEditor({
  index,
  value,
  onChange,
}: TubeEditorProps) {
  const isValid = isValidTubeInput(value);

  return (
    <div className="manual-row">
      <div style={{ minWidth: 70 }}>Tube {index + 1}</div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        placeholder="AB?C"
        aria-invalid={!isValid}
        style={{ borderColor: isValid ? undefined : "var(--danger)" }}
      />
    </div>
  );
}
