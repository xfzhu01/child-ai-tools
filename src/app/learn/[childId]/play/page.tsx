import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { PlayClient } from "@/components/typing/play-client";
import { DailyLimitBlocked } from "@/components/billing/daily-limit-notice";
import { canStartSession, hasAiAccess } from "@/lib/billing/entitlements";
import { getModeProgress } from "@/lib/typing-engine/mode-progress";
import type { GameMode } from "@/lib/typing-engine/level-content";

const OFFICIAL_MODES = ["ASSESSMENT", "ADVENTURE", "CHAIN", "FOUNDATION"] as const;

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ childId: string }>;
  searchParams: Promise<{ mode?: string; level?: string; resume?: string }>;
}) {
  const { childId } = await params;
  const { mode: modeParam, level: levelParam, resume: resumeParam } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const child = await prisma.childProfile.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) notFound();

  const mode = (modeParam ?? "ADVENTURE").toUpperCase() as GameMode;

  if (mode === "AI_CUSTOM" && !(await hasAiAccess(session.user.id))) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mb-3 text-4xl"><span className="candy-wiggle inline-block">🤖</span></div>
        <h1 className="font-display text-2xl font-extrabold">AI 定制关需要 AI 智能版</h1>
        <p className="mt-4 text-slate-600">¥49.9/年解锁 AI 定制关、家长周报与日后成长包。可在设置页兑换邀请码，或发邮件至 397543632@qq.com 付费开通。</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href={`/learn/${childId}`} className="font-bold text-grape-600 hover:text-grape-800">
            返回模式选择
          </Link>
          <Link href="/pricing" className="font-bold text-grape-600 hover:text-grape-800">
            查看定价
          </Link>
        </div>
      </div>
    );
  }

  const access = await canStartSession(session.user.id, child.id, mode);
  let canPlay = access.allowed;

  if (
    !canPlay &&
    mode !== "FOUNDATION" &&
    OFFICIAL_MODES.includes(mode as (typeof OFFICIAL_MODES)[number])
  ) {
    const progress = await getModeProgress(childId, mode as (typeof OFFICIAL_MODES)[number]);
    const resume = resumeParam === "1";
    const level = levelParam ? Number(levelParam) || progress.currentLevel : progress.currentLevel;
    const continuingSameLevel =
      progress.itemIndex > 0 && progress.currentLevel === level;
    if (resume || continuingSameLevel) {
      canPlay = true;
    }
  }

  if (!canPlay) {
    return <DailyLimitBlocked childId={childId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-grape-100 via-bubble-50 to-sun-50 pb-0">
      <PlayClient childId={child.id} age={child.age} aiUnlocked={await hasAiAccess(session.user.id)} />
    </div>
  );
}
