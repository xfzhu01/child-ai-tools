"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { TypingGame } from "@/components/typing/typing-game";
import type { KeystrokeEvent } from "@/lib/typing-engine/analyzer";
import { analyzeSession } from "@/lib/typing-engine/analyzer";
import type { GameMode } from "@/lib/typing-engine/level-content";
import { getLevelCount } from "@/lib/typing-engine/level-content";
import {
  FREE_DAILY_SESSIONS,
  isUnlimitedFreeMode,
} from "@/lib/billing/free-tier-constants";
import {
  incrementGuestSessionUsage,
  saveGuestModeProgress,
} from "@/lib/guest/guest-storage";
import { useGuestProgress, useGuestSessionAccess } from "@/lib/guest/use-guest-storage";

const GUEST_AGE = 8;
const GUEST_CHILD_ID = "guest";

type Props = { mode: GameMode };

export function GuestPlayClient({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");
  const resume = searchParams.get("resume") === "1";

  const progress = useGuestProgress(mode);
  const access = useGuestSessionAccess(mode);

  const level = useMemo(() => {
    if (levelParam) return Number(levelParam) || 1;
    if (resume) return progress.currentLevel;
    return progress.currentLevel;
  }, [levelParam, resume, progress.currentLevel]);

  const startItemIndex =
    resume || (!levelParam && progress.currentLevel === level) ? progress.itemIndex : 0;

  const limitError =
    !access.allowed && !resume && !isUnlimitedFreeMode(mode)
      ? `今日免费体验次数已用完（${FREE_DAILY_SESSIONS} 关/天），注册后可保存进度并继续练习`
      : "";

  const saveProgress = useCallback(
    async (payload: {
      level: number;
      itemIndex: number;
      levelComplete?: boolean;
      stars?: number;
    }) => {
      saveGuestModeProgress({ mode, ...payload });
      return true;
    },
    [mode],
  );

  const saveCheckpoint = useCallback(
    async (payload: { level: number; itemIndex: number }) => {
      saveGuestModeProgress({ mode, ...payload });
    },
    [mode],
  );

  const onComplete = async ({
    stars,
    level: completedLevel,
    itemIndex,
    levelComplete,
    examFailed,
  }: {
    stats: ReturnType<typeof analyzeSession>;
    stars: number;
    events: KeystrokeEvent[];
    level: number;
    itemIndex: number;
    levelComplete: boolean;
    examFailed?: boolean;
  }) => {
    await saveProgress({
      level: completedLevel,
      itemIndex: examFailed ? 0 : itemIndex,
      levelComplete: levelComplete && !examFailed,
      stars: levelComplete && !examFailed ? stars : undefined,
    });

    if (levelComplete && !examFailed && !isUnlimitedFreeMode(mode)) {
      incrementGuestSessionUsage(mode);
    }

    const maxLevels = getLevelCount(mode);
    if (examFailed) {
      router.push(`/try/play?mode=${mode}&level=${completedLevel}`);
    } else if (levelComplete && completedLevel < maxLevels) {
      router.push(`/try/play?mode=${mode}&level=${completedLevel + 1}`);
    } else if (levelComplete) {
      router.push(`/try/levels/${mode}?done=1`);
    } else {
      router.push("/try");
    }
  };

  if (limitError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg font-medium text-amber-800">{limitError}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
            免费注册
          </Link>
          <Link href="/try" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
            返回体验中心
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-amber-100 bg-amber-50/80 px-4 py-2 text-center text-sm text-amber-900">
        体验模式 · 进度保存在本机浏览器 ·{" "}
        <Link href="/register" className="font-semibold text-indigo-700 underline-offset-2 hover:underline">
          注册后同步到云端
        </Link>
      </div>
      <TypingGame
        key={`guest-${mode}-${level}-${startItemIndex}`}
        childId={GUEST_CHILD_ID}
        mode={mode}
        age={GUEST_AGE}
        level={level}
        startItemIndex={startItemIndex}
        onSaveProgress={saveProgress}
        onSaveCheckpoint={saveCheckpoint}
        onComplete={onComplete}
      />
    </>
  );
}
