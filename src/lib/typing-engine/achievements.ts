export type AchievementDefinition = {
  type: string;
  title: string;
  hint: string;
  tier: "bronze" | "silver" | "gold" | "special";
  stars?: number;
  icon: "star" | "trophy" | "spark" | "rainbow";
};

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    type: "three_star",
    title: "三星达人",
    hint: "在任意关卡获得 3 星评价",
    tier: "gold",
    stars: 3,
    icon: "star",
  },
  {
    type: "five_star",
    title: "完美五星",
    hint: "在任意关卡获得 5 星评价",
    tier: "gold",
    stars: 5,
    icon: "star",
  },
  {
    type: "streak_7",
    title: "连续七天",
    hint: "连续 7 天完成练习",
    tier: "silver",
    icon: "spark",
  },
  {
    type: "foundation_graduate",
    title: "指法毕业",
    hint: "通过零基础指法毕业考试",
    tier: "special",
    icon: "trophy",
  },
  {
    type: "ai_explorer",
    title: "AI 探险家",
    hint: "完成 10 关 AI 定制关",
    tier: "special",
    icon: "rainbow",
  },
  {
    type: "combo_master",
    title: "连击高手",
    hint: "单次练习最高连击达到 30",
    tier: "bronze",
    icon: "spark",
  },
];

const catalogMap = new Map(ACHIEVEMENT_CATALOG.map((item) => [item.type, item]));

export function getAchievementDefinition(type: string): AchievementDefinition {
  return (
    catalogMap.get(type) ?? {
      type,
      title: "成长徽章",
      hint: "继续练习解锁更多成就",
      tier: "bronze",
      icon: "star",
    }
  );
}

export type UnlockedAchievement = {
  type: string;
  unlockedAt: Date;
};

export function buildAchievementWallItems(unlocked: UnlockedAchievement[]) {
  const unlockedMap = new Map(unlocked.map((item) => [item.type, item.unlockedAt]));

  return ACHIEVEMENT_CATALOG.map((definition) => ({
    definition,
    unlockedAt: unlockedMap.get(definition.type) ?? null,
  }));
}

export const TIER_STYLES = {
  bronze: {
    ring: "ring-amber-100",
    medal: "from-amber-200 via-orange-300 to-amber-500",
    glow: "shadow-amber-200/60",
    ribbon: "from-amber-600 to-orange-700",
  },
  silver: {
    ring: "ring-slate-200",
    medal: "from-slate-100 via-slate-300 to-slate-500",
    glow: "shadow-slate-300/60",
    ribbon: "from-slate-500 to-slate-700",
  },
  gold: {
    ring: "ring-yellow-100",
    medal: "from-yellow-200 via-amber-300 to-orange-500",
    glow: "shadow-amber-300/70",
    ribbon: "from-amber-600 to-orange-700",
  },
  special: {
    ring: "ring-violet-100",
    medal: "from-violet-200 via-fuchsia-300 to-indigo-500",
    glow: "shadow-violet-300/60",
    ribbon: "from-violet-600 to-indigo-700",
  },
} as const;
