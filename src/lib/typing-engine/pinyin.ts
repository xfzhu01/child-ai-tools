/** Normalize pinyin for typing comparison (no tones, lowercase, ü→v). */
export function normalizePinyin(input: string): string {
  return input
    .toLowerCase()
    .replace(/ü/g, "v")
    .replace(/[āáǎà]/g, "a")
    .replace(/[ēéěè]/g, "e")
    .replace(/[īíǐì]/g, "i")
    .replace(/[ōóǒò]/g, "o")
    .replace(/[ūúǔù]/g, "u")
    .replace(/[ǖǘǚǜ]/g, "v");
}

export function matchPinyinKeystroke(input: string, expected: string): boolean {
  if (expected === " ") return input === " ";
  return normalizePinyin(input) === normalizePinyin(expected);
}

/** Last syllable pinyin of an idiom (for chain validation). */
export function lastSyllable(pinyin: string): string {
  const parts = normalizePinyin(pinyin).trim().split(/\s+/);
  return parts[parts.length - 1] ?? "";
}

/** First syllable pinyin of an idiom. */
export function firstSyllable(pinyin: string): string {
  const parts = normalizePinyin(pinyin).trim().split(/\s+/);
  return parts[0] ?? "";
}
