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

const GAME_THEMES: Record<
  AiMiniGameType,
  { gradient: string; accent: string; progressBar: string; comboColor: string }
> = {
  word_burst: {
    gradient: "from-orange-600 via-red-600 to-rose-700",
    accent: "text-orange-100",
    progressBar: "from-yellow-300 via-orange-300 to-red-400",
    comboColor: "bg-orange-900/40 text-orange-200",
  },
  key_sprint: {
    gradient: "from-cyan-600 via-blue-600 to-indigo-700",
    accent: "text-cyan-100",
    progressBar: "from-cyan-300 via-blue-300 to-indigo-400",
    comboColor: "bg-blue-900/40 text-cyan-200",
  },
  sentence_flow: {
    gradient: "from-teal-600 via-emerald-600 to-green-700",
    accent: "text-teal-100",
    progressBar: "from-emerald-300 via-teal-300 to-green-400",
    comboColor: "bg-emerald-900/40 text-emerald-200",
  },
  fill_blank: {
    gradient: "from-emerald-600 via-green-600 to-lime-700",
    accent: "text-emerald-100",
    progressBar: "from-lime-300 via-green-300 to-emerald-400",
    comboColor: "bg-green-900/40 text-lime-200",
  },
  key_rain: {
    gradient: "from-slate-800 via-indigo-900 to-violet-900",
    accent: "text-indigo-200",
    progressBar: "from-amber-400 to-emerald-400",
    comboColor: "bg-indigo-900/40 text-indigo-200",
  },
  word_chain: {
    gradient: "from-purple-600 via-violet-600 to-fuchsia-700",
    accent: "text-purple-100",
    progressBar: "from-purple-300 via-violet-300 to-fuchsia-400",
    comboColor: "bg-purple-900/40 text-purple-200",
  },
  speed_duel: {
    gradient: "from-rose-700 via-red-800 to-slate-900",
    accent: "text-rose-100",
    progressBar: "from-rose-300 via-red-400 to-orange-400",
    comboColor: "bg-red-900/40 text-rose-200",
  },
  weak_focus: {
    gradient: "from-indigo-700 via-violet-700 to-purple-800",
    accent: "text-violet-100",
    progressBar: "from-violet-300 via-indigo-300 to-purple-400",
    comboColor: "bg-violet-900/40 text-violet-200",
  },
};

const SPARK_COLORS = [
  "text-yellow-200",
  "text-pink-200",
  "text-sky-200",
  "text-lime-200",
  "text-orange-200",
  "text-fuchsia-200",
];
const POP_EMOJIS = ["⭐", "✨", "💫", "🌟", "🎉"];

/** 纯函数伪随机：用 Math.sin 哈希出 [0,1)，渲染期间调用安全且结果稳定。 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function AiCustomShatter({ char }: { char: string }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 26 + (i % 3) * 12;
        return {
          id: i,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          rot: i * 47 + (i % 2 === 0 ? 16 : -16),
          color: SPARK_COLORS[i % SPARK_COLORS.length],
        };
      }),
    [],
  );
  const popEmoji =
    POP_EMOJIS[(char.codePointAt(0) ?? 0) % POP_EMOJIS.length] ?? POP_EMOJIS[0];

  return (
    <span className="ai-custom-shatter relative inline-flex h-[1.15em] min-w-[0.75em] items-center justify-center">
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className={cn("ai-custom-spark absolute left-1/2 top-1/2 font-black", spark.color)}
          style={
            {
              "--tx": `${spark.tx}px`,
              "--ty": `${spark.ty}px`,
              "--rot": `${spark.rot}deg`,
              animationDelay: `${spark.id * 10}ms`,
            } as CSSProperties
          }
        >
          {char}
        </span>
      ))}
      <span className="ai-custom-spark-flash absolute text-lg leading-none">{popEmoji}</span>
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
  gameType: AiMiniGameType;
};

function AiCustomChar({ char, revealChar, index, typedLength, shatteringIndices, errorShake, gameType }: CharProps) {
  const isShattering = shatteringIndices.includes(index);
  const isDone = index < typedLength && !isShattering;
  const isActive = index === typedLength;
  const shownChar = isDone && revealChar !== undefined ? revealChar : char;
  const isBlankGame = gameType === "fill_blank";

  if (char === " ") {
    return (
      <span
        aria-label="空格"
        className={cn(
          "mx-0.5 inline-block align-middle rounded-md border-2 border-dashed",
          "h-[0.72em] min-w-[1.1em] -translate-y-[0.06em] transition-all duration-150 ease-out",
          isDone && "border-emerald-200/90 bg-emerald-400/25 border-solid",
          isActive &&
            "border-yellow-200/90 bg-yellow-100/20 border-solid shadow-[0_0_0_2px_rgb(250_204_21/0.35)]",
          isActive && errorShake && "ai-custom-char-shake",
          !isDone && !isActive && "border-white/40 bg-white/10 opacity-70",
        )}
      />
    );
  }

  if (isShattering) {
    return <AiCustomShatter char={displayTargetChar(shownChar)} />;
  }

  if (isBlankGame && !isDone && !isActive && char === "_") {
    return (
      <span className="mx-0.5 inline-flex h-[1em] w-[0.8em] items-end justify-center border-b-2 border-dashed border-white/60 text-white/30">
        _
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-block origin-center transition-[transform,color,opacity,filter] duration-150 ease-out will-change-transform",
        isDone && "ai-custom-char-done scale-95 text-emerald-200",
        isActive &&
          "ai-custom-char-bounce scale-110 text-yellow-100 drop-shadow-[0_0_14px_rgb(250_204_21/0.6)]",
        isActive && errorShake && "ai-custom-char-shake text-rose-200",
        !isDone && !isActive && "text-white/80",
      )}
    >
      {displayTargetChar(shownChar)}
    </span>
  );
}

function GameDecoration({ gameType }: { gameType: AiMiniGameType }) {
  switch (gameType) {
    case "word_burst":
      return (
        <>
          <div className="pointer-events-none absolute -left-6 top-6 h-24 w-24 rounded-full bg-yellow-500/15 blur-2xl" />
          <div className="pointer-events-none absolute -right-4 bottom-4 h-20 w-20 rounded-full bg-red-400/20 blur-2xl" />
        </>
      );
    case "key_sprint":
      return (
        <>
          <div className="pointer-events-none absolute -right-8 top-4 h-28 w-28 rotate-12 rounded-full bg-cyan-400/15 blur-2xl" />
          <div className="pointer-events-none absolute left-1/4 top-0 h-1 w-16 rounded-full bg-cyan-300/40 blur-sm" />
        </>
      );
    case "sentence_flow":
      return (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-teal-400/10 to-transparent" />
      );
    case "fill_blank":
      return (
        <>
          <div className="pointer-events-none absolute right-4 top-4 text-3xl opacity-10">🧩</div>
          <div className="pointer-events-none absolute -left-4 bottom-8 h-16 w-16 rounded-full bg-lime-400/15 blur-2xl" />
        </>
      );
    case "word_chain":
      return (
        <>
          <div className="pointer-events-none absolute left-4 top-6 text-2xl opacity-10">🔗</div>
          <div className="pointer-events-none absolute -right-6 bottom-4 h-24 w-24 rounded-full bg-fuchsia-400/15 blur-2xl" />
        </>
      );
    case "speed_duel":
      return (
        <>
          <div className="pointer-events-none absolute -left-4 -top-4 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-8 top-4 text-3xl opacity-10">🏁</div>
        </>
      );
    case "weak_focus":
      return (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/15" />
        </>
      );
    default:
      return null;
  }
}

const CELEBRATE_MESSAGES = [
  { emoji: "🎉", text: "漂亮！" },
  { emoji: "🌟", text: "太棒啦！" },
  { emoji: "💪", text: "好厉害！" },
  { emoji: "🚀", text: "冲呀！" },
  { emoji: "👏", text: "完美！" },
  { emoji: "🦄", text: "超神啦！" },
];
const CONFETTI_COLORS = [
  "#fde047",
  "#f472b6",
  "#38bdf8",
  "#a3e635",
  "#fb923c",
  "#c084fc",
  "#34d399",
];

function CelebrationBurst({ combo }: { combo: number }) {
  // 连击越高，鼓励语越夸张；用 combo 作为种子带来变化感。
  const message = useMemo(() => {
    if (combo >= 12) return CELEBRATE_MESSAGES[5]!;
    if (combo >= 6) return CELEBRATE_MESSAGES[2 + Math.floor(pseudoRandom(combo) * 3)]!;
    return CELEBRATE_MESSAGES[Math.floor(pseudoRandom(combo + 1) * 3)]!;
  }, [combo]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const base = i + combo * 7;
        return {
          id: i,
          left: pseudoRandom(base) * 100,
          tx: (pseudoRandom(base + 1) - 0.5) * 120,
          delay: pseudoRandom(base + 2) * 120,
          duration: 600 + pseudoRandom(base + 3) * 400,
          rot: pseudoRandom(base + 4) * 360,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          round: i % 2 === 0,
        };
      }),
    [combo],
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl bg-black/20 backdrop-blur-[2px]">
      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="ai-custom-confetti absolute top-0 block h-2.5 w-2.5"
          style={
            {
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              borderRadius: piece.round ? "9999px" : "2px",
              "--tx": `${piece.tx}px`,
              "--rot": `${piece.rot}deg`,
              animationDelay: `${piece.delay}ms`,
              animationDuration: `${piece.duration}ms`,
            } as CSSProperties
          }
        />
      ))}
      <div className="ai-custom-celebrate-pop flex items-center gap-2 rounded-full bg-white/25 px-5 py-2 shadow-lg ring-2 ring-white/40">
        <span className="ai-custom-celebrate-emoji text-2xl">{message.emoji}</span>
        <span className="text-base font-black drop-shadow">{message.text}</span>
      </div>
    </div>
  );
}

function ComboDisplay({ combo, theme }: { combo: number; theme: string }) {
  const label =
    combo >= 15
      ? "🌈🔥 无敌连击"
      : combo >= 10
        ? "🔥🔥 超级连击"
        : combo >= 5
          ? "🔥 连击"
          : combo >= 3
            ? "✨ 连击"
            : "连击";
  return (
    <span
      // key 让每次连击数变化都重新播放一次弹跳动画
      key={combo}
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums transition-all",
        combo > 0 && "ai-custom-combo",
        combo >= 10 ? "ai-custom-combo-rainbow text-white" : theme,
        combo >= 5 && "scale-110",
      )}
    >
      {label} {combo}
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
  const theme = GAME_THEMES[gameType];
  const title = gameTitle ?? meta.title;
  const emoji = gameEmoji ?? meta.emoji;
  const maskedMode = Boolean(displayPrompt);
  const visibleText = displayPrompt ?? targetText;
  const chars = visibleText.split("");
  const progress = Math.min(100, (typedLength / Math.max(targetText.length, 1)) * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 text-white shadow-xl md:p-7",
        `bg-gradient-to-br ${theme.gradient}`,
        errorShake && "ai-custom-stage-shake",
      )}
    >
      <GameDecoration gameType={gameType} />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="ai-custom-mascot text-lg">{emoji}</span>
            <span className="text-sm font-bold">{title}</span>
            <span className={cn("text-xs", theme.accent)}>
              · 第 {itemRound}/{totalRounds} 轮
            </span>
          </div>
          <ComboDisplay combo={combo} theme={theme.comboColor} />
        </div>

        {/* Subtitle */}
        <p className="text-xs opacity-80">{levelTitle}</p>
        <p className={cn("mt-1 text-sm font-medium", theme.accent)}>{meta.description}</p>
        {hint ? <p className="mt-1.5 text-sm text-amber-200/90">💡 {hint}</p> : null}

        {/* Progress bar */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-200 bg-gradient-to-r",
              theme.progressBar,
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content area */}
        <div className="relative mt-5 min-h-[4.5rem] rounded-2xl bg-black/20 px-4 py-4 backdrop-blur-sm">
          <div className="flex min-h-[3rem] flex-wrap items-center justify-center gap-x-0.5 gap-y-1 text-3xl font-black tracking-wide md:text-4xl">
            {chars.map((char, index) => (
              <AiCustomChar
                key={`${itemRound}-${index}-${char}`}
                char={char}
                revealChar={maskedMode ? targetText[index] : undefined}
                index={index}
                typedLength={typedLength}
                shatteringIndices={shatteringIndices}
                errorShake={errorShake && index === typedLength}
                gameType={gameType}
              />
            ))}
          </div>

          {celebrating ? <CelebrationBurst combo={combo} /> : null}
        </div>
      </div>
    </div>
  );
}
