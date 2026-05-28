"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MINI_GAME_META } from "@/lib/ai/mini-games";
import { cn } from "@/lib/utils";

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
  typedLength,
  itemRound,
  totalRounds,
  combo,
  errorShake,
}: Props) {
  const meta = MINI_GAME_META.key_rain;
  const title = gameTitle ?? meta.title;
  const emoji = gameEmoji ?? meta.emoji;
  const targetLetter = (targetText[0] ?? "a").toLowerCase();
  const caught = typedLength >= targetText.length;

  const [flashLetter, setFlashLetter] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevRound = useRef(itemRound);

  useEffect(() => {
    if (itemRound > prevRound.current) {
      setFlashLetter(targetText[0]?.toLowerCase() ?? null);
      flashTimer.current = setTimeout(() => setFlashLetter(null), 300);
      prevRound.current = itemRound;
    }
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [itemRound, targetText]);

  const progress = ((itemRound - 1) / totalRounds) * 100;

  return (
    <div
      className={cn(
        "rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-5 text-white shadow-xl md:p-7",
        errorShake && "animate-[shake_0.3s_ease-in-out]",
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-bold">
          {emoji} {title}
        </span>
        <span className="text-xs text-indigo-300">{levelTitle}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main arena */}
      <div className="relative flex min-h-[200px] flex-col items-center justify-center">
        {/* Caught flash effect */}
        {flashLetter ? (
          <span
            key={`flash-${itemRound}`}
            className="pointer-events-none absolute text-7xl font-black uppercase text-emerald-400/60 animate-[ping_0.4s_ease-out_forwards]"
          >
            {flashLetter}
          </span>
        ) : null}

        {/* Target letter */}
        {!caught ? (
          <div
            key={`target-${itemRound}-${targetLetter}`}
            className="flex flex-col items-center gap-4"
          >
            <span
              className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 text-5xl font-black uppercase text-slate-900 shadow-[0_0_40px_rgb(250_204_21/0.4)] animate-[bounce_1.5s_ease-in-out_infinite]"
              style={{ "--tw-bounce-transform": "translateY(-8px)" } as CSSProperties}
            >
              {targetLetter}
            </span>
            <p className="text-sm font-medium text-indigo-200">
              按{" "}
              <kbd className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 font-mono text-base font-bold uppercase text-amber-200">
                {targetLetter}
              </kbd>
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">✅</span>
            <p className="text-sm font-bold text-emerald-300">全部接住！</p>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-indigo-300">
          第 {itemRound}/{totalRounds} 个
        </span>
        <span
          className={cn(
            "font-bold tabular-nums transition-colors",
            combo >= 5 ? "text-amber-300" : combo >= 3 ? "text-emerald-300" : "text-indigo-300",
          )}
        >
          {combo > 0 ? `🔥 连击 ${combo}` : "连击 0"}
        </span>
      </div>

      {caught ? (
        <p className="mt-3 text-center text-xs text-indigo-400 animate-pulse">
          自动继续中...
        </p>
      ) : null}
    </div>
  );
}
