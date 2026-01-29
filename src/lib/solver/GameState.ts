import { Stack } from "./Stack";

export class GameState {
  stacks: Stack[];

  constructor(array: string[][]) {
    this.stacks = [];
    for (const stack of array) {
      this.stacks.push(new Stack(stack));
    }
  }

  deepCopy(): GameState {
    const stacks = this.stacks.map((stack) => stack.getItems());
    return new GameState(stacks);
  }

  solved(): boolean {
    return this.stacks.every((stack) => stack.solved() || stack.empty());
  }

  isLegalMove(orig: number, dest: number): boolean {
    if (orig === dest) return false;
    if (this.stacks[dest].full()) return false;
    if (this.stacks[orig].empty() || this.stacks[orig].solved()) return false;
    if (this.stacks[dest].empty()) {
      return this.stacks[orig].monocolor() ? false : true;
    }
    if (this.stacks[orig].missingOne()) return false;
    if (this.stacks[orig].top() !== this.stacks[dest].top()) return false;
    return true;
  }

  getLegalMoves(): Array<[number, number]> {
    const legalMoves: Array<[number, number]> = [];
    for (let orig = 0; orig < this.stacks.length; orig++) {
      for (let dest = 0; dest < this.stacks.length; dest++) {
        if (this.isLegalMove(orig, dest)) {
          legalMoves.push([orig, dest]);
        }
      }
    }
    return legalMoves;
  }

  move(orig: number, dest: number): void {
    while (this.isLegalMove(orig, dest)) {
      const item = this.stacks[orig].pop();
      if (item) {
        this.stacks[dest].push(item);
      }
    }
  }

  getKey(): string {
    return this.stacksToKey(this.stacks);
  }

  stacksToKey(stacks: Stack[]): string {
    return stacks.map((stack) => stack.toString()).join("|");
  }

  keyToStacks(key: string): string[] {
    return key.split("|").map((split) => split.trimEnd());
  }
}
