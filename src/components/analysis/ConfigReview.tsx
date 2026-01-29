import React from "react";
import { PuzzleConfiguration } from "../../types/puzzle";
import Button from "../shared/Button";
import TubePreview from "./TubePreview";
import ColorPaletteDisplay from "./ColorPaletteDisplay";
import ConfidenceIndicator from "./ConfidenceIndicator";

interface ConfigReviewProps {
  configuration: PuzzleConfiguration;
  onAccept: () => void;
  onAdjust: () => void;
}

export default function ConfigReview({
  configuration,
  onAccept,
  onAdjust,
}: ConfigReviewProps) {
  return (
    <div className="card">
      <h2 className="section-title">Analysis Summary</h2>
      <p className="muted">
        Detected {configuration.tubes.length} tubes and{" "}
        {Object.keys(configuration.colorPalette).length} colors.
      </p>
      <TubePreview
        tubes={configuration.tubes}
        palette={configuration.colorPalette}
      />
      <div style={{ marginTop: 16 }}>
        <h3 className="section-title">Color Palette</h3>
        <ColorPaletteDisplay palette={configuration.colorPalette} />
      </div>
      <ConfidenceIndicator confidence={configuration.metadata?.confidence} />
      <div
        style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}
      >
        <Button onClick={onAccept}>Looks Good</Button>
        <Button variant="secondary" onClick={onAdjust}>
          Adjust Manually
        </Button>
      </div>
    </div>
  );
}
