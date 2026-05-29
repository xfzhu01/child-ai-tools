"use client";

import { cn } from "@/lib/utils";
import {
  buildAchievementWallItems,
  TIER_STYLES,
  type UnlockedAchievement,
} from "@/lib/typing-engine/achievements";

function MedalIcon({
  icon,
  stars,
  locked,
}: {
  icon: "star" | "trophy" | "spark" | "rainbow";
  stars?: number;
  locked: boolean;
}) {
  if (icon === "trophy") {
    return <span className={cn("text-4xl leading-none", locked && "grayscale")}>🏆</span>;
  }
  if (icon === "rainbow") {
    return <span className={cn("text-4xl leading-none", locked && "grayscale")}>🌈</span>;
  }
  if (icon === "spark") {
    return <span className={cn("text-4xl leading-none", locked && "grayscale")}>✨</span>;
  }

  const count = stars ?? 1;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.min(count, 5) }, (_, index) => (
        <span
          key={index}
          className={cn("text-xl leading-none", locked ? "grayscale opacity-70" : "drop-shadow-sm")}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

function AchievementMedal({
  title,
  hint,
  tier,
  icon,
  stars,
  unlocked,
}: {
  title: string;
  hint: string;
  tier: keyof typeof TIER_STYLES;
  icon: "star" | "trophy" | "spark" | "rainbow";
  stars?: number;
  unlocked: boolean;
}) {
  const styles = TIER_STYLES[tier];

  return (
    <div
      className={cn(
        "candy-card group flex flex-col items-center rounded-[1.5rem] border-2 p-4 text-center",
        unlocked
          ? "border-sun-200 bg-gradient-to-b from-white to-sun-50 shadow-sm"
          : "border-dashed border-slate-200 bg-slate-50/80",
      )}
      title={hint}
    >
      <div className="relative">
        <div
          className={cn(
            "relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br shadow-lg ring-4",
            styles.medal,
            styles.ring,
            styles.glow,
            !unlocked && "opacity-45 grayscale",
            unlocked && "achievement-medal-shine",
          )}
        >
          <MedalIcon icon={icon} stars={stars} locked={!unlocked} />
        </div>
        <div
          className={cn(
            "absolute -bottom-2 left-1/2 h-5 w-14 -translate-x-1/2 rounded-b-lg bg-gradient-to-b shadow-sm",
            styles.ribbon,
            !unlocked && "opacity-40 grayscale",
          )}
        />
        {!unlocked ? (
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-700/90 text-xs text-white shadow">
            🔒
          </span>
        ) : null}
      </div>

      <p className={cn("mt-5 text-sm font-bold", unlocked ? "text-slate-800" : "text-slate-400")}>
        {title}
      </p>
    </div>
  );
}

export function AchievementWall({ achievements }: { achievements: UnlockedAchievement[] }) {
  const items = buildAchievementWallItems(achievements);
  const unlockedCount = items.filter((item) => item.unlockedAt).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-extrabold text-slate-900">成就墙</h2>
          <p className="mt-1 text-sm text-slate-500">
            已点亮 {unlockedCount} / {items.length} 枚奖章
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(({ definition, unlockedAt }) => (
          <AchievementMedal
            key={definition.type}
            title={definition.title}
            hint={definition.hint}
            tier={definition.tier}
            icon={definition.icon}
            stars={definition.stars}
            unlocked={Boolean(unlockedAt)}
          />
        ))}
      </div>

      {unlockedCount === 0 ? (
        <p className="mt-4 text-sm text-slate-500">完成关卡并获得高星评价，即可点亮第一枚奖章。</p>
      ) : null}
    </div>
  );
}
