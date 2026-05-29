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
    cardBg: "bg-gradient-to-br from-mint-50 via-white to-mint-50/40",
    iconBg: "bg-mint-100",
    borderColor: "border-mint-100 hover:border-mint-300 hover:shadow-mint-100/50",
    badgeBg: "bg-mint-100",
    badgeText: "text-mint-700",
    progressBg: "bg-mint-50",
    progressText: "text-mint-700",
    badge: "零基础推荐",
  },
  ASSESSMENT: {
    emoji: "📊",
    cardBg: "bg-gradient-to-br from-sun-50 via-white to-coral-50/40",
    iconBg: "bg-sun-100",
    borderColor: "border-sun-200 hover:border-sun-300 hover:shadow-sun-100/50",
    badgeBg: "bg-sun-100",
    badgeText: "text-sun-700",
    progressBg: "bg-sun-50",
    progressText: "text-sun-700",
    badge: "首次推荐",
  },
  ADVENTURE: {
    emoji: "🎮",
    cardBg: "bg-gradient-to-br from-aqua-50 via-white to-aqua-50/40",
    iconBg: "bg-aqua-100",
    borderColor: "border-aqua-100 hover:border-aqua-300 hover:shadow-aqua-100/50",
    badgeBg: "bg-aqua-100",
    badgeText: "text-aqua-700",
    progressBg: "bg-aqua-50",
    progressText: "text-aqua-700",
  },
  CHAIN: {
    emoji: "🔗",
    cardBg: "bg-gradient-to-br from-bubble-50 via-white to-bubble-50/40",
    iconBg: "bg-bubble-100",
    borderColor: "border-bubble-100 hover:border-bubble-300 hover:shadow-bubble-100/50",
    badgeBg: "bg-bubble-100",
    badgeText: "text-bubble-700",
    progressBg: "bg-bubble-50",
    progressText: "text-bubble-700",
  },
  AI_CUSTOM: {
    emoji: "🤖",
    cardBg: "bg-gradient-to-br from-grape-50 via-white to-grape-50/40",
    iconBg: "bg-grape-100",
    borderColor: "border-grape-100 hover:border-grape-300 hover:shadow-grape-100/50",
    badgeBg: "bg-grape-100",
    badgeText: "text-grape-700",
    progressBg: "bg-grape-50",
    progressText: "text-grape-700",
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
        "candy-card group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 p-6 shadow-[0_16px_36px_-22px_rgb(135_92_255/0.35)]",
        locked ? "border-slate-100 opacity-80" : theme.borderColor,
        theme.cardBg,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
            theme.iconBg,
          )}
        >
          {theme.emoji}
        </div>
        {recommendBadge && !locked ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ring-1 ring-inset ring-white/60",
              theme.badgeBg,
              theme.badgeText,
            )}
          >
            {recommendBadge}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <h2 className="font-display text-lg font-extrabold text-slate-800">{title}</h2>
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
            <Link href="/pricing" className="font-bold text-grape-600 hover:text-grape-800">
              查看定价
            </Link>
          </p>
        ) : limitReached ? (
          <p className="text-sm font-medium text-coral-600">今日练习次数已用完，请明天再来或升级解锁</p>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href={href} className="block">
              <Button variant="child" className="h-11 w-full">
                {startLabel}
              </Button>
            </Link>
            {showResume && resumeHref ? (
              <Link
                href={resumeHref}
                className="block rounded-2xl py-2 text-center text-sm font-bold text-grape-600 transition hover:bg-grape-50 hover:text-grape-800"
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
      <article className="candy-card relative overflow-hidden rounded-3xl border-2 border-grape-100 bg-gradient-to-r from-grape-50 via-white to-bubble-50 p-6 shadow-[0_16px_36px_-22px_rgb(135_92_255/0.4)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-grape-100 text-xl shadow-sm">
              ▶️
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-grape-500">从上次进度继续</p>
              <p className="mt-0.5 font-display text-lg font-extrabold text-slate-800">{label}</p>
            </div>
          </div>
          <Button variant="child" className="h-11 min-w-[8rem]">
            继续练习
          </Button>
        </div>
      </article>
    </Link>
  );
}
