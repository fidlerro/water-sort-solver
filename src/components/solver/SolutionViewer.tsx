import React, { useMemo, useRef } from "react";
import { Solution } from "../../types/solution";
import { ColorPalette } from "../../types/puzzle";
import TubeCanvas from "./TubeCanvas";
import MoveDescription from "./MoveDescription";
import { useGestures } from "../../hooks/useGestures";
import PlaybackControls from "../shared/PlaybackControls";

interface SolutionViewerProps {
  solution: Solution;
  states: string[][];
  palette: ColorPalette;
  stepIndex: number;
  onStepChange: (next: number) => void;
  guaranteedMoves: Array<{ from: number; to: number; color: string }>;
  onReset?: () => void;
  detectionData?: {
    tubes: Array<{
      segments: any[];
      centerX: number;
      centerY?: number;
      box?: { x: number; y: number; width: number; height: number };
    }>;
    imageWidth: number;
    imageHeight: number;
  };
  imageUrl?: string;
}

export default function SolutionViewer({
  solution,
  states,
  palette,
  stepIndex,
  onStepChange,
  guaranteedMoves,
  onReset,
  detectionData,
  imageUrl,
}: SolutionViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debug: Log detection data directly to console for user inspection
  React.useEffect(() => {
    if (detectionData) {
      console.log("🔍 [SolutionViewer] Logic Data:", detectionData);
      console.log("   - Tubes detected:", detectionData.tubes.length);
      detectionData.tubes.forEach((t, i) => {
        console.log(`   - Tube ${i}:`, t);
      });
    }
  }, [detectionData]);

  useGestures(containerRef, {
    onSwipeLeft: () => {
      if (stepIndex < solution.steps.length - 1) onStepChange(stepIndex + 1);
    },
    onSwipeRight: () => {
      if (stepIndex > 0) onStepChange(stepIndex - 1);
    },
  });

  const currentStep = solution.steps[stepIndex];
  const tubeStates = useMemo(() => {
    if (states.length === 0) return [];
    return states[Math.min(stepIndex + 1, states.length - 1)];
  }, [states, stepIndex]);

  const warning = guaranteedMoves.length
    ? `Guaranteed moves available: ${guaranteedMoves.length}`
    : undefined;

  // Reality View Logic
  const renderRealityView = () => {
    if (!detectionData || !imageUrl) return null;

    return (
      <div style={{ position: 'relative', width: '88%', margin: '0 auto', display: 'block' }}>
        {/* Blurred Background Image */}
        <img
          src={imageUrl}
          alt="Original Board"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            filter: 'blur(4px) brightness(0.6)', 
            borderRadius: '12px',
          }}
        />

        {/* Overlay Tubes */}
        {detectionData.tubes.map((tube, tubeIdx) => {
           let left = 0, top = 0, width = 0, height = 0;

           // Strategy 1: Use the explicit bounding box from detection (Best)
           if (tube.box) {
               left = tube.box.x;
               top = tube.box.y;
               width = tube.box.width;
               height = tube.box.height;
           } 
           // Strategy 2: Derive from segments (Fallback)
           else if (tube.segments && tube.segments.length > 0) {
               // Find min x, min y, max width, total height
               const xs = tube.segments.map(s => s.x);
               const ys = tube.segments.map(s => s.y);
               const widths = tube.segments.map(s => s.width);
               const heights = tube.segments.map(s => s.height);
               
               left = Math.min(...xs);
               const topSegY = Math.min(...ys);
               const contentBottom = Math.max(...ys.map((y, i) => y + heights[i]));
               
               width = Math.max(...widths);
               // Estimate tube height. Segments usually only cover liquid.
               // We'll trust the liquid height but add a bit of padding or fixed aspect ratio if needed.
               // Actually, for "Reality," we want to overlay exactly where the liquid *is*.
               // But the user wants to see the "Tube".
               // Let's approximate tube height as roughly 4.5x width if we only have segments?
               // No, let's try to trust the content height but maybe clamp it?
               // Actually, the previous issue was *too tall*.
               // Let's use the content height + a small top buffer for the empty space.
               
               const contentHeight = contentBottom - topSegY;
               // Heuristic: A tube is usually ~4x its width.
               // If content is small, we should still show a full tube?
               // Let's default to the detected content box for now to ensure alignment.
               height = contentHeight;
               top = topSegY;
               
               // If we only detected liquid, the tube top is higher.
               // Let's extend height upwards by width * 1.5? (Approximation)
               // top -= width * 1.0;
               // height += width * 1.0;
           } else {
               return null; 
           }

           // Convert to percentages
           const leftPercent = (left / detectionData.imageWidth) * 100;
           const topPercent = (top / detectionData.imageHeight) * 100;
           const widthPercent = (width / detectionData.imageWidth) * 100;
           const heightPercent = (height / detectionData.imageHeight) * 100;

           const currentColors = tubeStates[tubeIdx] || "";
           const colorChars = currentColors.split('');
           
           return (
             <div
               key={tubeIdx}
               style={{
                 position: 'absolute',
                 left: `${leftPercent}%`,
                 top: `${topPercent}%`, 
                 width: `${widthPercent}%`,
                 height: `${heightPercent}%`,
                 // We don't want to translate anymore if we have exact coords
               }}
             >
                <RealityTube 
                   colors={colorChars} 
                   palette={palette} 
                />
             </div>
           );
        })}
      </div>
    );
  };

  return (
    <div className="card" ref={containerRef} style={{ position: 'relative', minHeight: 600 }}>
       {/* Use Reality View if data available, else Canvas */}
       {detectionData && imageUrl ? (
         renderRealityView()
       ) : (
         <div className="canvas-wrap">
           <TubeCanvas tubeStates={tubeStates} palette={palette} />
         </div>
       )}

      <MoveDescription step={currentStep} warning={warning} />
      
      <div style={{ height: 60 }} /> {/* Spacer for controls */}
    </div>
  );
}

// Improved Reality Tube with glass effect and distinct segments
function RealityTube({ colors, palette }: { colors: string[], palette: ColorPalette }) {
    const capacity = 4;
    
    // Create 4 slots (bottom to top)
    const slots = [];
    for (let i = 0; i < capacity; i++) {
        // colors array is likely ["R", "G", "B"] where 0 is bottom
        const colorChar = colors[i];
        slots.push(colorChar ? palette[colorChar]?.hex : null);
    }
    
    return (
        <div style={{
            width: '100%',
            height: '100%',
            border: '2px solid rgba(255,255,255,0.6)',
            borderTop: '1px solid rgba(255,255,255,0.3)', 
            borderBottom: '4px solid rgba(255,255,255,0.4)', 
            borderRadius: '0 0 20px 20px', 
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.1) 80%, rgba(255,255,255,0.2))',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column-reverse',
            boxShadow: '0 10px 15px rgba(0,0,0,0.3)'
        }}>
            {slots.map((hex, i) => (
                <div key={i} style={{
                    height: '25%', // 1/4th of tube
                    width: '100%',
                    background: hex || 'transparent',
                    transition: 'background 0.3s ease',
                    boxShadow: hex ? 'inset 0 0 10px rgba(0,0,0,0.2)' : 'none',
                    position: 'relative',
                }}>
                   {/* Meniscus / Surface highlight for filled liquid */}
                   {hex && (
                       <div style={{
                           position: 'absolute',
                           top: 0, left: 0, right: 0, height: '40%',
                           background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
                       }} />
                   )}
                </div>
            ))}
        </div>
    );
}
