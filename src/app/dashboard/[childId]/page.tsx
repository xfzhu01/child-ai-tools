import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ChildAvatar } from "@/components/dashboard/child-avatar";
import { Card } from "@/components/ui/card";
import { ProgressChart, KeyHeatmap } from "@/components/dashboard/progress-chart";
import { rankWeakKeys, type KeystrokeEvent } from "@/lib/typing-engine/analyzer";
import { hasAiAccess } from "@/lib/billing/entitlements";
import { getAllModeProgress } from "@/lib/typing-engine/mode-progress";
import { formatModeProgress, modeTitle } from "@/lib/typing-engine/progress-display";
import type { GameMode } from "@/lib/typing-engine/level-content";
import { format } from "date-fns";

export default async function ChildDashboardPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const child = await prisma.childProfile.findFirst({
    where: { id: childId, userId: session.user.id },
    include: {
      typingSessions: { orderBy: { createdAt: "asc" }, take: 20 },
      achievements: true,
      aiRecommendations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!child) notFound();

  const aiUnlocked = await hasAiAccess(session.user.id);
  const progressMap = await getAllModeProgress(child.id);
  const officialModes: GameMode[] = ["FOUNDATION", "ASSESSMENT", "ADVENTURE", "CHAIN"];
  const chartData = child.typingSessions.map((s) => ({
    date: format(s.createdAt, "MM/dd"),
    accuracy: Math.round(s.accuracy),
    wpm: Math.round(s.wpm),
  }));

  const ranked = rankWeakKeys(
    child.typingSessions.map((s) => ({ rawEvents: s.rawEvents as KeystrokeEvent[] })),
  ).slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/dashboard" className="text-sm text-indigo-600">
        ← 返回家长中心
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <ChildAvatar child={child} size="lg" />
        <div>
          <h1 className="text-3xl font-black">{child.name} 的进步报告</h1>
          <p className="mt-1 text-sm text-slate-500">
            {child.age} 岁 · Lv.{child.currentLevel} · XP {child.xp}
          </p>
        </div>
      </div>

      <Card className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">各模式练习进度</h2>
          <Link href={`/learn/${childId}`} className="text-sm text-indigo-600">
            继续练习 →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {officialModes.map((mode) => {
            const progress = progressMap[mode]!;
            return (
              <div key={mode} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">{modeTitle(mode)}</p>
                <p className="mt-1 text-sm text-indigo-700">{formatModeProgress(mode, progress)}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">练习趋势</h2>
          <div className="mt-4">
            <ProgressChart data={chartData} />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">弱项键位热力图</h2>
          <div className="mt-4">
            {ranked.length > 0 ? (
              <KeyHeatmap keys={ranked.map((r) => ({ key: r.key, value: r.errorRate }))} />
            ) : (
              <p className="text-sm text-slate-500">完成首次测评后显示</p>
            )}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold">AI 周报 {aiUnlocked ? "" : "(AI 智能版)"}</h2>
          {aiUnlocked && child.aiRecommendations[0] ? (
            <p className="mt-4 leading-7 text-slate-700">{child.aiRecommendations[0].summary}</p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              {aiUnlocked
                ? "完成 AI 定制关后将生成周报"
                : "开通 AI 智能版（¥49.9/年）或在设置页兑换邀请码后可查看 AI 周报"}
            </p>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold">成就墙</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {child.achievements.length === 0 && <span className="text-sm text-slate-500">还没有成就</span>}
            {child.achievements.map((a) => (
              <span key={a.id} className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                🏅 {a.type}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
