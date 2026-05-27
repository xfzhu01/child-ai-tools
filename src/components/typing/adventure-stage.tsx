"use client";

import { useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const LETTER_PALETTE = [
  { bg: "from-amber-300 to-orange-400", ring: "ring-amber-200", shadow: "shadow-amber-300/50" },
  { bg: "from-pink-300 to-rose-400", ring: "ring-pink-200", shadow: "shadow-pink-300/50" },
  { bg: "from-sky-300 to-blue-400", ring: "ring-sky-200", shadow: "shadow-sky-300/50" },
  { bg: "from-emerald-300 to-green-400", ring: "ring-emerald-200", shadow: "shadow-emerald-300/50" },
  { bg: "from-violet-300 to-purple-400", ring: "ring-violet-200", shadow: "shadow-violet-300/50" },
  { bg: "from-yellow-300 to-amber-400", ring: "ring-yellow-200", shadow: "shadow-yellow-300/50" },
];

function getLetterStyle(index: number) {
  return LETTER_PALETTE[index % LETTER_PALETTE.length]!;
}

type ShatterBurstProps = {
  char: string;
  palette: (typeof LETTER_PALETTE)[number];
};

function ShatterBurst({ char, palette }: ShatterBurstProps) {
  const shards = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const distance = 48 + (i % 3) * 16;
        return {
          id: i,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          rot: i * 36 + (i % 2 === 0 ? 20 : -20),
          scale: 0.25 + (i % 4) * 0.08,
        };
      }),
    [],
  );

  return (
    <div className="relative flex h-24 w-16 items-center justify-center">
      {shards.map((shard) => (
        <span
          key={shard.id}
          className={cn(
            "adventure-shard absolute left-1/2 top-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-lg font-black text-white shadow-md",
            palette.bg,
            palette.shadow,
          )}
          style={
            {
              "--tx": `${shard.tx}px`,
              "--ty": `${shard.ty}px`,
              "--rot": `${shard.rot}deg`,
              "--scale": shard.scale,
              animationDelay: `${shard.id * 18}ms`,
            } as CSSProperties
          }
        >
          {char}
        </span>
      ))}
      <span className="adventure-spark absolute text-2xl">✨</span>
    </div>
  );
}

type AdventureLetterProps = {
  char: string;
  index: number;
  typedLength: number;
  shatteringIndices: number[];
  errorShake: boolean;
};

function AdventureLetter({ char, index, typedLength, shatteringIndices, errorShake }: AdventureLetterProps) {
  const palette = getLetterStyle(index);
  const isShattering = shatteringIndices.includes(index);
  const isDone = index < typedLength && !isShattering;
  const isActive = index === typedLength;
  const isPending = index > typedLength;

  if (isDone) {
    return (
      <div className="flex h-24 w-16 flex-col items-center justify-end">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-white/50 bg-white/20 text-xl opacity-60">
          ✓
        </div>
        <span className="mt-2 text-xs font-medium text-white/70">已击破</span>
      </div>
    );
  }

  if (isShattering) {
    return <ShatterBurst char={char} palette={palette} />;
  }

  return (
    <div
      className={cn(
        "flex h-24 w-16 flex-col items-center justify-center",
        isPending && "adventure-letter-float",
      )}
      style={isPending ? { animationDelay: `${index * 120}ms` } : undefined}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl font-black uppercase text-white shadow-lg ring-4",
          palette.bg,
          palette.ring,
          palette.shadow,
          isActive && "adventure-letter-active scale-110",
          isActive && errorShake && "adventure-letter-shake",
          isPending && "scale-95 opacity-80",
        )}
      >
        {char}
      </div>
    </div>
  );
}

type AdventureStageProps = {
  word: string;
  typedLength: number;
  shatteringIndices: number[];
  errorShake: boolean;
  wordRound: number;
  totalRounds: number;
  combo: number;
  celebrating: boolean;
  levelTitle?: string;
};

export function AdventureStage({
  word,
  typedLength,
  shatteringIndices,
  errorShake,
  wordRound,
  totalRounds,
  combo,
  celebrating,
  levelTitle,
}: AdventureStageProps) {
  const letters = word.split("");

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border-4 border-sky-300/80 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-300 shadow-xl shadow-sky-200/60">
      <div className="adventure-cloud pointer-events-none absolute left-[8%] top-8 h-10 w-24 rounded-full bg-white/70 blur-[1px]" />
      <div className="adventure-cloud pointer-events-none absolute right-[12%] top-16 h-8 w-20 rounded-full bg-white/60 blur-[1px] [animation-delay:1.5s]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-400/90 to-transparent" />
      <div className="pointer-events-none absolute bottom-4 left-[10%] text-3xl opacity-80">🌿</div>
      <div className="pointer-events-none absolute bottom-4 right-[10%] text-3xl opacity-80">🌸</div>

      <div className="relative z-10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-white drop-shadow">
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
            🎮 {levelTitle ?? "字母大冒险"} · 单词 {wordRound}/{totalRounds}
          </span>
          <span className="rounded-full bg-amber-400/90 px-3 py-1 text-amber-950">
            连击 {combo}
          </span>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">目标单词</p>
          <p className="mt-1 text-2xl font-black drop-shadow-md">
            {word.split("").map((char, index) => (
              <span
                key={`${word}-title-${index}`}
                className={index < typedLength ? "text-emerald-300" : "text-white"}
              >
                {char}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all duration-300"
            style={{ width: `${Math.min(100, (typedLength / Math.max(letters.length, 1)) * 100)}%` }}
          />
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-center gap-4 md:gap-5">
          {letters.map((char, index) => (
            <AdventureLetter
              key={`${word}-${index}-${char}`}
              char={char}
              index={index}
              typedLength={typedLength}
              shatteringIndices={shatteringIndices}
              errorShake={errorShake && index === typedLength}
            />
          ))}
        </div>

        {celebrating && (
          <div className="adventure-celebrate pointer-events-none absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px]">
            <div className="rounded-3xl bg-white/90 px-8 py-4 text-center shadow-xl">
              <p className="text-3xl">🎉</p>
              <p className="mt-2 text-xl font-black text-emerald-600">单词击破！</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
