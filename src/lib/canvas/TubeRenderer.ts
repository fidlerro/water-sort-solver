import { ColorPalette } from "../../types/puzzle";
import { getColorHex } from "../utils/colors";

export interface TubeRenderOptions {
  background: string;
  stroke: string;
}

export function drawTubes(
  canvas: HTMLCanvasElement,
  tubeStates: string[],
  palette: ColorPalette,
  options: TubeRenderOptions = {
    background: "#111827",
    stroke: "#e5e7eb",
  },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = 420;
  const height = 520;
  const scale = window.devicePixelRatio || 1;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = options.stroke;
  ctx.lineWidth = 2;
  ctx.font = "14px Inter";
  ctx.fillStyle = "#e5e7eb";

  const radius = 18;
  const tubeHeight = radius * 7;
  const x0 = 40;
  const y0 = 40;
  const spacing = radius * 3;
  const gap = radius * 2;

  let row = 0;
  let column = 0;

  tubeStates.forEach((stack, index) => {
    const x = x0 + column * spacing;
    const y = y0 + (tubeHeight + radius + gap) * row;

    drawTube(ctx, x, y, radius * 2, tubeHeight);
    drawTubeNumber(ctx, index + 1, x, y, radius * 2);

    const colors = [...stack.padEnd(4, " ")].reverse();
    const segments = colors.map((letter) =>
      getColorHex(letter.trim(), palette),
    );
    fillSegments(ctx, x, y, radius * 2, tubeHeight, segments);

    column++;
    if ((index + 1) % 6 === 0) {
      column = 0;
      row++;
    }
  });
}

function drawTube(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.arc(x + width / 2, y + height, width / 2, 0, Math.PI, false);
  ctx.closePath();
  ctx.stroke();
}

function drawTubeNumber(
  ctx: CanvasRenderingContext2D,
  number: number,
  x: number,
  y: number,
  width: number,
) {
  const text = number.toString();
  const metrics = ctx.measureText(text);
  ctx.fillText(text, x + (width - metrics.width) / 2, y - 4);
}

function fillSegments(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: string[],
) {
  const dy = height / 8;
  const pad = ctx.lineWidth / 2;
  const x1 = x + pad;
  const x2 = x + width - pad;

  fillRect(ctx, x1, y + 1 * dy, x2, y + 3 * dy, colors[3]);
  fillRect(ctx, x1, y + 3 * dy, x2, y + 5 * dy, colors[2]);
  fillRect(ctx, x1, y + 5 * dy, x2, y + 7 * dy, colors[1]);
  fillBottom(ctx, x1, y + 7 * dy, x2, y + 8 * dy, colors[0]);
}

function fillRect(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x1, y2);
  ctx.closePath();
  ctx.fillStyle = color || "#111827";
  ctx.fill();
}

function fillBottom(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1, y2);
  const radius = (x2 - x1) / 2;
  ctx.arc((x2 + x1) / 2, y2, radius, Math.PI, 0, true);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2, y1);
  ctx.closePath();
  ctx.fillStyle = color || "#111827";
  ctx.fill();
}
