import {
  detectAdjacentErrors,
  getAgeBand,
  rankWeakKeys,
  type KeystrokeEvent,
  type KeyWeakness,
} from "@/lib/typing-engine/analyzer";
import { getLevelCount, type GameMode } from "@/lib/typing-engine/level-content";
import {
  formatModeProgress,
  hasModeProgress,
  isModeComplete,
  modeTitle,
} from "@/lib/typing-engine/progress-display";
import type { ModeProgressSnapshot } from "@/lib/typing-engine/mode-progress";

export type TrendDirection = "up" | "down" | "stable" | "insufficient";

export type ReportChartPoint = {
  date: string;
  label: string;
  accuracy: number;
  wpm: number;
  comboMax: number;
};

export type ReportModeProgress = {
  mode: GameMode;
  title: string;
  summary: string;
  percent: number;
  complete: boolean;
};

export type ChildReportMetrics = {
  periodLabel: string;
  sessionCount: number;
  totalPracticeMin: number;
  streakDays: number;
  ageBand: string;
  wpmTarget: number;
  avgAccuracy: number;
  medianAccuracy: number;
  avgWpm: number;
  wpmVsTargetPct: number;
  avgComboMax: number;
  accuracyTrend: TrendDirection;
  wpmTrend: TrendDirection;
  consistencyScore: number;
  adjacentErrorRate: number;
  adjacentPairs: string[];
  weakKeys: KeyWeakness[];
  chartPoints: ReportChartPoint[];
  modeProgress: ReportModeProgress[];
};

type SessionRow = {
  wpm: number;
  accuracy: number;
  durationSec: number;
  comboMax: number;
  rawEvents: unknown;
  createdAt: Date;
};

function wpmTargetForAge(age: number) {
  if (age <= 8) return 15;
  if (age <= 10) return 25;
  return 35;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function stdDev(values: number[]) {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function computeTrend(values: number[]): TrendDirection {
  if (values.length < 6) return "insufficient";
  const recent = values.slice(-3);
  const previous = values.slice(-6, -3);
  const delta = average(recent) - average(previous);
  if (Math.abs(delta) < 2) return "stable";
  return delta > 0 ? "up" : "down";
}

function computeConsistencyScore(accuracies: number[]) {
  if (accuracies.length < 2) return 100;
  const spread = stdDev(accuracies);
  return Math.max(0, Math.min(100, Math.round(100 - spread * 2.5)));
}

function computeAdjacentErrorRate(sessions: SessionRow[]) {
  let totalErrors = 0;
  let adjacentErrors = 0;

  for (const session of sessions) {
    const events = (session.rawEvents as KeystrokeEvent[]) ?? [];
    totalErrors += events.filter((event) => !event.correct).length;
    adjacentErrors += detectAdjacentErrors(events).length;
  }

  if (totalErrors === 0) return 0;
  return adjacentErrors / totalErrors;
}

function modeCompletionPercent(mode: GameMode, progress: ModeProgressSnapshot) {
  const total = getLevelCount(mode);
  if (!hasModeProgress(progress)) return 0;
  if (isModeComplete(mode, progress)) return 100;
  const cleared = Object.keys(progress.levelStars).length;
  return Math.min(100, Math.round((cleared / total) * 100));
}

export function buildChildReportMetrics(input: {
  age: number;
  streakDays: number;
  sessions: SessionRow[];
  progressMap: Partial<Record<GameMode, ModeProgressSnapshot>>;
  modes?: GameMode[];
}): ChildReportMetrics {
  const modes = input.modes ?? [
    "FOUNDATION",
    "ASSESSMENT",
    "ADVENTURE",
    "CHAIN",
    "AI_CUSTOM",
  ];
  const sessions = input.sessions;
  const accuracies = sessions.map((session) => session.accuracy);
  const wpms = sessions.map((session) => session.wpm);
  const wpmTarget = wpmTargetForAge(input.age);
  const avgWpm = average(wpms);
  const weakKeys = rankWeakKeys(sessions.map((session) => ({ rawEvents: session.rawEvents }))).slice(
    0,
    8,
  );

  const chartPoints = sessions.map((session, index) => {
    const month = session.createdAt.getMonth() + 1;
    const day = session.createdAt.getDate();
    return {
      date: `#${index + 1}`,
      label: `${month}/${day}`,
      accuracy: round1(session.accuracy),
      wpm: round1(session.wpm),
      comboMax: session.comboMax,
    };
  });

  return {
    periodLabel: sessions.length > 0 ? `最近 ${sessions.length} 次练习` : "暂无练习记录",
    sessionCount: sessions.length,
    totalPracticeMin: Math.round(sessions.reduce((sum, session) => sum + session.durationSec, 0) / 60),
    streakDays: input.streakDays,
    ageBand: getAgeBand(input.age),
    wpmTarget,
    avgAccuracy: round1(average(accuracies)),
    medianAccuracy: round1(median(accuracies)),
    avgWpm: round1(avgWpm),
    wpmVsTargetPct: wpmTarget > 0 ? Math.round((avgWpm / wpmTarget) * 100) : 0,
    avgComboMax: round1(average(sessions.map((session) => session.comboMax))),
    accuracyTrend: computeTrend(accuracies),
    wpmTrend: computeTrend(wpms),
    consistencyScore: computeConsistencyScore(accuracies),
    adjacentErrorRate: computeAdjacentErrorRate(sessions),
    adjacentPairs: [
      ...new Set(
        sessions.flatMap((session) =>
          detectAdjacentErrors((session.rawEvents as KeystrokeEvent[]) ?? []),
        ),
      ),
    ].slice(0, 6),
    weakKeys,
    chartPoints,
    modeProgress: modes.map((mode) => {
      const progress = progressMapEntry(input.progressMap, mode);
      return {
        mode,
        title: modeTitle(mode),
        summary: formatModeProgress(mode, progress),
        percent: modeCompletionPercent(mode, progress),
        complete: isModeComplete(mode, progress),
      };
    }),
  };
}

function progressMapEntry(
  progressMap: Partial<Record<GameMode, ModeProgressSnapshot>>,
  mode: GameMode,
): ModeProgressSnapshot {
  return (
    progressMap[mode] ?? {
      currentLevel: 1,
      maxUnlocked: 1,
      itemIndex: 0,
      levelStars: {},
    }
  );
}

export function trendLabel(trend: TrendDirection) {
  if (trend === "up") return "上升";
  if (trend === "down") return "下降";
  if (trend === "stable") return "稳定";
  return "样本不足";
}

export function trendTone(trend: TrendDirection) {
  if (trend === "up") return "text-mint-700 bg-mint-100 ring-1 ring-inset ring-mint-200";
  if (trend === "down") return "text-coral-700 bg-coral-100 ring-1 ring-inset ring-coral-200";
  if (trend === "stable") return "text-aqua-700 bg-aqua-100 ring-1 ring-inset ring-aqua-200";
  return "text-slate-600 bg-slate-100";
}

export const KEYBOARD_LAYOUT = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
] as const;

export function keyboardHeatEntries(weakKeys: KeyWeakness[]) {
  const map = new Map(weakKeys.map((item) => [item.key.toLowerCase(), item.errorRate]));
  return KEYBOARD_LAYOUT.flat().map((key) => ({
    key,
    errorRate: map.get(key) ?? 0,
    hasData: map.has(key),
  }));
}
