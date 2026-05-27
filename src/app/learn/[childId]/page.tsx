import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ContinuePracticeCard, ModeSelectCard } from "@/components/learn/mode-select-card";
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
  },
  {
    id: "ASSESSMENT" as const,
    title: t("learn.assessment"),
    desc: "3 关覆盖全键盘基线测评",
    href: (id: string) => `/learn/${id}/levels/ASSESSMENT`,
  },
  {
    id: "ADVENTURE" as const,
    title: t("learn.adventure"),
    desc: "30 关由易到难，每关 10 个单词",
    href: (id: string) => `/learn/${id}/levels/ADVENTURE`,
  },
  {
    id: "CHAIN" as const,
    title: t("learn.chain"),
    desc: "10 关成语拼音接龙由易到难，每关 5 个成语",
    href: (id: string) => `/learn/${id}/levels/CHAIN`,
  },
  {
    id: "AI_CUSTOM" as const,
    title: t("learn.aiCustom"),
    desc: "100 关随机小游戏，AI 分析弱项后填充练习内容，完成一关自动进入下一关",
    href: (id: string) => `/learn/${id}/play?mode=AI_CUSTOM&resume=1`,
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
        ← 返回家长中心
      </Link>
      <div className="mt-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{child.name}，选择今日冒险！</h1>
        <p className="mt-2 text-slate-600">
          {child.age} 岁 · {sessionLabel}
        </p>
        <p className="mt-1 text-sm text-emerald-700">练习进度已保存到云端，下次登录可继续</p>
      </div>

      {continueTarget ? (
        <div className="mt-6">
          <ContinuePracticeCard href={continueTarget.href} label={continueTarget.label} />
        </div>
      ) : null}

      {!access.allowed ? (
        <div className="mt-6">
          <DailyLimitNotice childId={childId} compact />
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {modes.map((mode) => {
          const locked = mode.id === "AI_CUSTOM" && !aiUnlocked;
          const modeProgress = progressMap[mode.id as GameMode];
          const progressLabel =
            modeProgress && hasModeProgress(modeProgress)
              ? formatModeProgress(mode.id as GameMode, modeProgress)
              : null;
          const canResume =
            Boolean(modeProgress && hasModeProgress(modeProgress)) &&
            (mode.id === "FOUNDATION" || mode.id === "AI_CUSTOM" || access.allowed);

          return (
            <ModeSelectCard
              key={mode.id}
              mode={mode.id}
              title={mode.title}
              description={mode.desc}
              progressLabel={progressLabel}
              href={mode.href(childId)}
              resumeHref={`/learn/${childId}/play?mode=${mode.id}&resume=1`}
              showResume={canResume}
              locked={locked}
              limitReached={!access.allowed && mode.id !== "AI_CUSTOM" && mode.id !== "FOUNDATION"}
              showRecommendFoundation={mode.id === "FOUNDATION"}
              showRecommendAssessment={!child.assessmentDone && mode.id === "ASSESSMENT"}
              startLabel={progressLabel ? "进入关卡" : t("game.start")}
            />
          );
        })}
      </div>
    </div>
  );
}
