import React from "react";
import { ColorPalette } from "../../types/puzzle";

interface ColorPaletteDisplayProps {
  palette: ColorPalette;
}

export default function ColorPaletteDisplay({
  palette,
}: ColorPaletteDisplayProps) {
  const entries = Object.entries(palette);
  if (!entries.length) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {entries.map(([letter, value]) => (
        <div key={letter} className="tube-card" style={{ minWidth: 120 }}>
          <div className="muted">{letter}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
            }}
          >
            <span className="color-chip" style={{ background: value.hex }} />
            <div>
              <div>{value.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {value.frequency} segments
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
