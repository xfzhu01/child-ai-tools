import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { AddChildPanel } from "@/components/dashboard/add-child-panel";
import { ChildCard } from "@/components/dashboard/child-card";
import { Button } from "@/components/ui/button";
import { getSubscriptionStatus } from "@/lib/billing/entitlements";
import { PLANS } from "@/lib/billing/plans";
import { getAllModeProgress } from "@/lib/typing-engine/mode-progress";
import { summarizeChildProgress } from "@/lib/typing-engine/progress-display";
import { t } from "@/lib/i18n";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const children = await prisma.childProfile.findMany({
    where: { userId: session.user.id },
    include: {
      typingSessions: { orderBy: { createdAt: "desc" }, take: 1 },
      achievements: true,
    },
    orderBy: { createdAt: "asc" },
  });
  const progressByChild = await Promise.all(
    children.map(async (child) => ({
      childId: child.id,
      summary: summarizeChildProgress(await getAllModeProgress(child.id)),
    })),
  );
  const progressMap = Object.fromEntries(progressByChild.map((p) => [p.childId, p.summary]));
  const subscription = await getSubscriptionStatus(session.user.id);
  const statusText =
    subscription.tier === "free"
      ? "免费版 · 每日 3 关 · 设置页可开通付费版"
      : subscription.hasAi
        ? `已开通 ${subscription.label} · 无限官方关卡 + AI 定制关 + ${PLANS.ai.bundleBenefit}`
        : `已开通 ${subscription.label} · 无限练习官方关卡`;

  return (
    <div className="relative mx-auto max-w-5xl px-5 py-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-100/50 via-violet-50/30 to-transparent blur-3xl" />
      </div>

      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-7 text-white shadow-xl shadow-indigo-200/40 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">Family Hub</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">{t("dashboard.title")}</h1>
            <p className="mt-3 max-w-xl text-sm text-indigo-100">
              {statusText}
            </p>
          </div>
          <Link href="/settings">
            <Button variant="secondary" className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
              {t("nav.settings")}
            </Button>
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            👨‍👩‍👧 孩子档案 {children.length}/3
          </span>
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            {children.filter((c) => c.assessmentDone).length} 人已完成测评
          </span>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900">我的宝贝</h2>
          <p className="mt-1 text-sm text-slate-500">每个孩子都有专属可爱头像，点击开始学习吧</p>
        </div>

        {children.length === 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 p-8 text-center backdrop-blur-sm">
              <p className="text-5xl">👋</p>
              <h3 className="mt-4 text-xl font-bold text-slate-900">欢迎来到家长中心</h3>
              <p className="mt-2 text-sm text-slate-500">先添加一个孩子档案，系统会自动分配可爱头像</p>
            </div>
            <AddChildPanel disabled={false} />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} progressSummary={progressMap[child.id]} />
            ))}
            {children.length < 3 && <AddChildPanel disabled={false} />}
          </div>
        )}
      </section>
    </div>
  );
}
