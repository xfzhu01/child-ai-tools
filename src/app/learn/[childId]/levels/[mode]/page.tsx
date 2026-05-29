import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { canStartSession, FREE_DAILY_SESSIONS, getSubscriptionStatus } from "@/lib/billing/entitlements";
import { getLevelCount, getLevelTitle, type GameMode } from "@/lib/typing-engine/level-content";
import { getAllModeProgress, isLevelUnlocked } from "@/lib/typing-engine/mode-progress";
import { BundleLevelCard, MODE_BUNDLE_TEASERS } from "@/components/billing/bundle-level-teaser";
import { DailyLimitNotice } from "@/components/billing/daily-limit-notice";
import { FoundationScratchCard } from "@/components/typing/foundation-scratch-card";
import { t } from "@/lib/i18n";

const OFFICIAL_MODES = ["ASSESSMENT", "ADVENTURE", "CHAIN", "FOUNDATION"] as const;
type OfficialMode = (typeof OFFICIAL_MODES)[number];

const MODE_META: Record<OfficialMode, { title: string; desc: string; emoji: string }> = {
  FOUNDATION: {
    title: t("learn.foundation"),
    desc: "按传统指法顺序逐字母刮卡练习，完全免费、不限次数",
    emoji: "⌨️",
  },
  ASSESSMENT: {
    title: t("learn.assessment"),
    desc: "3 关覆盖全键盘，建立打字基线",
    emoji: "📋",
  },
  ADVENTURE: {
    title: t("learn.adventure"),
    desc: "30 关由易到难，每关 10 个单词",
    emoji: "🎮",
  },
  CHAIN: {
    title: t("learn.chain"),
    desc: "10 关成语拼音接龙由易到难，每关 5 个成语",
    emoji: "🐉",
  },
};

export default async function ModeLevelsPage({
  params,
}: {
  params: Promise<{ childId: string; mode: string }>;
}) {
  const { childId, mode: modeParam } = await params;
  const mode = modeParam.toUpperCase() as GameMode;

  if (!OFFICIAL_MODES.includes(mode as OfficialMode)) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const child = await prisma.childProfile.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) notFound();

  const subscription = await getSubscriptionStatus(session.user.id);
  const access = await canStartSession(session.user.id, child.id, mode);
  const isFoundation = mode === "FOUNDATION";
  const sessionLabel = isFoundation
    ? "完全免费 · 无限练习"
    : subscription.hasBasic
      ? `${subscription.label} · 无限练习`
      : `今日剩余 ${access.remaining}/${FREE_DAILY_SESSIONS} 关`;
  const progressMap = await getAllModeProgress(child.id);
  const progress = progressMap[mode as OfficialMode]!;
  const meta = MODE_META[mode as OfficialMode];
  const levelCount = getLevelCount(mode);
  const canStart = isFoundation || access.allowed;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href={`/learn/${childId}`} className="text-sm font-bold text-grape-600 hover:text-grape-800">
        ← 返回模式选择
      </Link>
      <h1 className="mt-4 font-display text-3xl font-extrabold">
        <span className="candy-wiggle mr-1 inline-block">{meta.emoji}</span> {meta.title}
      </h1>
      <p className="mt-2 text-slate-600">{meta.desc}</p>
      <p className="mt-1 text-sm font-medium text-grape-600">
        {child.name} · {sessionLabel}
      </p>

      {!isFoundation && !access.allowed ? (
        <div className="mt-6">
          <DailyLimitNotice childId={childId} compact />
        </div>
      ) : null}

      {canStart && (progress.itemIndex > 0 || progress.currentLevel > 1) ? (
        <Link
          href={`/learn/${childId}/play?mode=${mode}&resume=1`}
          className="mt-6 block"
        >
          <Button variant="child" className="w-full sm:w-auto">
            继续第 {progress.currentLevel} 关
            {progress.itemIndex > 0 ? `（第 ${progress.itemIndex + 1} 项）` : ""}
          </Button>
        </Link>
      ) : null}

      {!canStart && progress.itemIndex > 0 ? (
        <Link
          href={`/learn/${childId}/play?mode=${mode}&resume=1`}
          className="mt-4 block"
        >
          <Button variant="secondary" className="w-full sm:w-auto">
            继续进行中的第 {progress.currentLevel} 关
          </Button>
        </Link>
      ) : null}

      <div
        className={`mt-8 grid gap-3 ${
          isFoundation ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        }`}
      >
        {Array.from({ length: levelCount }, (_, i) => i + 1).map((level) => {
          const unlocked = isLevelUnlocked(progress, level);
          const stars = progress.levelStars[String(level)] ?? 0;
          const isCurrent = progress.currentLevel === level && progress.itemIndex > 0;

          if (isFoundation) {
            return (
              <FoundationScratchCard
                key={level}
                level={level}
                unlocked={unlocked}
                stars={stars}
                isCurrent={isCurrent}
                canStart={canStart}
                childId={childId}
              />
            );
          }

          return (
            <Card
              key={level}
              className={`candy-card p-4 ${unlocked ? "" : "opacity-50"} ${isCurrent ? "border-grape-300 ring-2 ring-grape-200" : ""}`}
            >
              <p className="text-xs font-bold text-grape-500">关卡 {level}</p>
              <p className="mt-1 text-sm font-bold leading-snug">{getLevelTitle(mode, level)}</p>
              <p className="mt-2 text-sm text-sun-600">{stars > 0 ? "⭐".repeat(stars) : "未挑战"}</p>
              {unlocked && canStart ? (
                <Link href={`/learn/${childId}/play?mode=${mode}&level=${level}`} className="mt-3 block">
                  <Button variant="child" className="w-full text-sm">
                    {isCurrent ? "继续" : "开始"}
                  </Button>
                </Link>
              ) : unlocked && !canStart ? (
                <p className="mt-3 text-center text-xs text-coral-600">今日次数已用完</p>
              ) : (
                <p className="mt-3 text-center text-xs text-slate-400">未解锁</p>
              )}
            </Card>
          );
        })}
        <BundleLevelCard teaser={MODE_BUNDLE_TEASERS[mode as OfficialMode]} />
      </div>
    </div>
  );
}
