import React, { useState, useEffect } from "react";

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`help-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      {/* Help Content Panel */}
      <div className={`help-panel ${isOpen ? 'open' : ''}`}>
        <div className="help-content">
          <h2>How to Use Water Sort Solver</h2>
          
          <div className="help-section">
            <h3>1. Upload & Analyze</h3>
            <p>Take a screenshot of your Water Sort puzzle and upload it. The AI will automatically detect tubes and colors.</p>
          </div>

          <div className="help-section">
            <h3>2. Verify & Edit</h3>
            <p>Check the detection. If a color is wrong, click the small <b>chevron icon</b> on the segment to change it.</p>
          </div>

          <div className="help-section">
            <h3>3. Solve</h3>
            <p>Click <b>PLAY</b> on the VCR controls to generate a solution.</p>
          </div>

          <div className="help-section">
            <h3>4. Step Through</h3>
            <p>Use the VCR controls (<b>FWD</b>, <b>REV</b>) to walk through the solution step-by-step.</p>
          </div>
          
          <div className="help-footer">
            <button className="button ghost" onClick={onClose}>Close Help</button>
          </div>
        </div>
      </div>

      <style>{`
        .help-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          z-index: 1900;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .help-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .help-panel {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1950;
          background: var(--bg-2);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          transform: translateY(-100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 80vh;
          overflow-y: auto;
        }

        .help-panel.open {
          transform: translateY(0);
        }

        .help-content {
          max-width: 600px;
          margin: 0 auto;
          padding: 80px 24px 100px; /* Top padding accounts for header, bottom for footer */
        }

        .help-content h2 {
          margin-bottom: 24px;
          color: var(--primary);
        }

        .help-section {
          margin-bottom: 20px;
        }

        .help-section h3 {
          font-size: 16px;
          margin-bottom: 8px;
          color: var(--text);
        }

        .help-section p {
          color: var(--muted);
          line-height: 1.5;
          font-size: 14px;
        }

        .help-footer {
          margin-top: 32px;
          text-align: center;
        }
      `}</style>
    </>
  );
}
