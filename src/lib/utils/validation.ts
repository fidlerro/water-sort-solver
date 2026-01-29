export function normalizeTubeInput(input: string): string[] {
  const cleaned = input.trim().toUpperCase();
  if (!cleaned) return [];
  return cleaned.split("").filter((char) => /[A-P?]/.test(char));
}

export function isValidTubeInput(input: string): boolean {
  if (!input.trim()) return true;
  return /^[A-P?]{0,4}$/i.test(input.trim());
}
