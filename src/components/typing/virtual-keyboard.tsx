"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { normalizeKey } from "@/lib/typing-engine/analyzer";
import { normalizeTypingChar } from "@/lib/typing-engine/typing-chars";
import { cn } from "@/lib/utils";

export { normalizeTypingChar, normalizeTypingText } from "@/lib/typing-engine/typing-chars";

const NUMBER_ROW = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
] as const;

const PUNCTUATION_ROW = [",", "."] as const;

export type SpecialKey = "tab" | "enter" | "shift" | "backspace" | "space";
export type LetterKey = (typeof ROWS)[number][number];
export type NumberKey = (typeof NUMBER_ROW)[number];
export type PunctuationKey = (typeof PUNCTUATION_ROW)[number];
export type KeyboardKey = LetterKey | NumberKey | PunctuationKey | SpecialKey;

/** Uniform scale factor for key size, gaps, and keycap styling (default 2, −10%). */
const KB_SCALE = 1.8;

const UNIT_W = "var(--kb-u)";
const TAB_W = "calc(1.5 * var(--kb-u))";
const SHIFT_W = "calc(2.25 * var(--kb-u))";
const BACKSPACE_W = "calc(2 * var(--kb-u))";
const ENTER_W = "calc(2.25 * var(--kb-u))";
const SPACE_W = "calc(6.5 * var(--kb-u))";

/** Stagger offsets — 1 upper-left of Q, Z lower-right of A. */
const ROW_PADDING = {
  number: "var(--kb-u)",
  top: "0",
  home: "0",
  bottom: "calc(2.5 * var(--kb-u) + var(--kb-gap))",
  space: "0",
} as const;

export function keyboardKeyToChar(keyId: KeyboardKey): string {
  switch (keyId) {
    case "space":
      return " ";
    case "tab":
      return "\t";
    case "enter":
      return "\n";
    case "shift":
      return "Shift";
    case "backspace":
      return "Backspace";
    default:
      return keyId;
  }
}

export function charToKeyId(char: string | undefined): KeyboardKey | undefined {
  if (!char) return undefined;
  const normalized = normalizeTypingChar(char);
  if (normalized === " ") return "space";
  if (normalized === "\t") return "tab";
  if (normalized === "\n") return "enter";
  if ((NUMBER_ROW as readonly string[]).includes(normalized)) return normalized as NumberKey;
  if ((PUNCTUATION_ROW as readonly string[]).includes(normalized)) {
    return normalized as PunctuationKey;
  }
  const lower = normalized.toLowerCase();
  for (const row of ROWS) {
    if ((row as readonly string[]).includes(lower)) {
      return lower as LetterKey;
    }
  }
  return undefined;
}

export function inputToKeyId(input: string): KeyboardKey | undefined {
  if (input === " ") return "space";
  if (input === "\t" || input === "Tab") return "tab";
  if (input === "\n" || input === "Enter") return "enter";
  if (input === "Backspace") return "backspace";
  if (input === "Shift") return "shift";
  return toKeyboardKey(input);
}

export function toKeyboardKey(key: string): KeyboardKey | undefined {
  const normalized = key.length === 1 ? normalizeTypingChar(key) : key;
  const aliases: Record<string, KeyboardKey> = {
    " ": "space",
    space: "space",
    "\t": "tab",
    Tab: "tab",
    tab: "tab",
    "\n": "enter",
    Enter: "enter",
    enter: "enter",
    Backspace: "backspace",
    backspace: "backspace",
    Shift: "shift",
    shift: "shift",
  };
  if (aliases[normalized]) return aliases[normalized];
  if ((NUMBER_ROW as readonly string[]).includes(normalized)) return normalized as NumberKey;
  if ((PUNCTUATION_ROW as readonly string[]).includes(normalized)) {
    return normalized as PunctuationKey;
  }
  const lower = normalized.length === 1 ? normalized.toLowerCase() : normalized;
  for (const row of ROWS) {
    if ((row as readonly string[]).includes(lower)) {
      return lower as LetterKey;
    }
  }
  return undefined;
}

export function matchKeystroke(input: string, expectedChar: string): boolean {
  const normalizedInput = normalizeTypingChar(input);
  const normalizedExpected = normalizeTypingChar(expectedChar);
  if (normalizedExpected === "\n") return normalizedInput === "\n";
  if (normalizedExpected === "\t") return normalizedInput === "\t";
  if (normalizedExpected === " ") return normalizedInput === " ";
  if (/[a-zA-Z]/.test(normalizedExpected)) {
    return normalizeKey(normalizedInput) === normalizedExpected.toLowerCase();
  }
  return normalizedInput === normalizedExpected;
}

export function formatKeyLabel(keyId: KeyboardKey): string {
  switch (keyId) {
    case "space":
      return "空格";
    case "tab":
      return "Tab";
    case "enter":
      return "回车";
    case "shift":
      return "Shift";
    case "backspace":
      return "退格";
    case ",":
      return "逗号";
    case ".":
      return "句号";
    default:
      return keyId;
  }
}

export function displayTargetChar(char: string): string {
  const normalized = normalizeTypingChar(char);
  if (normalized === "\n") return "↵";
  if (normalized === "\t") return "⇥";
  return normalized;
}

export type PromptCharState = "typed" | "active" | "pending";

/** Renders exercise prompt characters; spaces use a visible blank slot instead of a dot. */
export function TargetPromptChar({
  char,
  state,
  className,
}: {
  char: string;
  state: PromptCharState;
  className?: string;
}) {
  if (char === " ") {
    return (
      <span
        aria-label="空格"
        title="空格"
        className={cn(
          "mx-1 inline-block align-middle rounded-lg border-2 border-dashed",
          "h-[0.72em] min-w-[1.15em] -translate-y-[0.06em]",
          state === "typed" && "border-emerald-300/90 bg-emerald-400/25 border-solid",
          state === "active" &&
            "border-sky-200 bg-sky-100/35 border-solid shadow-[0_0_0_2px_rgba(56,189,248,0.45)]",
          state === "pending" && "border-white/45 bg-white/15 opacity-70",
          className,
        )}
      />
    );
  }

  return <span className={className}>{displayTargetChar(char)}</span>;
}

type VirtualKeyboardProps = {
  targetKey?: string;
  pressedKey?: string;
  pressResult?: "correct" | "error" | null;
  onKeyPress?: (key: string) => void;
  className?: string;
};

type KeyDef = {
  keyId: KeyboardKey;
  label: ReactNode;
  width: string;
  modifier?: boolean;
  unit?: boolean;
};

type KeyboardRowDef = {
  id: keyof typeof ROW_PADDING;
  keys: KeyDef[];
  center?: boolean;
};

function unitKey(keyId: KeyboardKey, label?: ReactNode): KeyDef {
  return { keyId, label: label ?? keyId, width: UNIT_W, unit: true };
}

function buildRows(): KeyboardRowDef[] {
  return [
    {
      id: "number",
      keys: [
        ...NUMBER_ROW.map((key) => unitKey(key)),
        { keyId: "backspace", label: "⌫", width: BACKSPACE_W, modifier: true },
      ],
    },
    {
      id: "top",
      keys: [
        { keyId: "tab", label: "Tab", width: TAB_W, modifier: true },
        ...ROWS[0].map((key) => unitKey(key)),
      ],
    },
    {
      id: "home",
      keys: [
        { keyId: "shift", label: "⇧", width: SHIFT_W, modifier: true },
        ...ROWS[1].map((key) => unitKey(key)),
        { keyId: "enter", label: "↵ Enter", width: ENTER_W, modifier: true },
      ],
    },
    {
      id: "bottom",
      keys: [
        ...ROWS[2].map((key) => unitKey(key)),
        ...PUNCTUATION_ROW.map((key) => unitKey(key)),
      ],
    },
    {
      id: "space",
      center: true,
      keys: [{ keyId: "space", label: "Space", width: SPACE_W, modifier: true }],
    },
  ];
}

const KEYBOARD_ROWS = buildRows();

function KeyCap({
  keyId,
  label,
  width,
  modifier = false,
  unit = false,
  targetKey,
  pressedKey,
  pressResult,
  shiftActive,
  onPress,
}: KeyDef & {
  targetKey?: KeyboardKey;
  pressedKey?: KeyboardKey;
  pressResult?: "correct" | "error" | null;
  shiftActive?: boolean;
  onPress?: (keyId: KeyboardKey) => void;
}) {
  const isTarget = targetKey === keyId;
  const isPressed = pressedKey === keyId;
  const isShiftOn = keyId === "shift" && shiftActive;
  const isErrorFlash = isPressed && pressResult === "error";
  const isCorrectFlash = isPressed && pressResult === "correct";
  const showBaseStyle = !isErrorFlash && !isCorrectFlash;

  return (
    <button
      type="button"
      aria-label={formatKeyLabel(keyId)}
      onClick={() => onPress?.(keyId)}
      style={{ width, height: "var(--kb-h)", flexShrink: 0, borderRadius: "var(--kb-radius)" }}
      className={cn(
        "relative min-w-0 select-none border text-center transition-[transform,box-shadow,background] duration-75 active:translate-y-[var(--kb-press)]",
        showBaseStyle &&
          (modifier
            ? "border-[#8a8a8a] bg-gradient-to-b from-[#c4c4c4] via-[#b0b0b0] to-[#959595] text-[#2a2a2a] shadow-[0_3px_0_#6b6b6b,0_5px_8px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.55)] active:border-b active:shadow-[0_1px_0_#6b6b6b,inset_0_2px_4px_rgba(0,0,0,0.18)]"
            : "border-[#a3a3a3] bg-gradient-to-b from-[#fafafa] via-[#ececec] to-[#d4d4d4] text-[#1f1f1f] shadow-[0_3px_0_#8a8a8a,0_5px_8px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] active:border-b active:shadow-[0_1px_0_#8a8a8a,inset_0_2px_4px_rgba(0,0,0,0.12)]"),
        (isTarget || isShiftOn) &&
          !isPressed &&
          "z-10 border-sky-400 bg-gradient-to-b from-sky-100 via-sky-200 to-sky-300 text-sky-950 kb-animate-target",
        isCorrectFlash && "kb-animate-correct z-20 text-emerald-950",
        isErrorFlash && "kb-animate-error z-20",
      )}
    >
      <span className="flex h-full flex-col items-center justify-center leading-none">
        <span
          className={cn(
            "font-semibold uppercase leading-none",
            !unit && "text-[0.72em] tracking-wide",
          )}
          style={unit ? { fontSize: "calc(var(--kb-u) * 0.42)" } : undefined}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

export function VirtualKeyboard({
  targetKey,
  pressedKey,
  pressResult,
  onKeyPress,
  className,
}: VirtualKeyboardProps) {
  const [shiftActive, setShiftActive] = useState(false);
  const target = targetKey ? charToKeyId(targetKey) ?? toKeyboardKey(targetKey) : undefined;
  const pressed = pressedKey ? inputToKeyId(pressedKey) ?? toKeyboardKey(pressedKey) : undefined;

  const handlePress = (keyId: KeyboardKey) => {
    if (keyId === "shift") {
      setShiftActive((value) => !value);
      return;
    }

    if (keyId === "backspace") {
      onKeyPress?.("Backspace");
      return;
    }

    let output = keyboardKeyToChar(keyId);
    if (shiftActive && output.length === 1 && /[a-z]/.test(output)) {
      output = output.toUpperCase();
      setShiftActive(false);
    }

    onKeyPress?.(output);
  };

  const shared = {
    targetKey: target,
    pressedKey: pressed,
    pressResult,
    shiftActive,
    onPress: handlePress,
  };

  return (
    <div
      className={cn(
        "w-full rounded-t-[1.75rem] bg-gradient-to-b from-[#3d3d3d] to-[#252525] px-3 pb-5 pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] sm:px-5",
        className,
      )}
      style={
        {
          "--kb-scale": KB_SCALE,
          "--kb-u": `clamp(${1.65 * KB_SCALE}rem, ${3.6 * KB_SCALE}vw, ${2.45 * KB_SCALE}rem)`,
          "--kb-h": "var(--kb-u)",
          "--kb-gap": `${5 * KB_SCALE}px`,
          "--kb-radius": `${7 * KB_SCALE}px`,
          "--kb-press": `${2 * KB_SCALE}px`,
        } as CSSProperties
      }
    >
      <p className="mb-3 text-center text-xs font-medium text-white/60">
        {target ? (
          <>
            下一个按键
            <span className="mx-2 inline-flex min-h-7 min-w-9 items-center justify-center rounded-md border border-sky-400/40 bg-gradient-to-b from-sky-200 to-sky-400 px-2.5 text-sm font-black uppercase text-sky-950 shadow-[0_2px_0_#0369a1,inset_0_1px_0_rgba(255,255,255,0.4)]">
              {formatKeyLabel(target)}
            </span>
          </>
        ) : (
          "练习完成"
        )}
      </p>

      <div className="relative mx-auto w-fit max-w-full overflow-x-auto rounded-2xl border border-[#1a1a1a] bg-[#2e2e2e] p-5 shadow-[inset_0_3px_12px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
        <div className="relative z-10 flex flex-col" style={{ gap: "var(--kb-gap)" }}>
          {KEYBOARD_ROWS.map((row) => (
            <div
              key={row.id}
              className={cn("flex", row.center && "justify-center")}
              style={{
                gap: "var(--kb-gap)",
                paddingLeft: row.center ? undefined : ROW_PADDING[row.id],
              }}
            >
              {row.keys.map((key) => (
                <KeyCap key={key.keyId} {...key} {...shared} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { ROWS, NUMBER_ROW, PUNCTUATION_ROW, ROW_PADDING };
