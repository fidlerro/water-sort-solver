import React, { useState } from "react";

interface PlaybackControlsProps {
  mode: "analysis" | "solution";
  onPlay?: () => void; // Solve / Start
  onPause?: () => void; // Stop / Reset
  onUpload?: () => void; // Change Image
  onNext?: () => void;
  onPrev?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  currentStep?: number;
  totalSteps?: number;
  detectionInfo?: {
    tubes: number;
    segments: number;
    colors: number;
    confidence: number;
  };
}

export default function PlaybackControls({
  mode,
  onPlay,
  onPause,
  onUpload,
  onNext,
  onPrev,
  onFirst,
  onLast,
  currentStep = 0,
  totalSteps = 0,
  detectionInfo,
}: PlaybackControlsProps) {

  const isAnalysis = mode === 'analysis';
  const isSolution = mode === 'solution';



  return (
    <div className="vcr-controls-container">
      <div className="vcr-faceplate">
        
        {/* Left: Eject/Power Area */}
        <div className="control-section left">
          <button onClick={onUpload} className="vcr-btn wide" title="Eject / Reset">
            <span className="btn-text">EJECT</span>
            <div className="btn-indicator"></div>
          </button>
        </div>

        {/* Center: Window Display */}
        <div className="display-window">
          <div className="vcr-screen">
            {isAnalysis && detectionInfo ? (
              <div className="led-text-compact">
                 <span className="led-label">TUBES</span>
                 <span className="led-val">{detectionInfo.tubes}</span>
                 <span className="led-sep">|</span>
                 <span className="led-label">CONF</span>
                 <span className="led-val">{detectionInfo.confidence}%</span>
              </div>
            ) : isSolution ? (
              <div className="led-text-compact solution">
                <span className="icon-play-indicator">▶</span>
                <span className="led-val">
                  {String(currentStep + 1).padStart(2, '0')}:{String(totalSteps).padStart(2, '0')}
                </span>
                <span className="led-mode">SP</span>
              </div>
            ) : (
              <div className="led-text-compact">--:--</div>
            )}
          </div>
          <div className="display-gloss"></div>
        </div>

        {/* Right: Transport Controls */}
        <div className="control-section right">
           <div className="button-row">
            <button 
                onClick={onPrev} 
                disabled={!isSolution || currentStep <= 0} 
                className="vcr-btn pill" 
                title="Step Back"
              >
                <div className="icon-prev"></div>
              </button>
              
              <button 
                onClick={onPlay} 
                disabled={!isAnalysis} 
                className="vcr-btn pill main-play" 
                title="Solve / Play"
              >
                <div className="icon-play"></div>
              </button>

              <button 
                onClick={onNext} 
                disabled={!isSolution || currentStep >= totalSteps - 1} 
                className="vcr-btn pill" 
                title="Step Forward"
              >
                <div className="icon-next"></div>
              </button>

              <button 
                onClick={onPause} 
                disabled={!isSolution} 
                className="vcr-btn pill" 
                title="Stop"
              >
                <div className="icon-stop"></div>
              </button>
           </div>
           <div className="labels-row">
             <span>REV</span>
             <span>PLAY</span>
             <span>FWD</span>
             <span>STOP</span>
           </div>
        </div>

      </div>

      <style>{`
        .vcr-controls-container {
          position: relative; /* Part of the flex flow now */
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: center;
          /* Drop shadow to separate from content */
          filter: drop-shadow(0 -4px 6px rgba(0,0,0,0.3));
          flex-shrink: 0; /* Don't shrink */
          margin-top: 12px; /* Visual gap from content */
          margin-bottom: 12px; /* Visual gap from bottom edge */
        }
        
        .vcr-faceplate {
          width: 100%;
          max-width: 800px; /* Match main container limit */
          height: 64px; 
          background: linear-gradient(to bottom, #3a3a3a 0%, #222 10%, #1a1a1a 100%);
          border-top: 1px solid #555;
          /* Add side borders for standalone feel when centered */
          border-left: 1px solid #555;
          border-right: 1px solid #555;
          border-radius: 4px 4px 0 0; /* Rounded top corners */
          display: flex;
          align-items: center;
          justify-content: center; /* Center everything */
          padding: 0 16px;
          gap: 16px; /* Reduced gap */
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
          position: relative;
        }

        /* Sculpted curve accent at the top */
        .vcr-faceplate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
          pointer-events: none;
        }

        .control-section {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        
        .control-section.right {
          flex-direction: column;
          gap: 2px;
        }

        .display-window {
          flex: 1;
          max-width: 200px; /* Slightly compacted */
          height: 32px;
          background: #000;
          border-radius: 16px;
          border: 2px solid #333;
          border-bottom-color: #444; 
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.8);
          position: relative;
          display: flex;
          align-items: center;
          overflow: hidden; /* Mask marquee */
        }

        .display-gloss {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
          border-radius: 14px 14px 0 0;
          pointer-events: none;
          z-index: 5;
        }

        .vcr-screen {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          z-index: 2;
          white-space: nowrap;
          padding: 0 12px;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .led-text-compact {
          display: inline-flex;
          align-items: center;
          gap: 8px; /* Space between items */
          font-size: 13px;
          font-weight: 700;
          text-shadow: 0 0 5px rgba(0,255,0,0.6);
          letter-spacing: 1px;
          
          /* Marquee Logic */
          animation: marquee 8s linear infinite;
        }
        
        /* Only animate if we suspect overflow or just always slowly pan? 
           Better: minimal animation or only on small screens. 
           For now, straight flex, but let's add a scroll behavior if needed.
        */
        @media (max-width: 500px) {
           .led-text-compact {
              animation: marquee 10s linear infinite;
              padding-left: 100%; /* Start off screen */
           }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        .led-mode {
          font-size: 10px;
          opacity: 0.8;
          color: #f59e0b; 
        }
        
        .icon-play-indicator {
          font-size: 10px;
          margin-right: 4px;
          animation: blink 2s infinite;
        }

        .vcr-btn {
          background: linear-gradient(to bottom, #444, #2a2a2a);
          border: 1px solid #111;
          border-top-color: #555;
          color: #ccc;
          cursor: pointer;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          transition: all 0.1s;
        }
        
        .vcr-btn:active:not(:disabled) {
          transform: translateY(1px);
          background: #222;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
        }

        .vcr-btn:disabled {
          opacity: 0.4;
          cursor: default;
          filter: grayscale(1);
        }

        /* Eject Button Style */
        .vcr-btn.wide {
          height: 24px;
          padding: 0 12px; /* reduced padding */
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: #2a2a2a;
        }
        
        .btn-indicator {
           width: 4px;
           height: 4px;
           background: #444;
           border-radius: 50%;
        }

        /* Transport Buttons Style */
        .button-row {
          display: flex;
          gap: 8px; /* Reduced gap */
        }
        
        .vcr-btn.pill {
          width: 38px; /* Slightly narrowed */
          height: 20px;
          border-radius: 2px; 
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 2px solid #111; 
        }

        .vcr-btn.main-play {
          background: linear-gradient(to bottom, #555, #333);
          width: 46px; 
        }

        .labels-row {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0 4px;
          font-family: sans-serif;
          font-size: 7px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          pointer-events: none;
        }

        
        /* Icons */
        .icon-play {
          width: 0; 
          height: 0; 
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          border-left: 7px solid #ccc;
        }
        
        .icon-stop {
          width: 7px; height: 7px; background: #ccc;
        }
        
        .icon-prev::after {
          content: '';
          display: block;
          width: 0; height: 0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-right: 5px solid #ccc;
        }
        .icon-prev::before {
          content: '';
          display: block;
          width: 0; height: 0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-right: 5px solid #ccc;
          margin-left: -2px;
        }
        .icon-prev { display: flex; }

        .icon-next::after {
          content: '';
          display: block;
          width: 0; height: 0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-left: 5px solid #ccc;
          margin-left: -2px;
        }
        .icon-next::before {
          content: '';
          display: block;
          width: 0; height: 0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-left: 5px solid #ccc;
        }
        .icon-next { display: flex; }

        @media (max-width: 600px) {
          .vcr-faceplate {
            padding: 0 12px;
          }
           .display-window {
             max-width: 140px;
           }
           .led-text-compact {
             font-size: 11px;
           }
           .labels-row {
             display: none; /* Hide labels on mobile to save space */
           }
           .vcr-btn.pill {
             width: 36px;
           }
        }
      `}</style>
    </div>
  );
}
