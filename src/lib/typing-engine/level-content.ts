import { ASSESSMENT_LEVELS, ASSESSMENT_LEVEL_COUNT } from "./assessment-levels";
import {
  ADVENTURE_LEVELS,
  ADVENTURE_LEVEL_COUNT,
  ADVENTURE_WORDS_PER_LEVEL,
} from "./adventure-levels";
import {
  CHAIN_IDIOMS_PER_LEVEL,
  CHAIN_LEVELS,
  CHAIN_LEVEL_COUNT,
  type ChainIdiom,
} from "./chain-levels";
import {
  FOUNDATION_LEVEL_COUNT,
  FOUNDATION_LEVELS,
  getFoundationItemsPerLevel,
  getFoundationLevelTitle,
} from "./foundation-levels";
import { AI_CUSTOM_LEVEL_COUNT } from "@/lib/ai/mini-games";

export type GameMode =
  | "ASSESSMENT"
  | "ADVENTURE"
  | "CHAIN"
  | "FOUNDATION"
  | "AI_CUSTOM";

export function getLevelCount(mode: GameMode): number {
  switch (mode) {
    case "ASSESSMENT":
      return ASSESSMENT_LEVEL_COUNT;
    case "ADVENTURE":
      return ADVENTURE_LEVEL_COUNT;
    case "CHAIN":
      return CHAIN_LEVEL_COUNT;
    case "FOUNDATION":
      return FOUNDATION_LEVEL_COUNT;
    case "AI_CUSTOM":
      return AI_CUSTOM_LEVEL_COUNT;
    default:
      return 1;
  }
}

export function getItemsPerLevel(mode: GameMode, level = 1): number {
  switch (mode) {
    case "ADVENTURE":
      return ADVENTURE_WORDS_PER_LEVEL;
    case "CHAIN":
      return CHAIN_IDIOMS_PER_LEVEL;
    case "FOUNDATION":
      return getFoundationItemsPerLevel(level);
    case "AI_CUSTOM":
      return 1;
    default:
      return 1;
  }
}

export type LevelContent =
  | { kind: "text"; text: string; title?: string }
  | { kind: "word"; text: string }
  | { kind: "idiom"; text: string; hanzi: string; chainHint?: string }
  | { kind: "foundation"; text: string; letter?: string; kindLabel: "letter" | "exam" };

export function getLevelContent(
  mode: GameMode,
  level: number,
  itemIndex: number,
): LevelContent | null {
  if (level < 1) return null;

  if (mode === "ASSESSMENT") {
    const data = ASSESSMENT_LEVELS[level - 1];
    if (!data) return null;
    return { kind: "text", text: data.text, title: data.title };
  }

  if (mode === "ADVENTURE") {
    const data = ADVENTURE_LEVELS[level - 1];
    if (!data || itemIndex >= data.words.length) return null;
    return { kind: "word", text: data.words[itemIndex]! };
  }

  if (mode === "CHAIN") {
    const data = CHAIN_LEVELS[level - 1];
    if (!data || itemIndex >= data.idioms.length) return null;
    const idiom: ChainIdiom = data.idioms[itemIndex]!;
    const prev = itemIndex > 0 ? data.idioms[itemIndex - 1] : undefined;
    return {
      kind: "idiom",
      text: idiom.pinyin,
      hanzi: idiom.hanzi,
      chainHint: prev ? `接「${prev.hanzi}」末字读音` : undefined,
    };
  }

  if (mode === "FOUNDATION") {
    const data = FOUNDATION_LEVELS[level - 1];
    if (!data || itemIndex >= data.items.length) return null;
    return {
      kind: "foundation",
      text: data.items[itemIndex]!,
      letter: data.letter,
      kindLabel: data.kind,
    };
  }

  return null;
}

export function getDifficultyLabel(mode: GameMode, level: number): string {
  if (mode === "ASSESSMENT") {
    if (level === 1) return "简单";
    if (level === 2) return "中等";
    return "困难";
  }
  if (mode === "ADVENTURE") {
    if (level <= 10) return "简单";
    if (level <= 20) return "中等";
    return "困难";
  }
  if (mode === "CHAIN") {
    if (level <= 3) return "简单";
    if (level <= 7) return "中等";
    return "困难";
  }
  if (mode === "FOUNDATION") {
    const data = FOUNDATION_LEVELS[level - 1];
    if (data?.kind === "exam") return "考试";
    return "字母";
  }
  return "";
}

export function getLevelTitle(mode: GameMode, level: number): string {
  const diff = getDifficultyLabel(mode, level);
  if (mode === "ASSESSMENT") {
    const title = ASSESSMENT_LEVELS[level - 1]?.title ?? `测评 ${level}`;
    return diff ? `${title} · ${diff}` : title;
  }
  if (mode === "ADVENTURE") {
    return `第 ${level} 关 · ${diff}`;
  }
  if (mode === "CHAIN") {
    return `成语接龙 · 第 ${level} 关 · ${diff}`;
  }
  if (mode === "FOUNDATION") {
    const title = getFoundationLevelTitle(level);
    return diff ? `${title} · ${diff}` : title;
  }
  if (mode === "AI_CUSTOM") {
    return `AI 定制 · 第 ${level}/${AI_CUSTOM_LEVEL_COUNT} 关`;
  }
  return `第 ${level} 关`;
}
