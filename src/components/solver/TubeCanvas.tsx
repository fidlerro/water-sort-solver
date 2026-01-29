import React, { useEffect, useRef } from "react";
import { ColorPalette } from "../../types/puzzle";
import { drawTubes } from "../../lib/canvas/TubeRenderer";

interface TubeCanvasProps {
  tubeStates: string[];
  palette: ColorPalette;
}

export default function TubeCanvas({ tubeStates, palette }: TubeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawTubes(canvasRef.current, tubeStates, palette);
    }
  }, [tubeStates, palette]);

  return (
    <div className="canvas-wrap">
      <canvas ref={canvasRef} width={420} height={520} />
    </div>
  );
}
