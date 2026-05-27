"use client";

import { TargetPromptChar } from "@/components/typing/virtual-keyboard";

type Props = {
  text: string;
  typedLength: number;
  letter?: string;
  kindLabel: "letter" | "exam";
  itemRound: number;
  totalRounds: number;
  combo: number;
  levelTitle: string;
  shatteringIndices?: number[];
  errorShake?: boolean;
  celebrating?: boolean;
  passHint?: string;
};

export function FoundationStage({
  text,
  typedLength,
  letter,
  kindLabel,
  itemRound,
  totalRounds,
  combo,
  levelTitle,
  shatteringIndices = [],
  errorShake = false,
  celebrating = false,
  passHint,
}: Props) {
  const isLetterLevel = kindLabel === "letter" && letter;
  const isExam = kindLabel === "exam";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          第 {itemRound}/{totalRounds} 项 · 连击 {combo}
        </span>
        <span>{levelTitle}</span>
      </div>

      {isLetterLevel ? (
        <div
          className={`relative mx-auto max-w-sm overflow-hidden rounded-3xl border-4 border-amber-300 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-8 shadow-lg ${
            errorShake ? "animate-shake" : ""
          } ${celebrating ? "scale-[1.02] transition-transform" : ""}`}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #fcd34d 0, #fcd34d 2px, transparent 2px, transparent 8px)",
            }}
          />
          <p className="relative text-center text-xs font-bold uppercase tracking-widest text-amber-700">
            刮开字母卡
          </p>
          <p className="relative mt-4 text-center text-8xl font-black text-indigo-700 md:text-9xl">
            {letter.toUpperCase()}
          </p>
          <p className="relative mt-4 text-center text-sm text-amber-800">请输入下方练习内容</p>
        </div>
      ) : null}

      {isExam && passHint ? (
        <p className="rounded-xl bg-violet-50 px-4 py-2 text-center text-sm text-violet-800">{passHint}</p>
      ) : null}

      <div
        className={`rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-8 text-white shadow-xl ${
          errorShake ? "animate-shake" : ""
        }`}
      >
        <div className="min-h-16 whitespace-pre-wrap text-3xl font-bold tracking-wide md:text-4xl">
          {text.split("").map((char, index) => {
            const state =
              index < typedLength ? "typed" : index === typedLength ? "active" : "pending";
            const shattered = shatteringIndices.includes(index);
            const colorClass =
              index < typedLength
                ? "text-emerald-300"
                : index === typedLength
                  ? char === " "
                    ? ""
                    : "underline decoration-sky-300 decoration-4"
                  : "opacity-70";

            return (
              <TargetPromptChar
                key={`${char}-${index}`}
                char={char}
                state={state}
                className={`${colorClass} ${shattered ? "animate-pulse opacity-30" : ""}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
