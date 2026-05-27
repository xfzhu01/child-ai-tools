import { buildNextLevel, cacheNextLevel, type NextLevelResult } from "@/lib/ai/next-level";

export type RecommendResult = NextLevelResult & {
  exercises: NextLevelResult["items"];
};

/** @deprecated Use buildNextLevel */
export async function buildRecommendation(
  childId: string,
  lastSessionId?: string,
  mode: "AI_CUSTOM" = "AI_CUSTOM",
): Promise<RecommendResult> {
  const result = await buildNextLevel({ childId, mode, level: 1, lastSessionId });
  return { ...result, exercises: result.items };
}

export async function cacheRecommendation(
  childId: string,
  sessionId: string | undefined,
  result: RecommendResult,
) {
  return cacheNextLevel(childId, sessionId, result);
}

export type { AiLevelItem, NextLevelResult } from "@/lib/ai/next-level";
