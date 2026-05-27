import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameMode } from "@/lib/typing-engine/level-content";

type ModeTheme = {
  emoji: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentSoft: string;
  progressText: string;
  badge?: string;
};

const MODE_THEMES: Record<GameMode, ModeTheme> = {
  FOUNDATION: {
    emoji: "⌨️",
    accent: "from-emerald-500 to-teal-500",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200/80 hover:border-emerald-300",
    accentSoft: "text-emerald-700 bg-emerald-50 ring-emerald-100",
    progressText: "text-emerald-800",
    badge: "零基础推荐",
  },
  ASSESSMENT: {
    emoji: "📊",
    accent: "from-amber-500 to-orange-500",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200/80 hover:border-amber-300",
    accentSoft: "text-amber-800 bg-amber-50 ring-amber-100",
    progressText: "text-amber-900",
    badge: "首次推荐",
  },
  ADVENTURE: {
    emoji: "🎮",
    accent: "from-sky-500 to-blue-500",
    accentBg: "bg-sky-50",
    accentBorder: "border-slate-200 hover:border-sky-300",
    accentSoft: "text-sky-800 bg-sky-50 ring-sky-100",
    progressText: "text-sky-900",
  },
  CHAIN: {
    emoji: "🔗",
    accent: "from-rose-500 to-pink-500",
    accentBg: "bg-rose-50",
    accentBorder: "border-slate-200 hover:border-rose-300",
    accentSoft: "text-rose-800 bg-rose-50 ring-rose-100",
    progressText: "text-rose-900",
  },
  AI_CUSTOM: {
    emoji: "🤖",
    accent: "from-violet-500 to-fuchsia-500",
    accentBg: "bg-violet-50",
    accentBorder: "border-slate-200 hover:border-violet-300",
    accentSoft: "text-violet-800 bg-violet-50 ring-violet-100",
    progressText: "text-violet-900",
  },
};

type Props = {
  mode: GameMode;
  title: string;
  description: string;
  progressLabel: string | null;
  href: string;
  resumeHref?: string;
  showResume?: boolean;
  locked?: boolean;
  limitReached?: boolean;
  showRecommendFoundation?: boolean;
  showRecommendAssessment?: boolean;
  startLabel: string;
};

export function ModeSelectCard({
  mode,
  title,
  description,
  progressLabel,
  href,
  resumeHref,
  showResume = false,
  locked = false,
  limitReached = false,
  showRecommendFoundation = false,
  showRecommendAssessment = false,
  startLabel,
}: Props) {
  const theme = MODE_THEMES[mode];
  const recommendBadge = showRecommendFoundation
    ? MODE_THEMES.FOUNDATION.badge
    : showRecommendAssessment
      ? MODE_THEMES.ASSESSMENT.badge
      : theme.badge;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-white p-5 shadow-sm transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/80",
        locked ? "opacity-90 hover:-translate-y-0 hover:shadow-sm" : theme.accentBorder,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", theme.accent)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1 ring-inset transition group-hover:scale-105",
              theme.accentSoft,
            )}
          >
            {theme.emoji}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>
        {recommendBadge && !locked ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
              theme.accentSoft,
            )}
          >
            {recommendBadge}
          </span>
        ) : null}
      </div>

      <div className={cn("mt-4 rounded-xl px-3 py-2.5 ring-1 ring-inset", theme.accentSoft)}>
        <p className="text-xs font-medium text-slate-500">当前进度</p>
        <p className={cn("mt-0.5 text-sm font-semibold", progressLabel ? theme.progressText : "text-slate-400")}>
          {progressLabel ?? "未开始"}
        </p>
      </div>

      <div className="mt-auto pt-5">
        {locked ? (
          <p className="text-sm text-slate-500">
            需要 AI 智能版（¥49.9/年）·{" "}
            <Link href="/pricing" className="font-medium text-indigo-600 hover:text-indigo-800">
              查看定价
            </Link>
          </p>
        ) : limitReached ? (
          <p className="text-sm text-amber-700">今日练习次数已用完，请明天再来或升级解锁</p>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href={href} className="block">
              <Button
                variant="child"
                className="h-11 w-full transition group-hover:brightness-105 group-hover:shadow-md"
              >
                {startLabel}
              </Button>
            </Link>
            {showResume && resumeHref ? (
              <Link
                href={resumeHref}
                className="block rounded-xl py-2 text-center text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800"
              >
                继续上次练习
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

type ContinueCardProps = {
  href: string;
  label: string;
};

export function ContinuePracticeCard({ href, label }: ContinueCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="relative overflow-hidden rounded-[1.5rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/70">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">从上次进度继续</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{label}</p>
          </div>
          <Button variant="child" className="h-11 min-w-[8rem] transition group-hover:brightness-105">
            继续练习
          </Button>
        </div>
      </article>
    </Link>
  );
}
