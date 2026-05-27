"use client";

import { TargetPromptChar } from "@/components/typing/virtual-keyboard";

type ChainStageProps = {
  hanzi: string;
  pinyinTarget: string;
  typedLength: number;
  chainHint?: string;
  idiomRound: number;
  totalRounds: number;
  combo: number;
  levelTitle: string;
};

export function ChainStage({
  hanzi,
  pinyinTarget,
  typedLength,
  chainHint,
  idiomRound,
  totalRounds,
  combo,
  levelTitle,
}: ChainStageProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 p-8 text-white shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm opacity-90">
        <span>{levelTitle}</span>
        <span>
          成语 {idiomRound}/{totalRounds} · 连击 {combo}
        </span>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/75">汉字</p>
        <p className="mt-2 text-5xl font-black tracking-widest drop-shadow-md">{hanzi}</p>
        {chainHint && <p className="mt-2 text-sm text-white/80">{chainHint}</p>}
      </div>

      <div className="mt-8">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/75">
          输入拼音
        </p>
        <div className="min-h-14 whitespace-pre-wrap text-center text-3xl font-bold tracking-wide md:text-4xl">
          {pinyinTarget.split("").map((char, index) => {
            const state =
              index < typedLength ? "typed" : index === typedLength ? "active" : "pending";
            const colorClass =
              index < typedLength
                ? "text-emerald-200"
                : index === typedLength
                  ? char === " "
                    ? ""
                    : "underline decoration-sky-200 decoration-4"
                  : "opacity-70";

            return (
              <TargetPromptChar
                key={`${char}-${index}`}
                char={char}
                state={state}
                className={colorClass}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
