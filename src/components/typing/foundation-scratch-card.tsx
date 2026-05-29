import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFoundationLevel } from "@/lib/typing-engine/foundation-levels";

type Props = {
  level: number;
  unlocked: boolean;
  stars: number;
  isCurrent: boolean;
  canStart: boolean;
  childId?: string;
  playHref?: string;
};

export function FoundationScratchCard({
  level,
  unlocked,
  stars,
  isCurrent,
  canStart,
  childId,
  playHref,
}: Props) {
  const meta = getFoundationLevel(level);
  if (!meta) return null;

  const isLetter = meta.kind === "letter";
  const isExam = meta.kind === "exam";
  const letter = meta.letter?.toUpperCase();

  return (
    <div
      className={`candy-card relative overflow-hidden rounded-3xl border-2 p-4 ${
        isCurrent
          ? "border-grape-400 bg-grape-50 shadow-candy"
          : unlocked
            ? "border-mint-200 bg-white"
            : "border-slate-200 bg-slate-50 opacity-60"
      }`}
    >
      {!unlocked ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-slate-300 via-slate-200 to-slate-300"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0.15) 4px, transparent 4px, transparent 10px)",
          }}
        >
          <span className="text-2xl">🔒</span>
        </div>
      ) : null}

      <div className="relative">
        {isLetter && letter ? (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sun-200 to-mint-200 font-display text-4xl font-extrabold text-grape-700 shadow-inner">
            {letter}
          </div>
        ) : isExam ? (
          <div className="mx-auto flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-grape-100 to-bubble-200 text-center shadow-inner">
            <span className="text-2xl">🎓</span>
            <span className="text-[10px] font-bold text-grape-700">考试</span>
          </div>
        ) : null}

        <p className="mt-3 text-center text-xs font-bold text-grape-500">第 {level} 关</p>
        <p className="mt-1 text-center text-sm font-bold leading-snug text-slate-800">{meta.title}</p>
        <p className="mt-2 text-center text-sm text-sun-600">
          {stars > 0 ? "⭐".repeat(Math.min(stars, 5)) : "未挑战"}
        </p>

        {unlocked && canStart ? (
          <Link
            href={playHref ?? `/learn/${childId}/play?mode=FOUNDATION&level=${level}`}
            className="mt-3 block"
          >
            <Button variant="child" className="w-full text-sm">
              {isCurrent ? "继续" : "刮开练习"}
            </Button>
          </Link>
        ) : unlocked && !canStart ? (
          <p className="mt-3 text-center text-xs text-coral-600">今日次数已用完</p>
        ) : (
          <p className="mt-3 text-center text-xs text-slate-400">未解锁</p>
        )}
      </div>
    </div>
  );
}
