import { useCallback, useState } from "react";
import { PuzzleConfiguration } from "../types/puzzle";
import { Solution, SolutionStep } from "../types/solution";
import { GameState } from "../lib/solver/GameState";
import { diffMove, solveState } from "../lib/solver/solver";
import { solveWithUnknowns } from "../lib/solver/unknownSolver";

export function usePuzzleSolver() {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [states, setStates] = useState<string[][]>([]);
  const [guaranteedMoves, setGuaranteedMoves] = useState<
    Array<{ from: number; to: number; color: string }>
  >([]);

  const solve = useCallback((config: PuzzleConfiguration) => {
    const tubes = config.tubes.map((tube) =>
      tube.colors.map((color) => color.toString()),
    );
    const hasUnknowns = tubes.some((tube) => tube.includes("?"));

    if (hasUnknowns) {
      const result = solveWithUnknowns(tubes);
      if (!result.solutions.length) {
        setSolution({
          steps: [],
          totalMoves: 0,
          confidence: "low",
          warnings: result.warnings,
        });
        setStates([]);
        setGuaranteedMoves([]);
        return;
      }

      const activeSolution = result.solutions[0];
      const steps = buildSteps(activeSolution);
      setSolution({
        steps,
        totalMoves: steps.length,
        confidence: result.confidence,
        warnings: result.warnings,
      });
      setStates(activeSolution);
      setGuaranteedMoves(result.guaranteedMoves);
      return;
    }

    const state = new GameState(tubes);
    const solved = solveState(state);
    if (!solved.length) {
      setSolution({
        steps: [],
        totalMoves: 0,
        confidence: "low",
        warnings: ["No solution found."],
      });
      setStates([]);
      setGuaranteedMoves([]);
      return;
    }

    const steps = buildSteps(solved);
    setSolution({
      steps,
      totalMoves: steps.length,
      confidence: "high",
    });
    setStates(solved);
    setGuaranteedMoves([]);
  }, []);

  return { solution, states, guaranteedMoves, solve };
}

function buildSteps(solved: string[][]): SolutionStep[] {
  const steps: SolutionStep[] = [];

  for (let i = 1; i < solved.length; i++) {
    const previous = solved[i - 1];
    const current = solved[i];
    const diff = diffMove(previous, current);
    if (!diff) continue;

    steps.push({
      stepNumber: i,
      from: diff.from + 1,
      to: diff.to + 1,
      color: diff.color || "Unknown",
      tubeStates: current,
      description: `Move tube ${diff.from + 1} to tube ${diff.to + 1}`,
    });
  }

  return steps;
}
