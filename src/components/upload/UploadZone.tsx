import React from "react";
import Button from "../shared/Button";
import SegmentOverlay from "../analysis/SegmentOverlay";
import ProcessingIndicator from "./ProcessingIndicator";
import { ColorPalette, PuzzleConfiguration } from "../../types/puzzle";
import PlaybackControls from "../shared/PlaybackControls";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  previewUrl?: string | null;
  detectionData?: {
    tubes: Array<{
      segments: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        confidence: number;
        className?: string;
      }>;
      centerX: number;
      centerY?: number;
    }>;
    imageWidth: number;
    imageHeight: number;
    confidence?: number;
  } | null;
  palette?: ColorPalette;
  onConfigurationChange?: (config: PuzzleConfiguration) => void;
  isProcessing?: boolean;
  onPlay?: () => void;
}

export default function UploadZone({
  onFileSelected,
  previewUrl,
  detectionData,
  palette,
  onConfigurationChange,
  isProcessing,
  onPlay,
}: UploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSampleSelect = async (filename: string) => {
      try {
          const response = await fetch(`/samples/${filename}`);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: "image/png" });
          onFileSelected(file);
          setIsMenuOpen(false);
      } catch (error) {
          console.error("Failed to load sample:", error);
      }
  };

  const handleReupload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="upload-zone">
      {!previewUrl && (
        <>
          <h2 className="section-title">Upload Game Screenshot</h2>
          <p className="muted">
            tap to upload or drag and drop
          </p>
          <br />
          <br />
          
          <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleReupload} style={{ borderRadius: '8px 0 0 8px' }}>
                    Select Image
                </Button>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0 8px 8px 0',
                        padding: '0 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: '1px solid rgba(0,0,0,0.2)'
                    }}
                >
                    ▼
                </button>
            </div>

            {isMenuOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    textAlign: 'left'
                }}>
                    <div 
                        onClick={() => {
                            setIsMenuOpen(false);
                            handleReupload();
                        }}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border)',
                            background: 'var(--card-bg)',
                            color: 'var(--text)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
                    >
                        📁 On my device
                    </div>
                    {[
                        { label: '7 Tube Sample', file: 'sample-7.png' },
                        { label: '9 Tube Sample', file: 'sample-9.png' },
                        { label: '12 Tube Sample', file: 'sample-12.png' },
                        { label: '14 Tube Sample', file: 'sample-14.png' },
                        { label: '16 Tube Sample', file: 'sample-16.png' },
                    ].map((sample) => (
                        <div
                            key={sample.file}
                            onClick={() => handleSampleSelect(sample.file)}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '0.9em'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                e.currentTarget.style.color = 'var(--text)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            🧪 {sample.label}
                        </div>
                    ))}
                </div>
            )}
          </div>
        </>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelected(file);
          }
        }}
      />
      
      {previewUrl && (
        <div style={{ position: 'relative', marginTop: 16 }}>
          {detectionData && palette && onConfigurationChange ? (
            <>
              <div style={{ position: 'relative' }}>
                <SegmentOverlay
                  imageUrl={previewUrl}
                  tubes={detectionData.tubes}
                  palette={palette}
                  imageWidth={detectionData.imageWidth}
                  imageHeight={detectionData.imageHeight}
                  confidence={detectionData.confidence}
                  onSegmentColorChange={(tubeIdx, segIdx, newColor) => {
                    // Get the handler from ConfigReview (set via window for communication)
                    if ((window as any).__handleSegmentColorChange) {
                      (window as any).__handleSegmentColorChange(tubeIdx, segIdx, newColor);
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <img
              className="upload-preview"
              src={previewUrl}
              alt="Screenshot preview"
              style={{ width: '88%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: 12 }}
            />
          )}
          <ProcessingIndicator isProcessing={isProcessing || false} />
        </div>
      )}
    </div>
  );
}
