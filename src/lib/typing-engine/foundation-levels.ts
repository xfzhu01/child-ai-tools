/** Traditional touch-typing order: home row outward (f/j index anchors first). */
export const FOUNDATION_LETTER_ORDER = [
  "f",
  "j",
  "d",
  "k",
  "s",
  "l",
  "a",
  "g",
  "h",
  "r",
  "u",
  "e",
  "i",
  "t",
  "y",
  "w",
  "o",
  "q",
  "p",
  "n",
  "m",
  "v",
  "c",
  "b",
  "x",
  "z",
] as const;

export type FoundationLevelKind = "letter" | "exam";

export type FoundationLevel = {
  kind: FoundationLevelKind;
  title: string;
  letter?: string;
  items: string[];
  minAccuracy?: number;
};

const COMMON_WORDS = [
  "a",
  "ad",
  "add",
  "age",
  "air",
  "all",
  "an",
  "and",
  "ant",
  "are",
  "art",
  "as",
  "ask",
  "at",
  "ate",
  "bad",
  "bag",
  "ball",
  "bat",
  "be",
  "bed",
  "bee",
  "big",
  "bit",
  "box",
  "boy",
  "bug",
  "bus",
  "but",
  "buy",
  "by",
  "cab",
  "can",
  "cap",
  "car",
  "cat",
  "cup",
  "cut",
  "dad",
  "day",
  "den",
  "did",
  "dig",
  "dim",
  "dog",
  "dot",
  "dry",
  "due",
  "dug",
  "ear",
  "eat",
  "egg",
  "end",
  "eye",
  "fad",
  "fan",
  "far",
  "fat",
  "fed",
  "few",
  "fig",
  "fin",
  "fit",
  "fix",
  "fly",
  "for",
  "fox",
  "fun",
  "fur",
  "gap",
  "gas",
  "get",
  "gig",
  "got",
  "gun",
  "gut",
  "guy",
  "had",
  "hat",
  "hay",
  "he",
  "hen",
  "her",
  "hid",
  "him",
  "hip",
  "his",
  "hit",
  "hot",
  "how",
  "hub",
  "hug",
  "hum",
  "hut",
  "ice",
  "if",
  "ill",
  "in",
  "ink",
  "inn",
  "ion",
  "it",
  "its",
  "ivy",
  "jab",
  "jade",
  "jag",
  "jam",
  "jar",
  "jaw",
  "jet",
  "jig",
  "job",
  "jog",
  "joy",
  "jug",
  "jump",
  "just",
  "keg",
  "key",
  "kid",
  "kin",
  "kit",
  "lab",
  "lad",
  "lag",
  "lap",
  "law",
  "lay",
  "led",
  "leg",
  "let",
  "lid",
  "lie",
  "lip",
  "lit",
  "log",
  "lot",
  "low",
  "lug",
  "mad",
  "man",
  "map",
  "mat",
  "max",
  "may",
  "men",
  "met",
  "mid",
  "mix",
  "mob",
  "mom",
  "mop",
  "mud",
  "mug",
  "nap",
  "net",
  "new",
  "nil",
  "nip",
  "nit",
  "nod",
  "nor",
  "not",
  "now",
  "nut",
  "oak",
  "odd",
  "off",
  "oil",
  "old",
  "on",
  "one",
  "opt",
  "or",
  "orb",
  "ore",
  "our",
  "out",
  "owe",
  "owl",
  "own",
  "pad",
  "pal",
  "pan",
  "pat",
  "paw",
  "pay",
  "pea",
  "peg",
  "pen",
  "pet",
  "pie",
  "pig",
  "pin",
  "pit",
  "pod",
  "pop",
  "pot",
  "pup",
  "put",
  "rag",
  "ram",
  "ran",
  "rap",
  "rat",
  "raw",
  "ray",
  "red",
  "ref",
  "rib",
  "rid",
  "rig",
  "rim",
  "rip",
  "rob",
  "rod",
  "rot",
  "row",
  "rub",
  "rug",
  "run",
  "rut",
  "rye",
  "sad",
  "sag",
  "sat",
  "saw",
  "say",
  "sea",
  "see",
  "set",
  "sew",
  "she",
  "shy",
  "sin",
  "sip",
  "sir",
  "sit",
  "six",
  "ski",
  "sky",
  "sly",
  "so",
  "sob",
  "sod",
  "son",
  "sop",
  "sot",
  "sow",
  "soy",
  "spa",
  "spy",
  "sub",
  "sum",
  "sun",
  "sup",
  "tab",
  "tag",
  "tan",
  "tap",
  "tar",
  "tax",
  "tea",
  "ten",
  "the",
  "tie",
  "tin",
  "tip",
  "to",
  "toe",
  "ton",
  "too",
  "top",
  "tot",
  "tow",
  "toy",
  "try",
  "tub",
  "tug",
  "two",
  "urn",
  "use",
  "van",
  "vat",
  "vet",
  "via",
  "vie",
  "vim",
  "vow",
  "wag",
  "war",
  "was",
  "wax",
  "way",
  "web",
  "wed",
  "wet",
  "who",
  "why",
  "wig",
  "win",
  "wit",
  "woe",
  "won",
  "wow",
  "yak",
  "yam",
  "yap",
  "yaw",
  "yea",
  "yes",
  "yet",
  "yew",
  "you",
  "zap",
  "zen",
  "zip",
  "zoo",
];

function wordUsesOnlyChars(word: string, allowed: Set<string>): boolean {
  return [...word.toLowerCase()].every((c) => allowed.has(c));
}

function pickWords(allowed: Set<string>, count: number, minLen = 2): string[] {
  const pool = COMMON_WORDS.filter(
    (w) => w.length >= minLen && wordUsesOnlyChars(w, allowed),
  );
  const picked: string[] = [];
  const used = new Set<string>();
  for (const word of pool) {
    if (picked.length >= count) break;
    if (used.has(word)) continue;
    used.add(word);
    picked.push(word);
  }
  while (picked.length < count && pool.length > 0) {
    const word = pool[picked.length % pool.length]!;
    if (!used.has(word)) {
      used.add(word);
      picked.push(word);
    } else {
      break;
    }
  }
  return picked;
}

function buildLetterDrills(letter: string, learnedBefore: string[]): string[] {
  const drills = [letter, letter + letter, letter + letter + letter];
  const recent = [...learnedBefore].slice(-3);
  for (const other of recent) {
    drills.push(letter + other, other + letter);
  }
  if (recent.length >= 2) {
    drills.push(recent[recent.length - 1]! + letter + recent[recent.length - 2]!);
  }
  while (drills.length < 8) {
    drills.push(letter.repeat(Math.min(4, drills.length)));
  }
  return drills.slice(0, 8);
}

function buildFoundationLevels(): FoundationLevel[] {
  const levels: FoundationLevel[] = [];
  const learned: string[] = [];

  for (const letter of FOUNDATION_LETTER_ORDER) {
    levels.push({
      kind: "letter",
      title: `字母 ${letter.toUpperCase()}`,
      letter,
      items: buildLetterDrills(letter, learned),
    });
    learned.push(letter);
  }

  const allLetters = new Set(FOUNDATION_LETTER_ORDER);
  levels.push({
    kind: "exam",
    title: "毕业考试",
    items: pickWords(allLetters, 50, 3),
    minAccuracy: 80,
  });

  return levels;
}

export const FOUNDATION_LEVELS = buildFoundationLevels();
export const FOUNDATION_LEVEL_COUNT = FOUNDATION_LEVELS.length;

export function getFoundationLevel(level: number): FoundationLevel | null {
  if (level < 1 || level > FOUNDATION_LEVEL_COUNT) return null;
  return FOUNDATION_LEVELS[level - 1] ?? null;
}

export function getFoundationItemsPerLevel(level: number): number {
  return getFoundationLevel(level)?.items.length ?? 1;
}

export function getFoundationLevelTitle(level: number): string {
  return getFoundationLevel(level)?.title ?? `第 ${level} 关`;
}

export function isFoundationExamLevel(level: number): boolean {
  return getFoundationLevel(level)?.kind === "exam";
}

export function getFoundationPassAccuracy(level: number): number | undefined {
  return getFoundationLevel(level)?.minAccuracy;
}
