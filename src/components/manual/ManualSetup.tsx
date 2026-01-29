import React from "react";
import TubeEditor from "./TubeEditor";
import ColorPicker from "./ColorPicker";
import Button from "../shared/Button";
import { ColorPalette } from "../../types/puzzle";

interface ManualSetupProps {
  tubeCount: number;
  tubeInputs: string[];
  palette: ColorPalette;
  onTubeCountChange: (count: number) => void;
  onTubeInputChange: (index: number, value: string) => void;
  onPaletteChange: (letter: string, hex: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ManualSetup({
  tubeCount,
  tubeInputs,
  palette,
  onTubeCountChange,
  onTubeInputChange,
  onPaletteChange,
  onSave,
  onCancel,
}: ManualSetupProps) {
  return (
    <div className="card">
      <h2 className="section-title">Manual Configuration</h2>
      <div className="manual-row">
        <label htmlFor="tubeCount">Number of Tubes</label>
        <input
          id="tubeCount"
          className="input-small"
          type="number"
          min={3}
          max={18}
          value={tubeCount}
          onChange={(event) => onTubeCountChange(Number(event.target.value))}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        {tubeInputs.map((value, index) => (
          <TubeEditor
            key={index}
            index={index}
            value={value}
            onChange={(next) => onTubeInputChange(index, next)}
          />
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <h3 className="section-title">Color Palette</h3>
        <ColorPicker palette={palette} onChange={onPaletteChange} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Button onClick={onSave}>Save Configuration</Button>
        <Button variant="secondary" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
}
