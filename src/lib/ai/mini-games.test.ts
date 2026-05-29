import { describe, expect, it } from "vitest";
import {
  MINI_GAME_TYPES,
  buildRuleMiniGameItems,
  pickRandomMiniGameType,
} from "@/lib/ai/mini-games";

describe("mini-game random selection", () => {
  it("always returns a valid mini-game type", () => {
    for (let i = 0; i < 200; i++) {
      expect(MINI_GAME_TYPES).toContain(pickRandomMiniGameType());
    }
  });

  it("never repeats the excluded (previous) game", () => {
    for (const exclude of MINI_GAME_TYPES) {
      for (let i = 0; i < 100; i++) {
        expect(pickRandomMiniGameType(exclude)).not.toBe(exclude);
      }
    }
  });

  it("can still produce every game type when excluding one", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      seen.add(pickRandomMiniGameType("word_burst"));
    }
    // 排除 word_burst 后，其余 7 个游戏都应有机会出现。
    expect(seen.size).toBe(MINI_GAME_TYPES.length - 1);
    expect(seen.has("word_burst")).toBe(false);
  });

  it("distributes the 8 games roughly equally over many picks", () => {
    const counts = Object.fromEntries(MINI_GAME_TYPES.map((type) => [type, 0])) as Record<
      (typeof MINI_GAME_TYPES)[number],
      number
    >;
    const total = 80_000;
    for (let i = 0; i < total; i++) {
      counts[pickRandomMiniGameType()] += 1;
    }
    const expected = total / MINI_GAME_TYPES.length;
    for (const type of MINI_GAME_TYPES) {
      // 等概率：每个游戏出现次数应落在期望值 ±15% 内。
      expect(counts[type]).toBeGreaterThan(expected * 0.85);
      expect(counts[type]).toBeLessThan(expected * 1.15);
    }
  });

  it("pads rule-generated items to the mini-game target count", () => {
    const items = buildRuleMiniGameItems("word_burst", {
      focusKeys: ["f"],
      age: 8,
      difficulty: 2,
    });
    expect(items.length).toBe(6);
  });
});
