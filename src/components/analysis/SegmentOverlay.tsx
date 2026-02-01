import React, { useState } from "react";
import { BoundingBox } from "../../lib/ai/inference";
import { ColorPalette } from "../../types/puzzle";
import { segmentClassToColorLetter } from "../../lib/ai/segmentProcessing";

interface SegmentOverlayProps {
  imageUrl: string;
  tubes: Array<{
    segments: BoundingBox[];
    centerX: number;
    centerY?: number;
  }>;
  palette: ColorPalette;
  imageWidth: number;
  imageHeight: number;
  confidence?: number;
  onSegmentColorChange: (tubeIndex: number, segmentIndex: number, newColor: string) => void;
  onReupload?: () => void;
}

export default function SegmentOverlay({
  imageUrl,
  tubes,
  palette,
  imageWidth,
  imageHeight,
  confidence,
  onSegmentColorChange,
  onReupload,
}: SegmentOverlayProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Calculate total segment count
  const totalSegments = tubes.reduce((sum, tube) => sum + tube.segments.length, 0);
  const totalColors = Object.keys(palette).length;

  // Sort colors by frequency for dropdown
  const sortedColors = Object.entries(palette)
    .sort(([, a], [, b]) => (b.frequency || 0) - (a.frequency || 0))
    .map(([letter]) => letter);

  const handleLabelClick = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleColorSelect = (tubeIdx: number, segIdx: number, newColor: string) => {
    onSegmentColorChange(tubeIdx, segIdx, newColor);
    setActiveDropdown(null);
  };

  const confidencePercent = confidence ? Math.round(confidence * 100) : null;

  return (
    <div className="segment-overlay-container" style={{ position: 'relative', width: '88%', margin: '0 auto', display: 'block' }}>
      <img
        src={imageUrl}
        alt="Analyzed screenshot"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      
      {/* Summary annotation at bottom - multi-line - moved up for controls */}
      {/* Tiny chevron buttons on right edge at 75% height */}
      {tubes.map((tube, tubeIdx) =>
        tube.segments.map((segment, segIdx) => {
          const dropdownId = `tube-${tubeIdx}-seg-${segIdx}`;
          const isActive = activeDropdown === dropdownId;
          const colorLetter = segmentClassToColorLetter(segment.className || 'unknown');
          
          // Skip empty segments
          if (colorLetter === '') return null;

          // Calculate position - tiny circle at bottom-right corner of segment
          const segmentRightPercent = ((segment.x + segment.width) / imageWidth) * 100;
          const segmentBottomPercent = ((segment.y + segment.height) / imageHeight) * 100;
          
          // Position at bottom-right corner with slight inset
          const badgeRightPercent = segmentRightPercent * 1.02;
          const badgeBottomPercent = segmentBottomPercent * 1.02;
          
          return (
            <div
              key={dropdownId}
              style={{
                position: 'absolute',
                right: `${100 - badgeRightPercent}%`,
                bottom: `${100 - badgeBottomPercent}%`,
                zIndex: isActive ? 1001 : 1,
              }}
            >
              {/* Tiny circle chevron button */}
              <button
                onClick={() => handleLabelClick(dropdownId)}
                title={`${colorLetter} - Click to change`}
                style={{
                  backgroundColor: palette[colorLetter]?.hex || '#94a3b8',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255,255,255,0.7)',
                  borderRadius: '50%',
                  padding: 0,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                }}
              >
                {/* Tiny chevron down icon */}
                <svg 
                  width="9" 
                  height="9" 
                  viewBox="0 0 10 10" 
                  fill="none" 
                  style={{
                    transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path 
                    d="M2 3.5L5 6.5L8 3.5" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              
              {isActive && (
                <div 
                  className="segment-dropdown"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '100%',
                    marginRight: '6px',
                    transform: 'translateY(-50%)',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    padding: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    minWidth: '140px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {sortedColors.map((letter) => (
                    <button
                      key={letter}
                      className="segment-dropdown-option"
                      onClick={() => handleColorSelect(tubeIdx, segIdx, letter)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '6px 8px',
                        border: 'none',
                        backgroundColor: letter === colorLetter ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                        color: '#e5e7eb',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                      onMouseEnter={(e) => {
                        if (letter !== colorLetter) {
                          e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (letter !== colorLetter) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: palette[letter]?.hex,
                          borderRadius: '3px',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      />
                      <span>{letter} - {palette[letter]?.name}</span>
                      {palette[letter]?.frequency ? (
                        <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.6 }}>
                          ({palette[letter].frequency})
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
