import React from "react";
import { TubeConfig, ColorPalette } from "../../types/puzzle";
import { getColorHex } from "../../lib/utils/colors";

interface TubePreviewProps {
  tubes: TubeConfig[];
  palette: ColorPalette;
}

export default function TubePreview({ tubes, palette }: TubePreviewProps) {
  return (
    <div className="tube-grid">
      {tubes.map((tube) => (
        <div className="tube-card" key={tube.index}>
          <div className="muted">Tube {tube.index + 1}</div>
          <div className="tube-row">
            {[...tube.colors].reverse().map((color, idx) => (
              <span
                key={`${tube.index}-${idx}`}
                className="color-chip"
                title={color}
                style={{ background: getColorHex(color, palette) }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
