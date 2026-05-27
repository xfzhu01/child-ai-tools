"use client";

import { useMemo, type CSSProperties } from "react";
import type { AiMiniGameType } from "@/lib/ai/mini-games";
import { MINI_GAME_META } from "@/lib/ai/mini-games";
import { displayTargetChar } from "@/components/typing/virtual-keyboard";
import { cn } from "@/lib/utils";

type Props = {
  gameType: AiMiniGameType;
  gameTitle?: string;
  gameEmoji?: string;
  levelTitle: string;
  targetText: string;
  displayPrompt?: string;
  hint?: string;
  typedLength: number;
  itemRound: number;
  totalRounds: number;
  combo: number;
  celebrating: boolean;
  shatteringIndices: number[];
  errorShake: boolean;
};

function AiCustomShatter({ char }: { char: string }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const distance = 28 + (i % 2) * 10;
        return {
          id: i,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          rot: i * 55 + (i % 2 === 0 ? 12 : -12),
        };
      }),
    [],
  );

  return (
    <span className="ai-custom-shatter relative inline-flex h-[1.15em] min-w-[0.75em] items-center justify-center">
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="ai-custom-spark absolute left-1/2 top-1/2 font-black text-yellow-100"
          style={
            {
              "--tx": `${spark.tx}px`,
              "--ty": `${spark.ty}px`,
              "--rot": `${spark.rot}deg`,
              animationDelay: `${spark.id * 12}ms`,
            } as CSSProperties
          }
        >
          {char}
        </span>
      ))}
      <span className="ai-custom-spark-flash absolute text-lg leading-none">✨</span>
    </span>
  );
}

type CharProps = {
  char: string;
  revealChar?: string;
  index: number;
  typedLength: number;
  shatteringIndices: number[];
  errorShake: boolean;
};

function AiCustomChar({ char, revealChar, index, typedLength, shatteringIndices, errorShake }: CharProps) {
  const isShattering = shatteringIndices.includes(index);
  const isDone = index < typedLength && !isShattering;
  const isActive = index === typedLength;
  const shownChar = isDone && revealChar !== undefined ? revealChar : char;

  if (char === " ") {
    return (
      <span
        aria-label="空格"
        title="空格"
        className={cn(
          "ai-custom-space mx-0.5 inline-block align-middle rounded-md border-2 border-dashed",
          "h-[0.72em] min-w-[1.1em] -translate-y-[0.06em] transition-all duration-150 ease-out",
          isDone && "border-emerald-200/90 bg-emerald-400/25 border-solid",
          isActive &&
            "ai-custom-char-active border-yellow-200/90 bg-yellow-100/20 border-solid shadow-[0_0_0_2px_rgb(250_204_21/0.35)]",
          isActive && errorShake && "ai-custom-char-shake",
          !isDone && !isActive && "border-white/40 bg-white/10 opacity-70",
        )}
      />
    );
  }

  if (isShattering) {
    return <AiCustomShatter char={displayTargetChar(shownChar)} />;
  }

  return (
    <span
      className={cn(
        "ai-custom-char inline-block origin-center transition-[transform,color,opacity,filter] duration-150 ease-out will-change-transform",
        isDone && "ai-custom-char-done scale-95 text-emerald-200",
        isActive && "ai-custom-char-active scale-110 text-yellow-100 drop-shadow-[0_0_12px_rgb(250_204_21/0.55)]",
        isActive && errorShake && "ai-custom-char-shake text-rose-200",
        !isDone && !isActive && "text-white/80",
      )}
    >
      {displayTargetChar(shownChar)}
    </span>
  );
}

export function AiCustomStage({
  gameType,
  gameTitle,
  gameEmoji,
  levelTitle,
  targetText,
  displayPrompt,
  hint,
  typedLength,
  itemRound,
  totalRounds,
  combo,
  celebrating,
  shatteringIndices,
  errorShake,
}: Props) {
  const meta = MINI_GAME_META[gameType];
  const title = gameTitle ?? meta.title;
  const emoji = gameEmoji ?? meta.emoji;
  const maskedMode = Boolean(displayPrompt);
  const visibleText = displayPrompt ?? targetText;
  const chars = visibleText.split("");
  const progress = Math.min(100, (typedLength / Math.max(targetText.length, 1)) * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-6 text-white shadow-xl md:p-8",
        errorShake && "ai-custom-stage-shake",
      )}
    >
      <div className="pointer-events-none absolute -left-8 top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-6 bottom-6 h-28 w-28 rounded-full bg-fuchsia-300/20 blur-2xl" />

      <div className="relative z-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm opacity-95">
          <span>
            {emoji} {title} · 第 {itemRound}/{totalRounds} 轮
          </span>
          <span key={combo} className={cn("ai-custom-combo rounded-full bg-white/15 px-2.5 py-0.5")}>
            连击 {combo}
          </span>
        </div>
        <p className="text-xs opacity-90">{levelTitle}</p>
        <p className="mt-1 text-sm font-medium text-fuchsia-100">{meta.description}</p>
        {hint ? <p className="mt-2 text-sm text-amber-100">{hint}</p> : null}

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="ai-custom-progress h-full rounded-full bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative mt-6 min-h-20 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex min-h-14 flex-wrap items-center justify-center gap-x-0.5 gap-y-1 text-3xl font-black tracking-wide md:text-4xl">
            {chars.map((char, index) => (
              <AiCustomChar
                key={`${itemRound}-${index}-${char}`}
                char={char}
                revealChar={maskedMode ? targetText[index] : undefined}
                index={index}
                typedLength={typedLength}
                shatteringIndices={shatteringIndices}
                errorShake={errorShake && index === typedLength}
              />
            ))}
          </div>

          {celebrating ? (
            <div className="ai-custom-round-pop pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-5 py-2 shadow-lg backdrop-blur-sm">
                <span className="text-2xl leading-none">✨</span>
                <span className="text-lg font-black text-white">完成！</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
