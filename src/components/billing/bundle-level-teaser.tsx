export type BundleTeaser = {
  emoji: string;
  title: string;
  hint: string;
};

export const MODE_BUNDLE_TEASERS: Record<
  "ASSESSMENT" | "ADVENTURE" | "CHAIN" | "FOUNDATION",
  BundleTeaser
> = {
  ASSESSMENT: {
    emoji: "🎯",
    title: "成长包·键盘大师",
    hint: "进阶键位挑战，即将开放",
  },
  ADVENTURE: {
    emoji: "🌍",
    title: "成长包·词汇星球",
    hint: "主题单词冒险，筹备中",
  },
  CHAIN: {
    emoji: "📜",
    title: "成长包·成语奇旅",
    hint: "全新接龙路线，敬请期待",
  },
  FOUNDATION: {
    emoji: "⌨️",
    title: "成长包·极速指法",
    hint: "高阶键位特训，筹备中",
  },
};

type BundleLevelCardProps = {
  teaser: BundleTeaser;
};

/** Last slot in official level grids — matches regular level card layout. */
export function BundleLevelCard({ teaser }: BundleLevelCardProps) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-grape-300 bg-gradient-to-br from-grape-50 via-bubble-50 to-sun-50 p-4 shadow-sm">
      <p className="text-xs font-bold text-grape-600">成长包</p>
      <p className="mt-1 text-sm font-bold leading-snug text-grape-900">
        {teaser.emoji} {teaser.title}
      </p>
      <p className="mt-2 text-sm text-sun-600">敬请期待</p>
      <p className="mt-3 text-center text-xs text-grape-500/80">{teaser.hint}</p>
      <p className="mt-3 text-center text-xs text-slate-400">未开放</p>
    </div>
  );
}
