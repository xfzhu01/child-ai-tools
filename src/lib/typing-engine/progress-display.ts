import { getItemsPerLevel, getLevelCount, type GameMode } from "@/lib/typing-engine/level-content";
import type { ModeProgressSnapshot } from "@/lib/typing-engine/mode-progress";
import { t } from "@/lib/i18n";

const OFFICIAL_MODES: GameMode[] = ["FOUNDATION", "ASSESSMENT", "ADVENTURE", "CHAIN", "AI_CUSTOM"];

export function modeTitle(mode: GameMode): string {
  if (mode === "FOUNDATION") return t("learn.foundation");
  if (mode === "ASSESSMENT") return t("learn.assessment");
  if (mode === "ADVENTURE") return t("learn.adventure");
  if (mode === "AI_CUSTOM") return t("learn.aiCustom");
  return t("learn.chain");
}

export function hasModeProgress(progress: ModeProgressSnapshot): boolean {
  return (
    progress.maxUnlocked > 1 ||
    progress.currentLevel > 1 ||
    progress.itemIndex > 0 ||
    Object.keys(progress.levelStars).length > 0
  );
}

export function isModeComplete(mode: GameMode, progress: ModeProgressSnapshot): boolean {
  const total = getLevelCount(mode);
  return Boolean(progress.levelStars[String(total)] && progress.maxUnlocked >= total);
}

export function formatModeProgress(mode: GameMode, progress: ModeProgressSnapshot): string {
  const total = getLevelCount(mode);
  if (!hasModeProgress(progress)) return "未开始";
  if (isModeComplete(mode, progress)) return `已完成 ${total} 关`;

  const starsCount = Object.keys(progress.levelStars).length;
  if (progress.itemIndex > 0) {
    if (mode === "AI_CUSTOM") {
      return `第 ${progress.currentLevel}/${total} 关 · 小游戏进行中`;
    }
    const items = getItemsPerLevel(mode, progress.currentLevel);
    return `第 ${progress.currentLevel}/${total} 关 · 进行中（${progress.itemIndex + 1}/${items} 项）`;
  }
  if (starsCount > 0) {
    return `第 ${progress.currentLevel}/${total} 关 · 已闯 ${starsCount} 关`;
  }
  return `第 ${progress.currentLevel}/${total} 关`;
}

export function findContinueTarget(
  childId: string,
  progressMap: Partial<Record<GameMode, ModeProgressSnapshot>>,
): { href: string; label: string; mode: GameMode } | null {
  let best: { mode: GameMode; score: number } | null = null;

  for (const mode of OFFICIAL_MODES) {
    const progress = progressMap[mode];
    if (!progress || !hasModeProgress(progress)) continue;
    if (isModeComplete(mode, progress)) continue;

    const score =
      (progress.itemIndex > 0 ? 10_000 : 0) +
      progress.maxUnlocked * 100 +
      progress.currentLevel * 10 +
      Object.keys(progress.levelStars).length;

    if (!best || score > best.score) {
      best = { mode, score };
    }
  }

  if (!best) return null;

  const progress = progressMap[best.mode]!;
  const itemHint =
    progress.itemIndex > 0 ? `（第 ${progress.itemIndex + 1} 项）` : "";

  return {
    mode: best.mode,
    href: `/learn/${childId}/play?mode=${best.mode}&resume=1`,
    label: `${modeTitle(best.mode)} · 第 ${progress.currentLevel} 关${itemHint}`,
  };
}

export function summarizeChildProgress(
  progressMap: Partial<Record<GameMode, ModeProgressSnapshot>>,
): string | null {
  const parts = OFFICIAL_MODES.map((mode) => {
    const progress = progressMap[mode];
    if (!progress || !hasModeProgress(progress)) return null;
    return `${modeTitle(mode)} ${formatModeProgress(mode, progress)}`;
  }).filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
}
