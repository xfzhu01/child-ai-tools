"use client";

import { useMemo, type CSSProperties } from "react";
import { MINI_GAME_META } from "@/lib/ai/mini-games";
import { cn } from "@/lib/utils";

const RAIN_CHARS = "abcdefghijklmnopqrstuvwxyz";

type RainDrop = {
  id: number;
  char: string;
  left: number;
  delay: number;
  duration: number;
  size: "sm" | "md";
  drift: number;
};

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function buildRainDrops(seed: number, count: number, exclude: string): RainDrop[] {
  const drops: RainDrop[] = [];
  let state = seed || 1;

  for (let i = 0; i < count; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    let char = RAIN_CHARS[state % RAIN_CHARS.length]!;
    if (char === exclude && RAIN_CHARS.length > 1) {
      char = RAIN_CHARS[(state >> 8) % RAIN_CHARS.length]!;
    }
    state = (state * 1664525 + 1013904223) >>> 0;
    drops.push({
      id: i,
      char,
      left: 4 + (state % 9200) / 100,
      delay: ((state >> 4) % 280) / 100,
      duration: 2.2 + ((state >> 10) % 18) / 10,
      size: (state >> 14) % 3 === 0 ? "md" : "sm",
      drift: -6 + ((state >> 6) % 13),
    });
  }

  return drops;
}

type Props = {
  gameTitle?: string;
  gameEmoji?: string;
  levelTitle: string;
  targetText: string;
  hint?: string;
  typedLength: number;
  itemRound: number;
  totalRounds: number;
  combo: number;
  celebrating: boolean;
  errorShake: boolean;
};

export function KeyRainStage({
  gameTitle,
  gameEmoji,
  levelTitle,
  targetText,
  hint,
  typedLength,
  itemRound,
  totalRounds,
  combo,
  celebrating,
  errorShake,
}: Props) {
  const meta = MINI_GAME_META.key_rain;
  const title = gameTitle ?? meta.title;
  const emoji = gameEmoji ?? meta.emoji;
  const targetLetter = (targetText[0] ?? "a").toLowerCase();
  const isDone = typedLength >= targetText.length;
  const isActive = !isDone && !celebrating;

  const rainDrops = useMemo(
    () => buildRainDrops(hashSeed(`${itemRound}:${targetLetter}`), 22, targetLetter),
    [itemRound, targetLetter],
  );

  return (
    <div
      className={cn(
        "rounded-3xl bg-gradient-to-br from-slate-800 via-indigo-900 to-violet-900 p-6 text-white shadow-xl md:p-8",
        errorShake && "animate-[shake_0.35s_ease-in-out]",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm opacity-95">
        <span>
          {emoji} {title} · 第 {itemRound}/{totalRounds} 滴
        </span>
        <span>连击 {combo}</span>
      </div>
      <p className="text-xs opacity-90">{levelTitle}</p>
      <p className="mt-1 text-sm font-medium text-indigo-200">{meta.description}</p>
      {hint ? <p className="mt-2 text-sm text-amber-200">{hint}</p> : null}

      <div className="key-rain-arena relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950/40 via-indigo-950/30 to-violet-950/50 shadow-inner">
        <div className="key-rain-sky pointer-events-none absolute inset-0" aria-hidden>
          {rainDrops.map((drop) => (
            <span
              key={drop.id}
              className={cn(
                "key-rain-drop absolute top-0 font-bold text-white/50",
                drop.size === "md" ? "text-lg" : "text-sm",
              )}
              style={
                {
                  left: `${drop.left}%`,
                  "--fall-delay": `${drop.delay}s`,
                  "--fall-duration": `${drop.duration}s`,
                  "--fall-drift": `${drop.drift}px`,
                } as CSSProperties
              }
            >
              {drop.char}
            </span>
          ))}
        </div>

        <div className="key-rain-mist pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="key-rain-ground pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-violet-500/25 to-transparent" />

        <div className="relative min-h-[220px] px-4 pb-6 pt-4">
          <p className="pointer-events-none absolute inset-x-0 top-3 z-10 text-center text-xs font-medium uppercase tracking-[0.2em] text-indigo-200/80">
            接住这滴字母雨
          </p>

          {isActive ? (
            <span
              key={`${itemRound}-${targetLetter}-fall`}
              className="key-rain-target key-rain-target--falling absolute left-1/2 z-20 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-2xl border-2 border-yellow-300/90 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 text-4xl font-black uppercase text-slate-900 shadow-[0_8px_28px_rgb(250_204_21/0.5)]"
            >
              {targetLetter}
            </span>
          ) : null}

          {(isDone || celebrating) && (
            <div className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center">
              <span
                key={`${itemRound}-${targetLetter}-caught`}
                className="key-rain-target key-rain-target--caught flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-300 to-green-500 text-4xl font-black uppercase text-white shadow-[0_8px_24px_rgb(16_185_129/0.45)]"
              >
                {targetLetter}
              </span>
              <p className="mt-4 text-sm text-emerald-100">接住了！</p>
            </div>
          )}

          {isActive ? (
            <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center">
              <div className="key-rain-catch-zone h-1 w-24 rounded-full bg-yellow-300/70" />
              <p className="mt-4 text-sm text-indigo-100/90">
                按键盘{" "}
                <kbd className="rounded-lg border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-base font-bold uppercase text-yellow-200">
                  {targetLetter}
                </kbd>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
