"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LevelLoadingScreen } from "@/components/typing/level-loading-screen";
import { TypingGame } from "@/components/typing/typing-game";
import type { AiLevelItem } from "@/lib/ai/next-level";
import type { KeystrokeEvent } from "@/lib/typing-engine/analyzer";
import { analyzeSession } from "@/lib/typing-engine/analyzer";
import type { GameMode } from "@/lib/typing-engine/level-content";
import { getLevelCount } from "@/lib/typing-engine/level-content";
import type { AiMiniGameType } from "@/lib/ai/mini-games";
import type { ModeProgressSnapshot } from "@/lib/typing-engine/mode-progress";

type Props = { childId: string; age: number; aiUnlocked: boolean };

const MODES_WITH_LEVELS: GameMode[] = [
  "ASSESSMENT",
  "ADVENTURE",
  "CHAIN",
  "FOUNDATION",
  "AI_CUSTOM",
];
const AI_CONTENT_MODES: GameMode[] = ["ASSESSMENT", "ADVENTURE", "CHAIN", "AI_CUSTOM"];

export function PlayClient({ childId, age, aiUnlocked }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") ?? "ADVENTURE") as GameMode;
  const levelParam = searchParams.get("level");
  const resume = searchParams.get("resume") === "1";

  const [aiLevelItems, setAiLevelItems] = useState<AiLevelItem[]>();
  const [aiSource, setAiSource] = useState<"ai" | "rule">();
  const [aiGameType, setAiGameType] = useState<AiMiniGameType>();
  const [aiGameTitle, setAiGameTitle] = useState<string>();
  const [aiGameEmoji, setAiGameEmoji] = useState<string>();
  const [progress, setProgress] = useState<Partial<Record<GameMode, ModeProgressSnapshot>>>();
  const needsProgress = MODES_WITH_LEVELS.includes(mode);
  /** 零基础指法使用固定字母课程，不走 AI 生成内容 */
  const usesAiContent = aiUnlocked && AI_CONTENT_MODES.includes(mode);
  const [loading, setLoading] = useState(usesAiContent || needsProgress);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        if (usesAiContent) {
          const progressRes = needsProgress
            ? await fetch(`/api/children/${childId}/progress`).then((r) => r.json())
            : null;
          if (cancelled) return;

          const modeProgress = progressRes?.progress?.[mode] as ModeProgressSnapshot | undefined;
          if (progressRes?.progress) setProgress(progressRes.progress);

          const level = levelParam
            ? Number(levelParam) || 1
            : resume
              ? modeProgress?.currentLevel ?? 1
              : modeProgress?.currentLevel ?? 1;

          const aiRes = await fetch("/api/ai/next-level", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ childId, mode, level }),
          });
          const aiData = await aiRes.json();
          if (cancelled) return;

          if (!aiRes.ok) {
            setLoadError(aiData.error ?? "AI 关卡生成失败");
            return;
          }

          if (aiData.items?.length) {
            setAiLevelItems(aiData.items);
            setAiSource(aiData.source);
            if (mode === "AI_CUSTOM" && aiData.gameType) {
              setAiGameType(aiData.gameType as AiMiniGameType);
              setAiGameTitle(aiData.gameTitle);
              setAiGameEmoji(aiData.gameEmoji);
            }
          } else {
            setLoadError("关卡内容为空，请重试");
          }
          return;
        }

        if (!needsProgress) return;

        const progressRes = await fetch(`/api/children/${childId}/progress`).then((r) => r.json());
        if (cancelled) return;
        if (progressRes.progress) setProgress(progressRes.progress);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [childId, levelParam, mode, needsProgress, resume, usesAiContent]);

  const modeProgress = progress?.[mode];
  const level = levelParam
    ? Number(levelParam) || 1
    : resume
      ? modeProgress?.currentLevel ?? 1
      : modeProgress?.currentLevel ?? 1;
  const startItemIndex =
    resume || (!levelParam && modeProgress?.currentLevel === level)
      ? modeProgress?.itemIndex ?? 0
      : 0;

  const saveCheckpoint = useCallback(
    async (payload: {
      level: number;
      itemIndex: number;
      levelComplete?: boolean;
      stars?: number;
    }) => {
      if (!MODES_WITH_LEVELS.includes(mode)) return;
      const res = await fetch(`/api/children/${childId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, ...payload }),
      });
      if (!res.ok) {
        console.error("进度保存失败", await res.text());
      }
    },
    [childId, mode],
  );

  const saveProgress = useCallback(
    async (
      payload: {
        level: number;
        itemIndex: number;
        levelComplete?: boolean;
        stars?: number;
      },
      options?: { silent?: boolean },
    ): Promise<boolean> => {
      if (!MODES_WITH_LEVELS.includes(mode)) return true;
      if (!options?.silent) setSaveError("");
      const res = await fetch(`/api/children/${childId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, ...payload }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error("进度保存失败", body);
        if (!options?.silent) {
          let message = "进度保存失败，请检查网络后重试";
          try {
            const parsed = JSON.parse(body) as { error?: string };
            if (parsed.error) message = parsed.error;
          } catch {
            // keep default message
          }
          setSaveError(message);
        }
        return false;
      }
      const data = await res.json();
      if (!options?.silent && data.progress) {
        setProgress((prev) => ({ ...prev, [mode]: data.progress }));
      }
      return true;
    },
    [childId, mode, setProgress, setSaveError],
  );

  const onComplete = async ({
    stats,
    stars,
    events,
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
    let progressSaved = true;
    if (MODES_WITH_LEVELS.includes(mode)) {
      progressSaved = await saveProgress({
        level: completedLevel,
        itemIndex: examFailed ? 0 : itemIndex,
        levelComplete: levelComplete && !examFailed,
        stars: levelComplete && !examFailed ? stars : undefined,
      });
    }

    if (!progressSaved) {
      setSaveError((prev) => prev || "进度保存失败，请重试");
      return;
    }

    setSaveError("");

    const sessionRes = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        mode,
        levelNumber: completedLevel,
        levelComplete,
        itemIndex,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        durationSec: stats.durationSec,
        stars,
        comboMax: stats.comboMax,
        rawEvents: events,
        errorKeys: stats.errorKeys,
        slowKeys: stats.slowKeys,
      }),
    });
    if (!sessionRes.ok) {
      const body = await sessionRes.text();
      console.error("练习记录保存失败", body);
      let message = "练习记录保存失败，请重试";
      try {
        const parsed = JSON.parse(body) as { error?: string };
        if (parsed.error) message = parsed.error;
      } catch {
        // keep default message
      }
      setSaveError(message);
      return;
    }
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "session_complete", childId, props: { mode, stars, level: completedLevel } }),
    });

    const maxLevels = getLevelCount(mode);
    if (examFailed) {
      router.push(`/learn/${childId}/play?mode=${mode}&level=${completedLevel}`);
    } else if (levelComplete && completedLevel < maxLevels) {
      router.push(`/learn/${childId}/play?mode=${mode}&level=${completedLevel + 1}`);
    } else if (mode === "AI_CUSTOM" && levelComplete) {
      router.push(`/learn/${childId}?done=ai=1`);
    } else if (levelComplete) {
      router.push(`/learn/${childId}/levels/${mode}?done=1`);
    } else {
      router.push(`/learn/${childId}`);
    }
    router.refresh();
  };

  if (loading) {
    return (
      <LevelLoadingScreen
        variant={usesAiContent ? "ai" : "default"}
        mode={mode}
        level={levelParam ? Number(levelParam) || 1 : undefined}
      />
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg font-medium text-rose-600">{loadError}</p>
        <button
          type="button"
          className="mt-4 text-indigo-600"
          onClick={() => router.push(`/learn/${childId}`)}
        >
          返回模式选择
        </button>
      </div>
    );
  }

  return (
    <>
      {usesAiContent && aiSource ? (
        <p className="mx-auto max-w-4xl px-4 pt-4 text-center text-xs text-violet-600">
          {mode === "AI_CUSTOM" && aiGameTitle
            ? `${aiGameEmoji ?? "🎮"} 本关：${aiGameTitle} · ${aiSource === "ai" ? "AI 根据弱项生成内容" : "规则引擎备用内容"}`
            : aiSource === "ai"
              ? "✨ 本关内容由 AI 根据小朋友练习数据智能生成"
              : "本关内容由规则引擎根据弱项键位生成"}
        </p>
      ) : null}
      {saveError ? (
        <p className="mx-auto max-w-4xl px-4 pt-4 text-center text-sm text-rose-600">{saveError}</p>
      ) : null}
      <TypingGame
        key={`${mode}-${level}-${startItemIndex}-${aiGameType ?? "static"}-${aiLevelItems?.map((e) => e.text).join("|") ?? "static"}`}
        childId={childId}
        mode={mode}
        age={age}
        level={level}
        startItemIndex={startItemIndex}
        aiLevelItems={aiLevelItems}
        aiGameType={aiGameType}
        aiGameTitle={aiGameTitle}
        aiGameEmoji={aiGameEmoji}
        onSaveProgress={saveProgress}
        onSaveCheckpoint={saveCheckpoint}
        onComplete={onComplete}
      />
    </>
  );
}
