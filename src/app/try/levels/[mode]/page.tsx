"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FoundationScratchCard } from "@/components/typing/foundation-scratch-card";
import { FREE_DAILY_SESSIONS } from "@/lib/billing/free-tier-constants";
import { getLevelCount, getLevelTitle, type GameMode } from "@/lib/typing-engine/level-content";
import type { ModeProgressSnapshot } from "@/lib/typing-engine/mode-progress";
import { formatModeProgress, hasModeProgress } from "@/lib/typing-engine/progress-display";
import { useGuestProgress, useGuestSessionAccess } from "@/lib/guest/use-guest-storage";
import { t } from "@/lib/i18n";

const OFFICIAL_MODES = ["FOUNDATION", "ASSESSMENT", "ADVENTURE", "CHAIN"] as const;
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

function isLevelUnlocked(progress: ModeProgressSnapshot, level: number) {
  return level <= progress.maxUnlocked;
}

export default function GuestLevelsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const modeParam = String(params.mode ?? "").toUpperCase() as GameMode;
  const done = searchParams.get("done") === "1";
  const isValidMode = OFFICIAL_MODES.includes(modeParam as OfficialMode);
  const mode = (isValidMode ? modeParam : "FOUNDATION") as OfficialMode;
  const progress = useGuestProgress(mode);
  const access = useGuestSessionAccess(mode);

  if (!isValidMode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg text-slate-700">模式不存在</p>
        <Link href="/try" className="mt-4 inline-block font-bold text-grape-600">
          返回体验中心
        </Link>
      </div>
    );
  }

  const meta = MODE_META[mode];
  const isFoundation = mode === "FOUNDATION";
  const levelCount = getLevelCount(mode);
  const canStart = isFoundation || access.allowed;
  const sessionLabel = isFoundation
    ? "完全免费 · 无限练习"
    : `今日剩余 ${access.remaining}/${FREE_DAILY_SESSIONS} 关体验`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-12">
      <Link href="/try" className="text-sm font-bold text-grape-600 hover:text-grape-800">
        ← 返回体验中心
      </Link>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            <span className="candy-wiggle mr-1 inline-block">{meta.emoji}</span> {meta.title}
          </h1>
          <p className="mt-2 text-slate-600">{meta.desc}</p>
          <p className="mt-1 text-sm font-bold text-grape-700">{sessionLabel}</p>
        </div>
        {hasModeProgress(progress) ? (
          <span className="inline-flex rounded-full bg-grape-100 px-3 py-1 text-sm font-bold text-grape-700 ring-1 ring-inset ring-grape-200">
            {formatModeProgress(mode, progress)}
          </span>
        ) : null}
      </div>

      {done ? (
        <Card className="mt-6 border-mint-200 bg-mint-50">
          <p className="font-bold text-mint-700">🎉 恭喜完成本模式体验！注册后可保存进度并解锁 AI 定制关。</p>
        </Card>
      ) : null}

      {!canStart ? (
        <Card className="mt-6 border-coral-200 bg-coral-50">
          <p className="text-coral-700">
            今日免费体验次数已用完。明天再来，或{" "}
            <Link href="/register" className="font-bold text-grape-700 underline">
              注册账号
            </Link>{" "}
            解锁更多练习。
          </p>
        </Card>
      ) : null}

      <div
        className={`mt-8 grid gap-3 ${
          isFoundation ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 md:grid-cols-3"
        }`}
      >
        {Array.from({ length: levelCount }, (_, i) => i + 1).map((level) => {
          const unlocked = isLevelUnlocked(progress, level);
          const stars = progress.levelStars[String(level)] ?? 0;
          const href = `/try/play?mode=${mode}&level=${level}`;
          const isCurrent = progress.currentLevel === level && progress.itemIndex > 0;

          if (mode === "FOUNDATION") {
            return (
              <FoundationScratchCard
                key={level}
                level={level}
                stars={stars}
                unlocked={unlocked}
                isCurrent={isCurrent}
                canStart={canStart}
                playHref={href}
              />
            );
          }

          return (
            <Card key={level} className={`candy-card p-4 ${unlocked ? "" : "opacity-50"} ${isCurrent ? "border-grape-300 ring-2 ring-grape-200" : ""}`}>
              <p className="text-xs font-bold text-grape-500">关卡 {level}</p>
              <p className="mt-1 text-sm font-bold leading-snug">{getLevelTitle(mode, level)}</p>
              <p className="mt-2 text-sm text-sun-600">{stars > 0 ? "⭐".repeat(stars) : "未挑战"}</p>
              {unlocked && canStart ? (
                <Link href={href} className="mt-3 block">
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
      </div>

      {hasModeProgress(progress) ? (
        <div className="mt-8 text-center">
          <Link href={`/try/play?mode=${mode}&resume=1`}>
            <Button variant="secondary" size="lg">
              继续上次进度
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
