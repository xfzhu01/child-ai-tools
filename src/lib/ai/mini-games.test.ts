import { describe, expect, it } from "vitest";
import {
  MINI_GAME_TYPES,
  buildRuleMiniGameItems,
  pickMiniGameTypeForLevel,
  shuffledMiniGameDeck,
} from "@/lib/ai/mini-games";

describe("mini-game rotation", () => {
  it("includes every mini-game once in each block of 8 levels", () => {
    const childId = "child-test-1";
    const blockGames = Array.from({ length: 8 }, (_, i) => pickMiniGameTypeForLevel(childId, i + 1));
    expect(new Set(blockGames).size).toBe(MINI_GAME_TYPES.length);
    expect([...new Set(blockGames)].sort()).toEqual([...MINI_GAME_TYPES].sort());
  });

  it("keeps the same game for the same child and level", () => {
    expect(pickMiniGameTypeForLevel("child-a", 12)).toBe(pickMiniGameTypeForLevel("child-a", 12));
  });

  it("uses different shuffles for different blocks", () => {
    const block0 = shuffledMiniGameDeck("child-a", 0);
    const block1 = shuffledMiniGameDeck("child-a", 1);
    expect(block0).not.toEqual(block1);
  });

  it("distributes all game types across the first 24 levels", () => {
    const counts = Object.fromEntries(MINI_GAME_TYPES.map((type) => [type, 0])) as Record<
      (typeof MINI_GAME_TYPES)[number],
      number
    >;

    for (let level = 1; level <= 24; level++) {
      const type = pickMiniGameTypeForLevel("child-b", level);
      counts[type] += 1;
    }

    for (const type of MINI_GAME_TYPES) {
      expect(counts[type]).toBe(3);
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
