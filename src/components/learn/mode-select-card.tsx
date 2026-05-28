import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GameMode } from "@/lib/typing-engine/level-content";

type ModeTheme = {
  emoji: string;
  cardBg: string;
  iconBg: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  progressBg: string;
  progressText: string;
  badge?: string;
};

const MODE_THEMES: Record<GameMode, ModeTheme> = {
  FOUNDATION: {
    emoji: "⌨️",
    cardBg: "bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40",
    iconBg: "bg-emerald-100/80",
    borderColor: "border-emerald-100 hover:border-emerald-200 hover:shadow-emerald-100/40",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    progressBg: "bg-emerald-50",
    progressText: "text-emerald-700",
    badge: "零基础推荐",
  },
  ASSESSMENT: {
    emoji: "📊",
    cardBg: "bg-gradient-to-br from-amber-50/80 via-white to-orange-50/30",
    iconBg: "bg-amber-100/80",
    borderColor: "border-amber-100 hover:border-amber-200 hover:shadow-amber-100/40",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    progressBg: "bg-amber-50",
    progressText: "text-amber-700",
    badge: "首次推荐",
  },
  ADVENTURE: {
    emoji: "🎮",
    cardBg: "bg-gradient-to-br from-sky-50/80 via-white to-blue-50/30",
    iconBg: "bg-sky-100/80",
    borderColor: "border-sky-100 hover:border-sky-200 hover:shadow-sky-100/40",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
    progressBg: "bg-sky-50",
    progressText: "text-sky-700",
  },
  CHAIN: {
    emoji: "🔗",
    cardBg: "bg-gradient-to-br from-pink-50/80 via-white to-rose-50/30",
    iconBg: "bg-pink-100/80",
    borderColor: "border-pink-100 hover:border-pink-200 hover:shadow-pink-100/40",
    badgeBg: "bg-pink-100",
    badgeText: "text-pink-700",
    progressBg: "bg-pink-50",
    progressText: "text-pink-700",
  },
  AI_CUSTOM: {
    emoji: "🤖",
    cardBg: "bg-gradient-to-br from-violet-50/80 via-white to-purple-50/30",
    iconBg: "bg-violet-100/80",
    borderColor: "border-violet-100 hover:border-violet-200 hover:shadow-violet-100/40",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
    progressBg: "bg-violet-50",
    progressText: "text-violet-700",
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
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        locked ? "opacity-80 hover:-translate-y-0 hover:shadow-sm" : theme.borderColor,
        theme.cardBg,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            theme.iconBg,
          )}
        >
          {theme.emoji}
        </div>
        {recommendBadge && !locked ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold",
              theme.badgeBg,
              theme.badgeText,
            )}
          >
            {recommendBadge}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>

      {progressLabel ? (
        <div className={cn("mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", theme.progressBg, theme.progressText)}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
          {progressLabel}
        </div>
      ) : null}

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
                className="h-11 w-full rounded-xl transition-all group-hover:shadow-md group-hover:brightness-105"
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
      <article className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xl">
              ▶️
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">从上次进度继续</p>
              <p className="mt-0.5 text-lg font-bold text-slate-800">{label}</p>
            </div>
          </div>
          <Button variant="child" className="h-11 min-w-[8rem] rounded-xl transition group-hover:brightness-105">
            继续练习
          </Button>
        </div>
      </article>
    </Link>
  );
}
