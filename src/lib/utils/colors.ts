import { ColorPalette } from "../../types/puzzle";

export const DEFAULT_COLOR_MAP: Record<string, { hex: string; name: string }> =
  {
    A: { hex: "#ef4444", name: "Red" },
    B: { hex: "#3b82f6", name: "Blue" },
    C: { hex: "#22c55e", name: "Green" },
    D: { hex: "#f59e0b", name: "Amber" },
    E: { hex: "#a855f7", name: "Purple" },
    F: { hex: "#14b8a6", name: "Teal" },
    G: { hex: "#f97316", name: "Orange" },
    H: { hex: "#e11d48", name: "Rose" },
    I: { hex: "#0ea5e9", name: "Sky" },
    J: { hex: "#84cc16", name: "Lime" },
    K: { hex: "#f472b6", name: "Pink" },
    L: { hex: "#10b981", name: "Emerald" },
    M: { hex: "#6366f1", name: "Indigo" },
    N: { hex: "#facc15", name: "Yellow" },
    O: { hex: "#94a3b8", name: "Slate" },
    P: { hex: "#06b6d4", name: "Cyan" },
  };

export function buildPaletteFromTubes(tubes: string[][]): ColorPalette {
  const palette: ColorPalette = {};
  const counts: Record<string, number> = {};
  for (const tube of tubes) {
    for (const color of tube) {
      if (color === "?") continue;
      counts[color] = (counts[color] ?? 0) + 1;
    }
  }

  const letters = Object.keys(counts).length
    ? Object.keys(counts)
    : Object.keys(DEFAULT_COLOR_MAP);

  letters.forEach((letter) => {
    const base = DEFAULT_COLOR_MAP[letter] ?? {
      hex: "#94a3b8",
      name: `Color ${letter}`,
    };
    palette[letter] = {
      hex: base.hex,
      name: base.name,
      frequency: counts[letter] ?? 0,
    };
  });

  return palette;
}

export function getColorHex(letter: string, palette: ColorPalette): string {
  if (letter === "?") return "#111827";
  return palette[letter]?.hex ?? DEFAULT_COLOR_MAP[letter]?.hex ?? "#94a3b8";
}
