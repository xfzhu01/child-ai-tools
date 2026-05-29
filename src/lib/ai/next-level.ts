import prisma from "@/lib/db";
import { chatCompletionJson, isLLMConfigured } from "@/lib/ai/llm";
import {
  buildMiniGameSystemPrompt,
  buildMiniGameUserPrompt,
  buildRuleMiniGameItems,
  getMiniGameMeta,
  normalizeMiniGameItems,
  pickRandomMiniGameType,
  type AiMiniGameType,
} from "@/lib/ai/mini-games";
import {
  adjustDifficulty,
  detectAdjacentErrors,
  rankWeakKeys,
  type KeystrokeEvent,
} from "@/lib/typing-engine/analyzer";
import { type GameMode } from "@/lib/typing-engine/level-content";

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

async function buildAiCustomLevel(
  ctx: ChildContext,
  level: number,
  prevGameType?: AiMiniGameType,
): Promise<NextLevelResult> {
  // 每关等概率随机挑选小游戏，并避免与上一关重复，保证趣味性和均衡度。
  const gameType = pickRandomMiniGameType(prevGameType);
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
  prevGameType?: AiMiniGameType;
}): Promise<NextLevelResult> {
  const ctx = await loadChildContext(input.childId, input.lastSessionId);
  if (!ctx) throw new Error("Child not found");

  const mode = input.mode;
  const level = input.level ?? 1;

  if (mode !== "AI_CUSTOM") {
    throw new Error("AI content generation is only available for AI_CUSTOM mode");
  }

  return buildAiCustomLevel(ctx, level, input.prevGameType);
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
