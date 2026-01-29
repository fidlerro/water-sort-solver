import { GameState } from "./GameState";

export function solveState(initial: GameState, maxNodes = 50000): string[][] {
  const stack = [initial];
  const visited = new Set<string>([initial.getKey()]);
  const parent: Record<string, string | undefined> = {};

  let nodes = 0;
  while (stack.length > 0 && nodes < maxNodes) {
    const currentState = stack.pop();
    if (!currentState) break;
    nodes++;
    if (currentState.solved()) {
      let currentKey = currentState.getKey();
      const steps = [currentState.keyToStacks(currentKey)];
      while (currentKey !== initial.getKey()) {
        const parentKey = parent[currentKey];
        if (!parentKey) break;
        steps.push(currentState.keyToStacks(parentKey));
        currentKey = parentKey;
      }
      return steps.reverse();
    }

    for (const move of currentState.getLegalMoves()) {
      const newState = currentState.deepCopy();
      newState.move(move[0], move[1]);
      const key = newState.getKey();
      if (!visited.has(key)) {
        stack.push(newState);
        parent[key] = currentState.getKey();
        visited.add(key);
      }
    }
  }

  return [];
}

export function diffMove(
  previous: string[],
  next: string[],
): { from: number; to: number; color: string } | null {
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
