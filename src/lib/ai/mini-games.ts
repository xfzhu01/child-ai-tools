import {
  buildRuleExercises,
} from "@/lib/typing-engine/analyzer";
import { normalizeTypingText } from "@/lib/typing-engine/typing-chars";

export const MINI_GAME_TYPES = [
  "word_burst",
  "key_sprint",
  "sentence_flow",
  "fill_blank",
  "key_rain",
  "word_chain",
  "speed_duel",
  "weak_focus",
] as const;

export type AiMiniGameType = (typeof MINI_GAME_TYPES)[number];

export type AiMiniGameItem = {
  text: string;
  focusKey?: string;
  prompt?: string;
  hint?: string;
};

export type AiMiniGameMeta = {
  type: AiMiniGameType;
  title: string;
  emoji: string;
  description: string;
  targetCount: number;
};

export const MINI_GAME_META: Record<AiMiniGameType, AiMiniGameMeta> = {
  word_burst: {
    type: "word_burst",
    title: "单词连击",
    emoji: "💥",
    description: "连续输入多个单词，保持节奏不断连击",
    targetCount: 6,
  },
  key_sprint: {
    type: "key_sprint",
    title: "键位冲刺",
    emoji: "⚡",
    description: "短单词冲刺，集中练习容易出错的键位",
    targetCount: 5,
  },
  sentence_flow: {
    type: "sentence_flow",
    title: "句子流动",
    emoji: "🌊",
    description: "一气呵成输入完整英文句子",
    targetCount: 1,
  },
  fill_blank: {
    type: "fill_blank",
    title: "填空补键",
    emoji: "🧩",
    description: "根据提示补全单词，强化记忆",
    targetCount: 5,
  },
  key_rain: {
    type: "key_rain",
    title: "字母雨",
    emoji: "🌧️",
    description: "快速输入指定键位上的字母",
    targetCount: 8,
  },
  word_chain: {
    type: "word_chain",
    title: "词链接龙",
    emoji: "🔗",
    description: "每个单词首字母接上一个单词的尾字母",
    targetCount: 5,
  },
  speed_duel: {
    type: "speed_duel",
    title: "速度三轮",
    emoji: "🏁",
    description: "三轮超短练习，挑战手速",
    targetCount: 3,
  },
  weak_focus: {
    type: "weak_focus",
    title: "弱项专练",
    emoji: "🎯",
    description: "围绕一个弱项键位反复练习",
    targetCount: 6,
  },
};

export function pickRandomMiniGameType(): AiMiniGameType {
  return MINI_GAME_TYPES[Math.floor(Math.random() * MINI_GAME_TYPES.length)]!;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function createSeededRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic shuffle: every block of 8 levels contains each mini-game exactly once. */
export function shuffledMiniGameDeck(childId: string, block: number): AiMiniGameType[] {
  const deck: AiMiniGameType[] = [...MINI_GAME_TYPES];
  const rng = createSeededRng(hashString(`${childId}:block:${block}`));

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = deck[i]!;
    deck[i] = deck[j]!;
    deck[j] = tmp;
  }

  return deck;
}

/** Stable per child+level; cycles all 8 games evenly in randomized blocks of 8. */
export function pickMiniGameTypeForLevel(childId: string, level: number): AiMiniGameType {
  const safeLevel = Math.max(1, level);
  const block = Math.floor((safeLevel - 1) / MINI_GAME_TYPES.length);
  const posInBlock = (safeLevel - 1) % MINI_GAME_TYPES.length;
  return shuffledMiniGameDeck(childId, block)[posInBlock]!;
}

export function getMiniGameMeta(type: AiMiniGameType): AiMiniGameMeta {
  return MINI_GAME_META[type];
}

type ChildWeakContext = {
  focusKeys: string[];
  age: number;
  difficulty: number;
};

const FALLBACK_WORDS = ["cat", "dog", "run", "play", "book", "fish", "tree", "jump", "happy", "star"];

function primaryKey(ctx: ChildWeakContext) {
  return ctx.focusKeys[0] ?? "a";
}

function wordsWithKey(key: string, count: number) {
  const pool = [
    ...FALLBACK_WORDS,
    "apple",
    "banana",
    "tiger",
    "rabbit",
    "keyboard",
    "letter",
    "quick",
    "brown",
  ].filter((w) => w.includes(key));
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[i % Math.max(pool.length, 1)] ?? key.repeat(3));
  }
  return out;
}

function toBlankPrompt(word: string, key: string) {
  const idx = word.indexOf(key);
  if (idx < 0) return word.replace(/./g, (c, i) => (i === 0 ? "_" : c));
  return word
    .split("")
    .map((c, i) => (i === idx ? "_" : c))
    .join("");
}

function padMiniGameItems(items: AiMiniGameItem[], targetCount: number): AiMiniGameItem[] {
  if (items.length === 0 || items.length >= targetCount) return items;
  const padded = [...items];
  while (padded.length < targetCount) {
    padded.push(items[padded.length % items.length]!);
  }
  return padded;
}

export function buildRuleMiniGameItems(
  gameType: AiMiniGameType,
  ctx: ChildWeakContext,
): AiMiniGameItem[] {
  const meta = getMiniGameMeta(gameType);
  const key = primaryKey(ctx);
  const exercises = buildRuleExercises(ctx.focusKeys, ctx.difficulty, ctx.age);

  let items: AiMiniGameItem[];

  switch (gameType) {
    case "word_burst":
      items = exercises.slice(0, meta.targetCount).map((e) => ({
        text: e.text,
        focusKey: e.focusKey,
      }));
      break;

    case "key_sprint":
      items = wordsWithKey(key, meta.targetCount).map((text) => ({ text, focusKey: key }));
      break;

    case "sentence_flow": {
      const words = exercises.slice(0, 6).map((e) => e.text);
      items = [{ text: words.join(" "), hint: "输入完整句子" }];
      break;
    }

    case "fill_blank":
      items = wordsWithKey(key, meta.targetCount).map((text) => ({
        text,
        prompt: toBlankPrompt(text, key),
        focusKey: key,
        hint: "补全缺失字母",
      }));
      break;

    case "key_rain": {
      const chars = "abcdefghijklmnopqrstuvwxyz";
      const idx = chars.indexOf(key) >= 0 ? chars.indexOf(key) : 0;
      items = Array.from({ length: meta.targetCount }, (_, i) => {
        const c = chars[(idx + i) % 26]!;
        return { text: c, focusKey: c, hint: `练习键位 ${key.toUpperCase()} 附近` };
      });
      break;
    }

    case "word_chain": {
      const words = exercises.slice(0, meta.targetCount).map((e) => e.text);
      if (words.length === 0) words.push("cat", "tiger", "run");
      items = words.map((text, i) => ({
        text,
        hint: i === 0 ? "开始接龙" : `接上一个词尾字母`,
      }));
      break;
    }

    case "speed_duel":
      items = exercises.slice(0, meta.targetCount).map((e) => ({
        text: e.text.slice(0, 5),
        focusKey: e.focusKey,
        hint: "越快越好",
      }));
      break;

    case "weak_focus":
      items = wordsWithKey(key, meta.targetCount).map((text) => ({
        text,
        focusKey: key,
        hint: `重点键位：${key.toUpperCase()}`,
      }));
      break;
  }

  return padMiniGameItems(items, meta.targetCount);
}

export function buildMiniGameSystemPrompt(gameType: AiMiniGameType): string {
  const meta = getMiniGameMeta(gameType);
  const base =
    "你是儿童打字教练，为 6-12 岁小朋友生成练习内容。输出必须是 JSON，不要 markdown。内容儿童友好，仅英文与拼音，禁止不当词汇。";

  const schemas: Record<AiMiniGameType, string> = {
    word_burst: `{"items":[{"text":"英文单词","focusKey":"重点键"}...],"summary":"给家长的中文摘要"}`,
    key_sprint: `{"items":[{"text":"3-5字母短单词","focusKey":"重点键"}...],"summary":"给家长的中文摘要"}`,
    sentence_flow: `{"items":[{"text":"一句英文句子含空格","hint":"简短提示"}],"summary":"给家长的中文摘要"}`,
    fill_blank: `{"items":[{"text":"完整单词","prompt":"用下划线替换一个字母如 h_llo","focusKey":"重点键"}...],"summary":"给家长的中文摘要"}`,
    key_rain: `{"items":[{"text":"单个字母","focusKey":"该字母"}...],"summary":"给家长的中文摘要"}`,
    word_chain: `{"items":[{"text":"英文单词，首字母接上一词尾字母"}...],"summary":"给家长的中文摘要"}`,
    speed_duel: `{"items":[{"text":"3-5字母短词","focusKey":"重点键"}...],"summary":"给家长的中文摘要"}`,
    weak_focus: `{"items":[{"text":"包含弱项键位的单词","focusKey":"弱项键"}...],"summary":"给家长的中文摘要"}`,
  };

  return `${base} 游戏形式：${meta.title}（${meta.description}）。需要 ${meta.targetCount} 个练习项。输出格式：${schemas[gameType]}`;
}

export function buildMiniGameUserPrompt(
  gameType: AiMiniGameType,
  ctx: {
    name: string;
    age: number;
    focusKeys: string[];
    adjacent: string[];
    difficulty: number;
    avgAccuracy: number;
    avgWpm: number;
    sessionsCount: number;
    level: number;
  },
) {
  const meta = getMiniGameMeta(gameType);
  return [
    `孩子：${ctx.name}，${ctx.age} 岁`,
    `AI 定制关第 ${ctx.level}/${AI_CUSTOM_LEVEL_COUNT} 关`,
    `小游戏：${meta.title}（${meta.emoji}）`,
    `弱项键位：${ctx.focusKeys.join(",") || "a,s,d,f"}`,
    `相邻误触：${ctx.adjacent.join(",") || "无"}`,
    `近期 ${ctx.sessionsCount} 次练习，准确率 ${Math.round(ctx.avgAccuracy)}%，速度 ${Math.round(ctx.avgWpm)} WPM`,
    `难度：${ctx.difficulty}/5`,
    `请生成 ${meta.targetCount} 个练习项，覆盖弱项键位，难度匹配年龄。`,
  ].join("\n");
}

export function normalizeMiniGameItems(
  raw: AiMiniGameItem[] | undefined,
  gameType: AiMiniGameType,
): AiMiniGameItem[] {
  const meta = getMiniGameMeta(gameType);
  if (!raw?.length) return [];

  const blocked = ["暴力", "恐怖", "赌博", "色情"];
  return raw
    .filter((item) => item.text?.trim() && !blocked.some((w) => item.text.includes(w)))
    .slice(0, meta.targetCount)
    .map((item) => ({
      text: normalizeTypingText(item.text.trim()),
      focusKey: item.focusKey,
      prompt: item.prompt?.trim() ? normalizeTypingText(item.prompt.trim()) : undefined,
      hint: item.hint?.trim(),
    }));
}

export const AI_CUSTOM_LEVEL_COUNT = 100;
