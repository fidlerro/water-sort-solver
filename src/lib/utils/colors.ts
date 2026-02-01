import { ColorPalette } from "../../types/puzzle";

export const DEFAULT_COLOR_MAP: Record<string, { hex: string; name: string }> =
  {
    A: { hex: "#473CC6", name: "Royal Indigo" },
    B: { hex: "#C42B23", name: "Crimson Red" },
    C: { hex: "#7A1E2F", name: "Burgundy Crimson" },
    D: { hex: "#A51878", name: "Royal Magenta" },
    E: { hex: "#845C21", name: "Burnished Bronze" },
    F: { hex: "#E65C69", name: "Rose Coral" },
    G: { hex: "#5CA9E0", name: "Sky Azure" },
    H: { hex: "#8730CF", name: "Electric Violet" },
    I: { hex: "#E88A27", name: "Amber Orange" },
    J: { hex: "#2BC853", name: "Emerald Green" },
    K: { hex: "#276721", name: "Forest Green" },
    L: { hex: "#E6A8D8", name: "Lavender Blush" },
    M: { hex: "#7A7A7A", name: "Steel Gray" },
    N: { hex: "#D28D6A", name: "Soft Copper" },
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
