import { describe, expect, it } from "vitest";
import {
  adjustDifficulty,
  analyzeSession,
  calculateStars,
  rankWeakKeys,
  type KeystrokeEvent,
} from "./analyzer";

function makeEvents(keys: string[], correctPattern: boolean[]) {
  const now = Date.now();
  return keys.map((key, index) => ({
    key,
    timestamp: now + index * 200,
    correct: correctPattern[index] ?? true,
    latencyMs: 300,
    expected: key,
  } satisfies KeystrokeEvent));
}

describe("analyzeSession", () => {
  it("computes accuracy and wpm", () => {
    const events = makeEvents(["h", "e", "l", "l", "o"], [true, true, true, true, true]);
    const stats = analyzeSession(events);
    expect(stats.accuracy).toBe(100);
    expect(stats.wpm).toBeGreaterThan(0);
    expect(stats.comboMax).toBe(5);
  });

  it("tracks error keys", () => {
    const events = makeEvents(["a", "b", "a"], [true, false, false]);
    events[1]!.expected = "a";
    events[2]!.expected = "a";
    const stats = analyzeSession(events);
    expect(stats.errorKeys[0]).toBe("a");
  });
});

describe("rankWeakKeys", () => {
  it("orders keys by error rate", () => {
    const keys = ["a", "a", "a", "b", "b", "b"];
    const correct = [false, false, false, true, true, true];
    const events = makeEvents(keys, correct);
    events.forEach((e, i) => {
      e.expected = i < 3 ? "a" : "b";
    });
    const ranked = rankWeakKeys([{ rawEvents: events }]);
    expect(ranked[0]?.key).toBe("a");
  });
});

describe("adjustDifficulty", () => {
  it("increases difficulty after strong sessions", () => {
    expect(adjustDifficulty([{ accuracy: 95 }, { accuracy: 92 }, { accuracy: 91 }])).toBeGreaterThan(1);
  });

  it("decreases difficulty after weak sessions", () => {
    expect(adjustDifficulty([{ accuracy: 60 }, { accuracy: 55 }, { accuracy: 50 }])).toBe(1);
  });
});

describe("calculateStars", () => {
  it("awards more stars for accurate fast typing", () => {
    const stars = calculateStars(
      { wpm: 40, accuracy: 98, durationSec: 30, errorKeys: [], slowKeys: [], comboMax: 10 },
      10,
    );
    expect(stars).toBeGreaterThanOrEqual(4);
  });
});
