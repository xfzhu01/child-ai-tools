import { describe, expect, it } from "vitest";
import { matchKeystroke, toKeyboardKey } from "@/components/typing/virtual-keyboard";
import { normalizeTypingChar, normalizeTypingText } from "@/lib/typing-engine/typing-chars";

describe("typing punctuation normalization", () => {
  it("maps Chinese comma to English comma", () => {
    expect(normalizeTypingChar("，")).toBe(",");
    expect(normalizeTypingText("jump， play")).toBe("jump, play");
  });

  it("accepts Chinese comma input when English comma is expected", () => {
    expect(matchKeystroke("，", ",")).toBe(true);
    expect(matchKeystroke(",", ",")).toBe(true);
    expect(matchKeystroke("，", "，")).toBe(true);
  });

  it("recognizes normalized comma for keyboard routing", () => {
    expect(toKeyboardKey("，")).toBe(",");
    expect(toKeyboardKey(",")).toBe(",");
  });
});
