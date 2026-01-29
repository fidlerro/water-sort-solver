import { GameState } from "./GameState";
import { solveState } from "./solver";

export interface UnknownSolveResult {
  solutions: string[][][];
  guaranteedMoves: Array<{ from: number; to: number; color: string }>;
  confidence: "high" | "medium" | "low";
  warnings: string[];
}

function getLetterCounts(tubes: string[][]) {
  const counts: Record<string, number> = {};
  for (const tube of tubes) {
    for (const c of tube) {
      if (c === "?") continue;
      counts[c] = (counts[c] ?? 0) + 1;
    }
  }
  return counts;
}

function getUnknownPositions(tubes: string[][]): Array<[number, number]> {
  const positions: Array<[number, number]> = [];
  tubes.forEach((tube, t) => {
    tube.forEach((c, i) => {
      if (c === "?") positions.push([t, i]);
    });
  });
  return positions;
}

function buildPossibleLetters(counts: Record<string, number>): string[] {
  const letters = Object.keys(counts);
  if (letters.length === 0) {
    return "ABCDEFGHIJKLMNOP".split("");
  }
  return letters.filter((letter) => counts[letter] < 4);
}

export function solveWithUnknowns(
  tubes: string[][],
  maxPermutations = 40,
): UnknownSolveResult {
  const warnings: string[] = [];
  const unknownPositions = getUnknownPositions(tubes);
  const counts = getLetterCounts(tubes);
  const possibleLetters = buildPossibleLetters(counts);

  if (unknownPositions.length === 0) {
    const state = new GameState(tubes);
    const solution = solveState(state);
    return {
      solutions: solution.length ? [solution] : [],
      guaranteedMoves: [],
      confidence: solution.length ? "high" : "low",
      warnings: solution.length ? [] : ["No solution found."],
    };
  }

  if (possibleLetters.length === 0) {
    warnings.push("No available colors for unknown segments.");
    return {
      solutions: [],
      guaranteedMoves: [],
      confidence: "low",
      warnings,
    };
  }

  const solutions: string[][][] = [];
  const permutations: string[][][] = [];

  function backtrack(index: number, current: string[][]) {
    if (permutations.length >= maxPermutations) return;
    if (index >= unknownPositions.length) {
      permutations.push(current.map((tube) => [...tube]));
      return;
    }

    const [tubeIndex, colorIndex] = unknownPositions[index];
    for (const letter of possibleLetters) {
      if ((counts[letter] ?? 0) >= 4) continue;
      counts[letter] = (counts[letter] ?? 0) + 1;
      current[tubeIndex][colorIndex] = letter;
      backtrack(index + 1, current);
      current[tubeIndex][colorIndex] = "?";
      counts[letter] -= 1;
    }
  }

  backtrack(
    0,
    tubes.map((tube) => [...tube]),
  );

  for (const permutation of permutations) {
    const state = new GameState(permutation);
    const solution = solveState(state);
    if (solution.length) {
      solutions.push(solution);
    }
  }

  if (solutions.length === 0) {
    warnings.push("No solvable permutations found for unknown colors.");
    return {
      solutions: [],
      guaranteedMoves: [],
      confidence: "low",
      warnings,
    };
  }

  const moveSets = solutions.map((solution) => solution.slice(1));
  const minSteps = Math.min(...moveSets.map((steps) => steps.length));
  const guaranteedMoves: Array<{ from: number; to: number; color: string }> =
    [];

  for (let i = 0; i < minSteps; i++) {
    const first = moveSets[0][i];
    const prev = solutions[0][i];
    const diff = getDiff(prev, first);
    if (!diff) break;

    const isGuaranteed = moveSets.every((steps, idx) => {
      const prevState = solutions[idx][i];
      const nextState = steps[i];
      const nextDiff = getDiff(prevState, nextState);
      return (
        nextDiff &&
        nextDiff.from === diff.from &&
        nextDiff.to === diff.to &&
        nextDiff.color === diff.color
      );
    });

    if (!isGuaranteed) break;
    guaranteedMoves.push(diff);
  }

  const confidence: "high" | "medium" | "low" =
    unknownPositions.length <= 2 ? "medium" : "low";

  return {
    solutions,
    guaranteedMoves,
    confidence,
    warnings,
  };
}

function getDiff(previous: string[], next: string[]) {
  let fromIndex = -1;
  let toIndex = -1;
  let color = "";

  for (let i = 0; i < previous.length; i++) {
    if (previous[i] !== next[i]) {
      const prevLen = previous[i].trimEnd().length;
      const nextLen = next[i].trimEnd().length;
      if (nextLen > prevLen) {
        toIndex = i;
        color = next[i].trimEnd().slice(-1);
      } else if (prevLen > nextLen) {
        fromIndex = i;
        color = previous[i].trimEnd().slice(-1);
      }
    }
  }

  if (fromIndex >= 0 && toIndex >= 0) {
    return { from: fromIndex, to: toIndex, color };
  }
  return null;
}
