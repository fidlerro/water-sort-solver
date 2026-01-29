export class Stack {
  private items: string[];

  constructor(items: string[] = []) {
    this.items = [...items];
  }

  push(item: string) {
    this.items.push(item);
  }

  pop(): string | undefined {
    return this.items.pop();
  }

  top(): string | undefined {
    return this.items[this.items.length - 1];
  }

  full(): boolean {
    return this.items.length === 4;
  }

  empty(): boolean {
    return this.items.length === 0;
  }

  missingOne(): boolean {
    return this.items.length === 3 && this.monocolor();
  }

  monocolor(): boolean {
    return (
      this.items.length > 0 &&
      this.items.every((elem) => elem === this.items[0])
    );
  }

  solved(): boolean {
    return this.full() && this.monocolor();
  }

  getItems(): string[] {
    return [...this.items];
  }

  toString(): string {
    return this.items.join("").padEnd(4, " ");
  }
}
