export type KeystrokeEvent = {
  key: string;
  timestamp: number;
  correct: boolean;
  latencyMs: number;
  expected?: string;
};

export type SessionStats = {
  wpm: number;
  accuracy: number;
  durationSec: number;
  errorKeys: string[];
  slowKeys: string[];
  comboMax: number;
};

export type KeyWeakness = {
  key: string;
  errorRate: number;
  avgLatencyMs: number;
  count: number;
};

const ADJACENT_KEYS: Record<string, string[]> = {
  q: ["w", "a"],
  w: ["q", "e", "s"],
  e: ["w", "r", "d"],
  r: ["e", "t", "f"],
  t: ["r", "y", "g"],
  y: ["t", "u", "h"],
  u: ["y", "i", "j"],
  i: ["u", "o", "k"],
  o: ["i", "p", "l"],
  p: ["o"],
  a: ["q", "s", "z"],
  s: ["a", "w", "d", "x"],
  d: ["s", "e", "f", "c"],
  f: ["d", "r", "g", "v"],
  g: ["f", "t", "h", "b"],
  h: ["g", "y", "j", "n"],
  j: ["h", "u", "k", "m"],
  k: ["j", "i", "l"],
  l: ["k", "o"],
  z: ["a", "x"],
  x: ["z", "s", "c"],
  c: ["x", "d", "v"],
  v: ["c", "f", "b"],
  b: ["v", "g", "n"],
  n: ["b", "h", "m"],
  m: ["n", "j"],
};

export const ASSESSMENT_SEQUENCE = "the quick brown fox jumps over lazy dog";

export { ASSESSMENT_LEVELS, ASSESSMENT_LEVEL_COUNT } from "./assessment-levels";
export { ADVENTURE_LEVELS, ADVENTURE_LEVEL_COUNT, ADVENTURE_WORDS_PER_LEVEL } from "./adventure-levels";
export { CHAIN_LEVELS, CHAIN_LEVEL_COUNT, CHAIN_IDIOMS_PER_LEVEL } from "./chain-levels";
export { getLevelContent, getLevelCount, getItemsPerLevel, getLevelTitle } from "./level-content";
export type { GameMode as TypingGameMode } from "./level-content";

export { ADVENTURE_WORDS } from "./adventure-levels";
export { CHAIN_WORDS } from "./chain-levels";

export function normalizeKey(key: string) {
  return key.length === 1 ? key.toLowerCase() : key;
}

export function analyzeSession(events: KeystrokeEvent[]): SessionStats {
  if (events.length === 0) {
    return {
      wpm: 0,
      accuracy: 0,
      durationSec: 0,
      errorKeys: [],
      slowKeys: [],
      comboMax: 0,
    };
  }

  const start = events[0].timestamp;
  const end = events[events.length - 1].timestamp;
  const durationSec = Math.max(1, Math.round((end - start) / 1000));
  const correctCount = events.filter((e) => e.correct).length;
  const accuracy = (correctCount / events.length) * 100;
  const wpm = (correctCount / 5 / durationSec) * 60;

  const errorMap = new Map<string, number>();
  const latencyMap = new Map<string, number[]>();
  let combo = 0;
  let comboMax = 0;

  for (const event of events) {
    const key = normalizeKey(event.key);
    if (!event.correct) {
      const errorKey = event.expected ? normalizeKey(event.expected) : key;
      errorMap.set(errorKey, (errorMap.get(errorKey) ?? 0) + 1);
      combo = 0;
    } else {
      combo += 1;
      comboMax = Math.max(comboMax, combo);
    }
    const latencies = latencyMap.get(key) ?? [];
    latencies.push(event.latencyMs);
    latencyMap.set(key, latencies);
  }

  const errorKeys = [...errorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  const slowKeys = [...latencyMap.entries()]
    .map(([key, values]) => ({
      key,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .filter((item) => item.avg > 800)
    .sort((a, b) => b.avg - a.avg)
    .map((item) => item.key);

  return {
    wpm,
    accuracy,
    durationSec,
    errorKeys,
    slowKeys,
    comboMax,
  };
}

export function rankWeakKeys(
  sessions: { rawEvents: KeystrokeEvent[] | unknown }[],
): KeyWeakness[] {
  const stats = new Map<string, { errors: number; total: number; latency: number[] }>();

  for (const session of sessions) {
    const events = (session.rawEvents as KeystrokeEvent[]) ?? [];
    for (const event of events) {
      const key = normalizeKey(event.key);
      const trackKey = event.correct
        ? key
        : event.expected
          ? normalizeKey(event.expected)
          : key;
      const current = stats.get(trackKey) ?? { errors: 0, total: 0, latency: [] };
      current.total += 1;
      if (!event.correct) current.errors += 1;
      current.latency.push(event.latencyMs);
      stats.set(trackKey, current);
    }
  }

  return [...stats.entries()]
    .map(([key, value]) => ({
      key,
      errorRate: value.total ? value.errors / value.total : 0,
      avgLatencyMs: value.latency.length
        ? value.latency.reduce((a, b) => a + b, 0) / value.latency.length
        : 0,
      count: value.total,
    }))
    .filter((item) => item.count >= 3)
    .sort((a, b) => b.errorRate - a.errorRate || b.avgLatencyMs - a.avgLatencyMs);
}

export function detectAdjacentErrors(events: KeystrokeEvent[]): string[] {
  const pairs = new Set<string>();
  for (const event of events) {
    if (event.correct || !event.expected) continue;
    const expected = normalizeKey(event.expected);
    const pressed = normalizeKey(event.key);
    const neighbors = ADJACENT_KEYS[expected] ?? [];
    if (neighbors.includes(pressed)) {
      pairs.add(`${expected}-${pressed}`);
    }
  }
  return [...pairs];
}

export function adjustDifficulty(history: { accuracy: number }[]): number {
  const recent = history.slice(-3);
  if (recent.length === 0) return 1;
  const avg = recent.reduce((sum, item) => sum + item.accuracy, 0) / recent.length;
  const current = recent.length >= 3 ? adjustDifficulty(history.slice(0, -3)) : 1;
  if (avg >= 90) return Math.min(5, current + 1);
  if (avg < 70) return Math.max(1, current - 1);
  return current;
}

export function calculateStars(stats: SessionStats, age: number): number {
  const wpmTarget = age <= 8 ? 15 : age <= 10 ? 25 : 35;
  let stars = 1;
  if (stats.accuracy >= 80) stars = 2;
  if (stats.accuracy >= 90 && stats.wpm >= wpmTarget * 0.6) stars = 3;
  if (stats.accuracy >= 95 && stats.wpm >= wpmTarget) stars = 4;
  if (stats.accuracy >= 98 && stats.wpm >= wpmTarget * 1.2) stars = 5;
  return stars;
}

export function buildRuleExercises(focusKeys: string[], difficulty: number, age: number) {
  const keys = focusKeys.length > 0 ? focusKeys : ["a", "s", "d", "f"];
  const templates = [
    (k: string) => `${k}${k}${k} fun`,
    (k: string) => `big ${k} cat`,
    (k: string) => `I love ${k}${k}`,
    (k: string) => `${k} is cool`,
    (k: string) => `happy ${k} day`,
  ];

  return keys.slice(0, 3).map((key, index) => ({
    text: templates[index % templates.length](key),
    focusKey: key,
    difficulty,
    ageBand: age <= 8 ? "6-8" : "9-12",
  }));
}

export function getAgeBand(age: number) {
  if (age <= 8) return "6-8";
  return "9-12";
}
