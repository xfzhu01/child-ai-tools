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
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm",
        "transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60",
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-violet-100/70 blur-2xl" />

      <div className="relative flex flex-1 flex-col items-center text-center">
        <ChildAvatar child={child} size="xl" />

        <h3 className="mt-4 text-xl font-black text-slate-800">{child.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{child.age} 岁 · 小小打字家</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Lv.{child.currentLevel}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            XP {child.xp}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            成就 {child.achievements.length}
          </span>
        </div>

        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
            child.assessmentDone
              ? "bg-emerald-50 text-emerald-700"
              : "bg-orange-50 text-orange-700",
          )}
        >
          {child.assessmentDone ? "✓ 已完成首次测评" : "◎ 待完成首次测评"}
        </p>

        {progressSummary ? (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-indigo-700">{progressSummary}</p>
        ) : (
          <p className="mt-3 text-xs text-slate-400">还没有练习记录</p>
        )}

        <div className="mt-auto flex w-full gap-2 pt-5">
          <Link href={`/dashboard/${child.id}`} className="min-w-0 flex-1">
            <Button
              variant="secondary"
              className="h-11 w-full border-2 border-indigo-200 px-3 text-sm font-semibold"
            >
              查看报告
            </Button>
          </Link>
          <Link href={`/learn/${child.id}`} className="min-w-0 flex-1">
            <Button
              variant="child"
              className="h-11 w-full border-2 border-transparent px-3 text-sm font-bold"
            >
              {t("nav.learn")}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
