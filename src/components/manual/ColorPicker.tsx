import React from "react";
import { ColorPalette } from "../../types/puzzle";

interface ColorPickerProps {
  palette: ColorPalette;
  onChange: (letter: string, hex: string) => void;
}

export default function ColorPicker({ palette, onChange }: ColorPickerProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {Object.entries(palette).map(([letter, value]) => (
        <label key={letter} className="tube-card" style={{ minWidth: 140 }}>
          <div className="muted">{letter}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
            }}
          >
            <input
              type="color"
              value={value.hex}
              onChange={(event) => onChange(letter, event.target.value)}
              aria-label={`Pick color for ${letter}`}
            />
            <div>{value.name}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
