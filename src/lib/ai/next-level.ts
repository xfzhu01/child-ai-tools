import prisma from "@/lib/db";
import { chatCompletionJson, isLLMConfigured } from "@/lib/ai/llm";
import {
  buildMiniGameSystemPrompt,
  buildMiniGameUserPrompt,
  buildRuleMiniGameItems,
  getMiniGameMeta,
  normalizeMiniGameItems,
  pickMiniGameTypeForLevel,
  type AiMiniGameType,
} from "@/lib/ai/mini-games";
import {
  adjustDifficulty,
  buildRuleExercises,
  detectAdjacentErrors,
  getAgeBand,
  rankWeakKeys,
  type KeystrokeEvent,
} from "@/lib/typing-engine/analyzer";
import {
  getItemsPerLevel,
  getLevelContent,
  getLevelTitle,
  type GameMode,
} from "@/lib/typing-engine/level-content";
import { normalizeTypingText } from "@/lib/typing-engine/typing-chars";

export type AiLevelItem = {
  text: string;
  focusKey?: string;
  title?: string;
  hanzi?: string;
  chainHint?: string;
  prompt?: string;
  hint?: string;
};

export type NextLevelResult = {
  focusKeys: string[];
  items: AiLevelItem[];
  difficulty: number;
  parentSummary: string;
  source: "ai" | "rule";
  gameType?: AiMiniGameType;
  gameTitle?: string;
  gameEmoji?: string;
};

type ChildContext = {
  id: string;
  name: string;
  age: number;
  focusKeys: string[];
  adjacent: string[];
  difficulty: number;
  avgAccuracy: number;
  avgWpm: number;
  sessionsCount: number;
};

const BLOCKED = ["暴力", "恐怖", "赌博", "色情"];

function isChildSafe(text: string) {
  return text.length > 0 && !BLOCKED.some((word) => text.includes(word));
}

async function loadChildContext(childId: string, lastSessionId?: string): Promise<ChildContext | null> {
  const child = await prisma.childProfile.findUnique({
    where: { id: childId },
    include: {
      typingSessions: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
  if (!child) return null;

  const sessions = child.typingSessions;
  const lastSession = lastSessionId
    ? sessions.find((s) => s.id === lastSessionId) ?? sessions[0]
    : sessions[0];

  const ranked = rankWeakKeys(sessions.map((s) => ({ rawEvents: s.rawEvents as KeystrokeEvent[] })));
  const focusKeys = ranked.slice(0, 5).map((item) => item.key);
  const difficulty = adjustDifficulty(sessions.map((s) => ({ accuracy: s.accuracy })));
  const adjacent = lastSession
    ? detectAdjacentErrors((lastSession.rawEvents as KeystrokeEvent[]) ?? [])
    : [];

  const avgAccuracy =
    sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length : 0;
  const avgWpm = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length : 0;

  return {
    id: child.id,
    name: child.name,
    age: child.age,
    focusKeys,
    adjacent,
    difficulty,
    avgAccuracy,
    avgWpm,
    sessionsCount: sessions.length,
  };
}

function buildRuleSummary(ctx: ChildContext, mode: GameMode, level: number) {
  const keysText = ctx.focusKeys.length > 0 ? ctx.focusKeys.join("、") : "基础键位";
  const adjacentText = ctx.adjacent.length > 0 ? `，相邻键误触：${ctx.adjacent.join(" ")}` : "";
  const modeLabel =
    mode === "AI_CUSTOM"
      ? "AI 定制关"
      : mode === "ADVENTURE"
        ? `字母大冒险第 ${level} 关`
        : mode === "CHAIN"
          ? `词语接龙第 ${level} 关`
          : `测评第 ${level} 关`;
  return `${ctx.name} 的${modeLabel}已根据近期数据调整。平均准确率 ${Math.round(ctx.avgAccuracy)}%，建议重点练习：${keysText}${adjacentText}。`;
}

function staticFallbackItems(mode: GameMode, level: number, count: number): AiLevelItem[] {
  const items: AiLevelItem[] = [];
  for (let i = 0; i < count; i++) {
    const content = getLevelContent(mode, level, i);
    if (!content) break;
    if (content.kind === "idiom") {
      items.push({
        text: content.text,
        hanzi: content.hanzi,
        chainHint: content.chainHint,
      });
    } else if (content.kind === "text") {
      items.push({ text: content.text, title: content.title });
    } else {
      items.push({ text: content.text });
    }
  }
  return items;
}

function ruleGeneratedItems(ctx: ChildContext, mode: GameMode, level: number, count: number): AiLevelItem[] {
  if (mode === "ADVENTURE") {
    return buildRuleExercises(ctx.focusKeys, ctx.difficulty, ctx.age)
      .slice(0, count)
      .map((item) => ({ text: item.text, focusKey: item.focusKey }));
  }

  if (mode === "ASSESSMENT") {
    const exercises = buildRuleExercises(ctx.focusKeys, ctx.difficulty, ctx.age);
    const combined = exercises
      .slice(0, Math.min(3, count))
      .map((e) => e.text)
      .join(" ");
    return [{ text: combined, title: getLevelTitle(mode, level) }];
  }

  return staticFallbackItems(mode, level, count);
}

function modeItemCount(mode: GameMode) {
  return getItemsPerLevel(mode);
}

function buildSystemPrompt(mode: GameMode) {
  const base =
    "你是儿童打字教练，为 6-12 岁小朋友生成下一关练习。输出必须是 JSON，不要 markdown。内容儿童友好，禁止不当词汇。";

  if (mode === "CHAIN") {
    return `${base} 输出格式：{"items":[{"text":"拼音无音调小写空格分词","hanzi":"四字成语","chainHint":"简短接龙提示"}...],"summary":"给家长的中文摘要"}`;
  }
  if (mode === "ASSESSMENT") {
    return `${base} 输出格式：{"items":[{"text":"一段覆盖弱项键位的英文练习句","title":"关卡标题"}],"summary":"给家长的中文摘要"}`;
  }
  return `${base} 输出格式：{"items":[{"text":"英文单词"}...],"summary":"给家长的中文摘要"}`;
}

function buildUserPrompt(ctx: ChildContext, mode: GameMode, level: number, count: number) {
  return [
    `孩子：${ctx.name}，${ctx.age} 岁（${getAgeBand(ctx.age)} 档）`,
    `模式：${mode}，关卡：${level}，需要 ${count} 个练习项`,
    `弱项键位：${ctx.focusKeys.join(",") || "a,s,d,f"}`,
    `相邻误触：${ctx.adjacent.join(",") || "无"}`,
    `近期 ${ctx.sessionsCount} 次练习，平均准确率 ${Math.round(ctx.avgAccuracy)}%，速度 ${Math.round(ctx.avgWpm)} WPM`,
    `难度系数：${ctx.difficulty}/5`,
    "请根据以上个人情况智能生成下一关内容，优先覆盖弱项键位，难度匹配年龄。",
  ].join("\n");
}

function normalizeLLMItems(
  raw: { text: string; focusKey?: string; title?: string; hanzi?: string; chainHint?: string }[],
  mode: GameMode,
  level: number,
): AiLevelItem[] {
  return raw
    .filter((item) => isChildSafe(item.text))
    .map((item) => ({
      text: normalizeTypingText(item.text.trim()),
      focusKey: item.focusKey,
      title: item.title ?? (mode === "ASSESSMENT" ? getLevelTitle(mode, level) : undefined),
      hanzi: item.hanzi,
      chainHint: item.chainHint,
    }));
}

async function generateWithLLM(
  ctx: ChildContext,
  mode: GameMode,
  level: number,
  count: number,
): Promise<{ items: AiLevelItem[]; summary: string } | null> {
  const parsed = await chatCompletionJson<{
    items?: { text: string; focusKey?: string; title?: string; hanzi?: string; chainHint?: string }[];
    summary?: string;
  }>([
    { role: "system", content: buildSystemPrompt(mode) },
    { role: "user", content: buildUserPrompt(ctx, mode, level, count) },
  ]);

  if (!parsed?.items?.length || !parsed.summary) return null;

  const items = normalizeLLMItems(parsed.items, mode, level).slice(0, count);
  if (items.length === 0) return null;

  return { items, summary: parsed.summary };
}

async function generateMiniGameWithLLM(
  ctx: ChildContext,
  gameType: AiMiniGameType,
  level: number,
): Promise<{ items: AiLevelItem[]; summary: string } | null> {
  const parsed = await chatCompletionJson<{
    items?: AiLevelItem[];
    summary?: string;
  }>([
    { role: "system", content: buildMiniGameSystemPrompt(gameType) },
    {
      role: "user",
      content: buildMiniGameUserPrompt(gameType, {
        name: ctx.name,
        age: ctx.age,
        focusKeys: ctx.focusKeys,
        adjacent: ctx.adjacent,
        difficulty: ctx.difficulty,
        avgAccuracy: ctx.avgAccuracy,
        avgWpm: ctx.avgWpm,
        sessionsCount: ctx.sessionsCount,
        level,
      }),
    },
  ]);

  if (!parsed?.items?.length || !parsed.summary) return null;

  const items = normalizeMiniGameItems(parsed.items, gameType);
  if (items.length === 0) return null;

  return { items, summary: parsed.summary };
}

async function buildAiCustomLevel(ctx: ChildContext, level: number): Promise<NextLevelResult> {
  const gameType = pickMiniGameTypeForLevel(ctx.id, level);
  const meta = getMiniGameMeta(gameType);
  let items: AiLevelItem[] = [];
  let parentSummary = `${ctx.name} 的第 ${level} 关：${meta.title}，重点练习 ${ctx.focusKeys.join("、") || "基础键位"}`;
  let source: "ai" | "rule" = "rule";

  if (isLLMConfigured()) {
    try {
      const aiResult = await generateMiniGameWithLLM(ctx, gameType, level);
      if (aiResult) {
        items = aiResult.items;
        parentSummary = aiResult.summary;
        source = "ai";
      }
    } catch {
      // fall through
    }
  }

  if (items.length === 0) {
    items = buildRuleMiniGameItems(gameType, {
      focusKeys: ctx.focusKeys,
      age: ctx.age,
      difficulty: ctx.difficulty,
    });
  } else if (items.length < meta.targetCount) {
    const ruleItems = buildRuleMiniGameItems(gameType, {
      focusKeys: ctx.focusKeys,
      age: ctx.age,
      difficulty: ctx.difficulty,
    });
    items = [...items, ...ruleItems].slice(0, meta.targetCount);
  }

  return {
    focusKeys: ctx.focusKeys,
    items,
    difficulty: ctx.difficulty,
    parentSummary,
    source,
    gameType,
    gameTitle: meta.title,
    gameEmoji: meta.emoji,
  };
}

export async function buildNextLevel(input: {
  childId: string;
  mode: GameMode;
  level?: number;
  lastSessionId?: string;
}): Promise<NextLevelResult> {
  const ctx = await loadChildContext(input.childId, input.lastSessionId);
  if (!ctx) throw new Error("Child not found");

  const mode = input.mode;
  const level = input.level ?? 1;

  if (mode === "AI_CUSTOM") {
    return buildAiCustomLevel(ctx, level);
  }

  const count = modeItemCount(mode);

  let items: AiLevelItem[] = [];
  let parentSummary = buildRuleSummary(ctx, mode, level);
  let source: "ai" | "rule" = "rule";

  if (isLLMConfigured()) {
    try {
      const aiResult = await generateWithLLM(ctx, mode, level, count);
      if (aiResult) {
        items = aiResult.items;
        parentSummary = aiResult.summary;
        source = "ai";
      }
    } catch {
      // fall through to rule engine
    }
  }

  if (items.length === 0) {
    items = ruleGeneratedItems(ctx, mode, level, count);
    if (items.length === 0) {
      items = staticFallbackItems(mode, level, count);
    }
  }

  return {
    focusKeys: ctx.focusKeys,
    items,
    difficulty: ctx.difficulty,
    parentSummary,
    source,
  };
}

export async function cacheNextLevel(
  childId: string,
  sessionId: string | undefined,
  result: NextLevelResult,
) {
  return prisma.aIRecommendation.create({
    data: {
      childId,
      sessionId,
      focusKeys: result.focusKeys,
      summary: result.parentSummary,
      exercises: result.items,
      difficulty: result.difficulty,
    },
  });
}
