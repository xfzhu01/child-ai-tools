import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ChildAvatar } from "@/components/dashboard/child-avatar";
import {
  KeyboardHeatmap,
  ModeProgressPanel,
  ReportMetricGrid,
  ReportTrendChart,
  WeakKeysTable,
} from "@/components/dashboard/child-report-view";
import { AchievementWall } from "@/components/dashboard/achievement-wall";
import { Card } from "@/components/ui/card";
import {
  buildChildReportMetrics,
  keyboardHeatEntries,
  trendLabel,
  trendTone,
} from "@/lib/typing-engine/child-report";
import { hasReportAccess } from "@/lib/billing/entitlements";
import { getAllModeProgress } from "@/lib/typing-engine/mode-progress";
import { format } from "date-fns";

export default async function ChildDashboardPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const child = await prisma.childProfile.findFirst({
    where: { id: childId, userId: session.user.id },
    include: {
      typingSessions: { orderBy: { createdAt: "asc" }, take: 30 },
      achievements: true,
      aiRecommendations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!child) notFound();

  const reportUnlocked = await hasReportAccess(session.user.id);
  const progressMap = await getAllModeProgress(child.id);
  const report = buildChildReportMetrics({
    age: child.age,
    streakDays: child.streakDays,
    sessions: child.typingSessions,
    progressMap,
  });
  const heatEntries = keyboardHeatEntries(report.weakKeys);
  const lastSession = child.typingSessions.at(-1);

  return (
    <div className="relative mx-auto max-w-5xl px-5 py-12">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/4 h-72 w-96 rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <Link href="/dashboard" className="inline-flex text-sm font-medium text-indigo-600 transition hover:text-indigo-800">
        ← 返回家长中心
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <ChildAvatar child={child} size="lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                学习分析报告
              </p>
              <h1 className="mt-1 text-3xl font-black">{child.name}</h1>
              <p className="mt-2 text-sm text-slate-300">
                {child.age} 岁 · {report.ageBand} 岁档 · {report.periodLabel}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur-sm">
            <p className="text-slate-400">最近练习</p>
            <p className="mt-1 font-semibold text-white">
              {lastSession ? format(lastSession.createdAt, "yyyy-MM-dd HH:mm") : "尚未开始"}
            </p>
            <Link
              href={`/learn/${childId}`}
              className="mt-3 inline-flex text-sm font-semibold text-amber-300 transition hover:text-amber-200"
            >
              继续练习 →
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">核心指标</h2>
          <p className="mt-1 text-sm text-slate-500">
            基于打字教学常用指标：准确率、净 WPM、稳定性与键位诊断。趋势对比最近 3 次与之前 3 次练习。
          </p>
        </div>
        <ReportMetricGrid
          metrics={{
            avgAccuracy: report.avgAccuracy,
            medianAccuracy: report.medianAccuracy,
            avgWpm: report.avgWpm,
            wpmTarget: report.wpmTarget,
            wpmVsTargetPct: report.wpmVsTargetPct,
            totalPracticeMin: report.totalPracticeMin,
            sessionCount: report.sessionCount,
            avgComboMax: report.avgComboMax,
            consistencyScore: report.consistencyScore,
            streakDays: report.streakDays,
            ageBand: report.ageBand,
            accuracyTrend: trendLabel(report.accuracyTrend),
            wpmTrend: trendLabel(report.wpmTrend),
            accuracyTrendTone: trendTone(report.accuracyTrend),
            wpmTrendTone: trendTone(report.wpmTrend),
          }}
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="text-lg font-bold text-slate-900">表现趋势</h2>
          <p className="mt-1 text-sm text-slate-500">双轴展示准确率（左）与净速度 WPM（右），避免量纲混淆。</p>
          <div className="mt-4">
            <ReportTrendChart data={report.chartPoints} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">键位热力图</h2>
          <p className="mt-1 text-sm text-slate-500">按 QWERTY 布局显示错误率，红色越深表示该键位越需加强。</p>
          <div className="mt-4">
            {report.weakKeys.length > 0 ? (
              <KeyboardHeatmap entries={heatEntries} />
            ) : (
              <p className="text-sm text-slate-500">完成首次测评后将显示键位分布。</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-slate-900">键位诊断明细</h2>
          <p className="mt-1 text-sm text-slate-500">
            仅统计样本量 ≥ 3 的键位。延迟 &gt; 800ms 会被标记为慢键候选。
          </p>
          <div className="mt-4">
            <WeakKeysTable rows={report.weakKeys} />
          </div>
          {report.adjacentPairs.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">相邻键误触分析</p>
              <p className="mt-1">
                误触占全部错误约 {Math.round(report.adjacentErrorRate * 100)}%，常见组合：
                {report.adjacentPairs.join("、")}
              </p>
              <p className="mt-2 text-xs text-amber-800/80">
                相邻键误触通常与指法位置有关，建议放慢节奏并固定手位。
              </p>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-900">模式进度</h2>
          <p className="mt-1 text-sm text-slate-500">按已完成关卡占比估算各模式完成度。</p>
          <div className="mt-4">
            <ModeProgressPanel rows={report.modeProgress} />
          </div>
        </Card>
      </div>

      <Card className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI 学习报告{reportUnlocked ? "" : "（付费版）"}</h2>
            <p className="mt-1 text-sm text-slate-500">AI 分析练习数据，生成个性化学习建议与改进方向。</p>
          </div>
        </div>
        {reportUnlocked && child.aiRecommendations[0] ? (
          <div className="mt-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">最新分析</p>
            <p className="mt-2 leading-7 text-slate-700">{child.aiRecommendations[0].summary}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            {reportUnlocked
              ? "完成几次练习后将自动生成 AI 学习报告。"
              : "开通官方关卡版（¥19.9/年）或以上即可查看 AI 学习报告，设置页可兑换或联系邮箱付费开通。"}
          </p>
        )}
      </Card>

      <Card className="mt-8">
        <AchievementWall
          achievements={child.achievements.map((achievement) => ({
            type: achievement.type,
            unlockedAt: achievement.unlockedAt,
          }))}
        />
      </Card>
    </div>
  );
}
