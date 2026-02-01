import React, { useState } from "react";
import { PuzzleConfiguration } from "../../types/puzzle";
import Button from "../shared/Button";
import TubePreview from "./TubePreview";
import ColorPaletteDisplay from "./ColorPaletteDisplay";
import ConfidenceIndicator from "./ConfidenceIndicator";
import { segmentClassToColorLetter } from "../../lib/ai/segmentProcessing";

interface ConfigReviewProps {
  configuration: PuzzleConfiguration;
  onAccept: () => void;
  onAdjust: () => void;
  onConfigurationChange?: (config: PuzzleConfiguration) => void;
}

export default function ConfigReview({
  configuration,
  onAccept,
  onAdjust,
  onConfigurationChange,
}: ConfigReviewProps) {
  const [localConfig, setLocalConfig] = useState(configuration);

  // This handler is exported for use by parent component
  const handleSegmentColorChange = (tubeIndex: number, segmentIndex: number, newColorLetter: string) => {
    // Update the tube's colors array
    const updatedTubes = [...localConfig.tubes];
    const tube = updatedTubes[tubeIndex];
    
    // Rebuild colors array from segments with the new color
    if (localConfig.metadata?.detection) {
      const detectionTube = localConfig.metadata.detection.tubes[tubeIndex];
      const colors = detectionTube.segments
        .map((seg, idx) => {
          if (idx === segmentIndex) {
            return newColorLetter;
          }
          return segmentClassToColorLetter(seg.className || 'unknown');
        })
        .filter(color => color !== ''); // Remove empty segments
      
      updatedTubes[tubeIndex] = {
        ...tube,
        colors,
      };

      // Recalculate color palette frequencies
      const colorCounts: Record<string, number> = {};
      updatedTubes.forEach(t => {
        t.colors.forEach(color => {
          if (color !== '?') {
            colorCounts[color] = (colorCounts[color] || 0) + 1;
          }
        });
      });

      const updatedPalette = { ...localConfig.colorPalette };
      Object.keys(updatedPalette).forEach(letter => {
        updatedPalette[letter] = {
          ...updatedPalette[letter],
          frequency: colorCounts[letter] || 0,
        };
      });

      const newConfig: PuzzleConfiguration = {
        ...localConfig,
        tubes: updatedTubes,
        colorPalette: updatedPalette,
        hasUnknowns: updatedTubes.some(t => t.colors.includes('?')),
      };

      setLocalConfig(newConfig);
      onConfigurationChange?.(newConfig);
    }
  };

  // Expose the handler to parent
  React.useEffect(() => {
    if (onConfigurationChange) {
      (window as any).__handleSegmentColorChange = handleSegmentColorChange;
    }
  }, [localConfig]);

  return (
    <div className="card">
      <h2 className="section-title">Analysis Summary</h2>
      
      <p className="muted">
        Detected {localConfig.tubes.length} tube{localConfig.tubes.length !== 1 ? 's' : ''} with{" "}
        {localConfig.tubes.reduce((sum, tube) => sum + tube.colors.length, 0)} segment
        {localConfig.tubes.reduce((sum, tube) => sum + tube.colors.length, 0) !== 1 ? 's' : ''} across{" "}
        {Object.keys(localConfig.colorPalette).length} color{Object.keys(localConfig.colorPalette).length !== 1 ? 's' : ''}.
      </p>
      <TubePreview
        tubes={localConfig.tubes}
        palette={localConfig.colorPalette}
      />
      <div style={{ marginTop: 16 }}>
        <h3 className="section-title">Color Palette</h3>
        <ColorPaletteDisplay palette={localConfig.colorPalette} />
      </div>
      <ConfidenceIndicator confidence={localConfig.metadata?.confidence} />
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
