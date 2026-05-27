import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { canStartSession, FREE_DAILY_SESSIONS, getSubscriptionStatus, hasAiAccess } from "@/lib/billing/entitlements";
import { DailyLimitNotice } from "@/components/billing/daily-limit-notice";
import { getAllModeProgress } from "@/lib/typing-engine/mode-progress";
import {
  findContinueTarget,
  formatModeProgress,
  hasModeProgress,
} from "@/lib/typing-engine/progress-display";
import type { GameMode } from "@/lib/typing-engine/level-content";
import { t } from "@/lib/i18n";

const modes = [
  {
    id: "FOUNDATION" as const,
    title: t("learn.foundation"),
    desc: "26 个字母按传统指法顺序逐字母刮卡练习，最后 50 词毕业考试 · 完全免费无限练",
    href: (id: string) => `/learn/${id}/levels/FOUNDATION`,
    always: true,
    recommendZero: true,
  },
  {
    id: "ASSESSMENT" as const,
    title: t("learn.assessment"),
    desc: "3 关覆盖全键盘基线测评",
    href: (id: string) => `/learn/${id}/levels/ASSESSMENT`,
    always: true,
  },
  {
    id: "ADVENTURE" as const,
    title: t("learn.adventure"),
    desc: "30 关由易到难，每关 10 个单词",
    href: (id: string) => `/learn/${id}/levels/ADVENTURE`,
    always: true,
  },
  {
    id: "CHAIN" as const,
    title: t("learn.chain"),
    desc: "10 关成语拼音接龙由易到难，每关 5 个成语",
    href: (id: string) => `/learn/${id}/levels/CHAIN`,
    always: true,
  },
  {
    id: "AI_CUSTOM" as const,
    title: t("learn.aiCustom"),
    desc: "100 关随机小游戏，AI 分析弱项后填充练习内容，完成一关自动进入下一关",
    href: (id: string) => `/learn/${id}/play?mode=AI_CUSTOM&resume=1`,
    always: false,
  },
];

export default async function LearnPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const child = await prisma.childProfile.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) notFound();

  const subscription = await getSubscriptionStatus(session.user.id);
  const aiUnlocked = await hasAiAccess(session.user.id);
  const access = await canStartSession(session.user.id, child.id);
  const progressMap = await getAllModeProgress(child.id);
  const continueTarget = findContinueTarget(childId, progressMap);
  const sessionLabel = subscription.hasBasic
    ? `${subscription.label} · 无限练习`
    : `今日剩余 ${access.remaining}/${FREE_DAILY_SESSIONS} 关`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/dashboard" className="text-sm text-indigo-600">
        ← 返回家长中心
      </Link>
      <h1 className="mt-4 text-3xl font-black">{child.name}，选择今日冒险！</h1>
      <p className="mt-2 text-slate-600">
        {child.age} 岁 · {sessionLabel}
      </p>
      <p className="mt-1 text-sm text-emerald-700">练习进度已保存到云端，下次登录可继续</p>

      {continueTarget ? (
        <Link href={continueTarget.href} className="mt-6 block">
          <Card className="border-indigo-200 bg-indigo-50 p-5 transition hover:border-indigo-300">
            <p className="text-sm font-medium text-indigo-600">从上次进度继续</p>
            <p className="mt-1 text-lg font-bold text-indigo-900">{continueTarget.label}</p>
            <Button variant="child" className="mt-4">
              继续练习
            </Button>
          </Card>
        </Link>
      ) : null}

      {!access.allowed ? (
        <div className="mt-6">
          <DailyLimitNotice childId={childId} compact />
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {modes.map((mode) => {
          const locked = mode.id === "AI_CUSTOM" && !aiUnlocked;
          const recommendedFoundation = mode.id === "FOUNDATION";
          const recommended = !child.assessmentDone && mode.id === "ASSESSMENT";
          const modeProgress = progressMap[mode.id as GameMode];
          const progressLabel =
            modeProgress && hasModeProgress(modeProgress)
              ? formatModeProgress(mode.id as GameMode, modeProgress)
              : null;

          return (
            <Card
              key={mode.id}
              className={
                recommendedFoundation
                  ? "border-emerald-300 bg-emerald-50"
                  : recommended
                    ? "border-amber-300 bg-amber-50"
                    : ""
              }
            >
              <h2 className="text-xl font-bold">{mode.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{mode.desc}</p>
              {progressLabel ? (
                <p className="mt-2 text-sm font-medium text-indigo-700">当前进度：{progressLabel}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">当前进度：未开始</p>
              )}
              {recommendedFoundation && (
                <p className="mt-2 text-sm font-medium text-emerald-700">推荐零基础从这里开始</p>
              )}
              {recommended && (
                <p className="mt-2 text-sm font-medium text-amber-700">推荐先做首次测评</p>
              )}
              {locked ? (
                <p className="mt-4 text-sm text-slate-500">
                  需要 AI 智能版（¥49.9/年，含日后成长包）· <Link href="/pricing" className="text-indigo-600">查看定价</Link>
                </p>
              ) : !access.allowed && mode.id !== "AI_CUSTOM" && mode.id !== "FOUNDATION" ? (
                <p className="mt-4 text-sm text-amber-700">今日练习次数已用完，请明天再来或升级解锁</p>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  <Link href={mode.href(childId)} className="block">
                    <Button variant="child" className="w-full">
                      {progressLabel ? "进入关卡" : t("game.start")}
                    </Button>
                  </Link>
                  {modeProgress &&
                  hasModeProgress(modeProgress) &&
                  (mode.id === "FOUNDATION" || mode.id === "AI_CUSTOM" || access.allowed) ? (
                    <Link
                      href={`/learn/${childId}/play?mode=${mode.id}&resume=1`}
                      className="block text-center text-sm text-indigo-600 hover:underline"
                    >
                      继续上次练习
                    </Link>
                  ) : null}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
