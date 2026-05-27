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
      ? "免费版 · 每日 3 关 · 设置页可兑换邀请码"
      : subscription.hasAi
        ? `已开通 ${subscription.label} · 无限官方关卡 + AI 定制关 + ${PLANS.ai.bundleBenefit}`
        : `已开通 ${subscription.label} · 无限练习官方关卡`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-8 text-white shadow-xl shadow-indigo-200/50">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">Family Hub</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">{t("dashboard.title")}</h1>
            <p className="mt-3 max-w-xl text-indigo-100">
              {statusText}
            </p>
          </div>
          <Link href="/settings">
            <Button variant="secondary" className="border-white/30 bg-white/15 text-white hover:bg-white/25">
              {t("nav.settings")}
            </Button>
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            👨‍👩‍👧 孩子档案 {children.length}/3
          </span>
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            {children.filter((c) => c.assessmentDone).length} 人已完成测评
          </span>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-800">我的宝贝</h2>
            <p className="mt-1 text-sm text-slate-500">每个孩子都有专属可爱头像，点击开始学习吧</p>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-6xl">👋</p>
              <h3 className="mt-4 text-xl font-bold text-slate-800">欢迎来到家长中心</h3>
              <p className="mt-2 text-slate-500">先添加一个孩子档案，系统会自动分配可爱头像</p>
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
