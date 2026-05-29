import Link from "next/link";
import { ChildAvatar } from "@/components/dashboard/child-avatar";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ChildCardProps = {
  child: {
    id: string;
    name: string;
    age: number;
    avatarUrl: string | null;
    currentLevel: number;
    xp: number;
    assessmentDone: boolean;
    achievements: { id: string }[];
  };
  progressSummary?: string | null;
};

export function ChildCard({ child, progressSummary }: ChildCardProps) {
  return (
    <article
      className={cn(
        "candy-card group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-white bg-white p-5 shadow-[0_16px_36px_-22px_rgb(135_92_255/0.4)] ring-1 ring-grape-100",
      )}
    >
      <div className="candy-float pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sun-200/70 blur-2xl" />
      <div className="candy-float-slow pointer-events-none absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-grape-200/70 blur-2xl" />

      <div className="relative flex flex-1 flex-col items-center text-center">
        <ChildAvatar child={child} size="xl" />

        <h3 className="mt-4 font-display text-xl font-extrabold text-slate-800">{child.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{child.age} 岁 · 小小打字家</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-grape-100 px-3 py-1 text-xs font-bold text-grape-700 ring-1 ring-inset ring-grape-200">
            Lv.{child.currentLevel}
          </span>
          <span className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold text-sun-700 ring-1 ring-inset ring-sun-200">
            XP {child.xp}
          </span>
          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-mint-700 ring-1 ring-inset ring-mint-200">
            成就 {child.achievements.length}
          </span>
        </div>

        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
            child.assessmentDone
              ? "bg-mint-100 text-mint-700 ring-mint-200"
              : "bg-coral-100 text-coral-700 ring-coral-200",
          )}
        >
          {child.assessmentDone ? "✓ 已完成首次测评" : "◎ 待完成首次测评"}
        </p>

        {progressSummary ? (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-grape-700">{progressSummary}</p>
        ) : (
          <p className="mt-3 text-xs text-slate-400">还没有练习记录</p>
        )}

        <div className="mt-auto flex w-full gap-2 pt-5">
          <Link href={`/dashboard/${child.id}`} className="min-w-0 flex-1">
            <Button variant="secondary" className="h-11 w-full px-3 text-sm">
              查看报告
            </Button>
          </Link>
          <Link href={`/learn/${child.id}`} className="min-w-0 flex-1">
            <Button variant="child" className="h-11 w-full px-3 text-sm">
              {t("nav.learn")}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
