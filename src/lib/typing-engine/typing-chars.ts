/** Map full-width / Chinese punctuation to keyboard punctuation for typing drills. */
const TYPING_CHAR_ALIASES: Record<string, string> = {
  "，": ",",
  "。": ".",
  "．": ".",
  "？": "?",
  "！": "!",
  "：": ":",
  "；": ";",
  "“": '"',
  "”": '"',
  "‘": "'",
  "’": "'",
  "（": "(",
  "）": ")",
  "【": "[",
  "】": "]",
  "《": "<",
  "》": ">",
};

export function normalizeTypingChar(char: string): string {
  if (char.length !== 1) return char;
  return TYPING_CHAR_ALIASES[char] ?? char;
}

export function normalizeTypingText(text: string): string {
  return Array.from(text, normalizeTypingChar).join("");
}
