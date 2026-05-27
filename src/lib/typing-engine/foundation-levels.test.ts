import { describe, expect, it } from "vitest";
import {
  FOUNDATION_LEVEL_COUNT,
  FOUNDATION_LEVELS,
  FOUNDATION_LETTER_ORDER,
  getFoundationLevel,
} from "./foundation-levels";

describe("foundation-levels", () => {
  it("has 26 letter levels and one exam", () => {
    const letters = FOUNDATION_LEVELS.filter((l) => l.kind === "letter");
    const exams = FOUNDATION_LEVELS.filter((l) => l.kind === "exam");

    expect(letters).toHaveLength(26);
    expect(letters.map((l) => l.letter)).toEqual([...FOUNDATION_LETTER_ORDER]);
    expect(FOUNDATION_LEVELS.filter((l) => l.kind === "practice")).toHaveLength(0);
    expect(exams).toHaveLength(1);
    expect(exams[0]?.items).toHaveLength(50);
    expect(exams[0]?.minAccuracy).toBe(80);
    expect(FOUNDATION_LEVEL_COUNT).toBe(27);
  });

  it("every letter level has drills", () => {
    for (const level of FOUNDATION_LEVELS) {
      if (level.kind === "letter") {
        expect(level.items.length).toBe(8);
        expect(level.letter).toBeTruthy();
      }
    }
  });

  it("exam level is last", () => {
    const last = getFoundationLevel(FOUNDATION_LEVEL_COUNT);
    expect(last?.kind).toBe("exam");
    expect(getFoundationLevel(26)?.kind).toBe("letter");
  });
});
