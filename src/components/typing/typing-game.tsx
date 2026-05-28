"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdventureStage } from "@/components/typing/adventure-stage";
import { AiCustomStage } from "@/components/typing/ai-custom-stage";
import { KeyRainStage } from "@/components/typing/key-rain-stage";
import { ChainStage } from "@/components/typing/chain-stage";
import { FoundationStage } from "@/components/typing/foundation-stage";
import {
  VirtualKeyboard,
  TargetPromptChar,
  matchKeystroke,
  normalizeTypingChar,
  normalizeTypingText,
  toKeyboardKey,
} from "@/components/typing/virtual-keyboard";
import { Button } from "@/components/ui/button";
import {
  analyzeSession,
  calculateStars,
  type KeystrokeEvent,
} from "@/lib/typing-engine/analyzer";
import {
  getItemsPerLevel,
  getLevelContent,
  getLevelCount,
  getLevelTitle,
  type GameMode,
} from "@/lib/typing-engine/level-content";
import { getFoundationPassAccuracy } from "@/lib/typing-engine/foundation-levels";
import { matchPinyinKeystroke } from "@/lib/typing-engine/pinyin";
import type { AiLevelItem } from "@/lib/ai/next-level";
import type { AiMiniGameType } from "@/lib/ai/mini-games";
import { t } from "@/lib/i18n";

const SHATTER_MS = 500;

type BurstTiming = {
  shatterMs: number;
  celebrateMs: number;
  flashCorrectMs: number;
  flashErrorMs: number;
  errorShakeMs: number;
};

function getBurstTiming(mode: GameMode): BurstTiming {
  if (mode === "FOUNDATION") {
    return {
      shatterMs: 0,
      celebrateMs: 0,
      flashCorrectMs: 70,
      flashErrorMs: 120,
      errorShakeMs: 120,
    };
  }
  if (mode === "AI_CUSTOM") {
    return {
      shatterMs: 260,
      celebrateMs: 360,
      flashCorrectMs: 140,
      flashErrorMs: 320,
      errorShakeMs: 260,
    };
  }
  return {
    shatterMs: SHATTER_MS,
    celebrateMs: 750,
    flashCorrectMs: 350,
    flashErrorMs: 600,
    errorShakeMs: 350,
  };
}

type LevelMeta = {
  hanzi?: string;
  chainHint?: string;
  levelTitle?: string;
  foundationLetter?: string;
  foundationKind?: "letter" | "exam";
  aiPrompt?: string;
  aiHint?: string;
};

type SaveProgressPayload = {
  level: number;
  itemIndex: number;
  levelComplete?: boolean;
  stars?: number;
};

type SaveProgressOptions = {
  silent?: boolean;
};

type Props = {
  childId: string;
  mode: GameMode;
  age: number;
  level: number;
  startItemIndex: number;
  aiLevelItems?: AiLevelItem[];
  aiGameType?: AiMiniGameType;
  aiGameTitle?: string;
  aiGameEmoji?: string;
  onSaveProgress: (payload: SaveProgressPayload, options?: SaveProgressOptions) => Promise<boolean>;
  onSaveCheckpoint?: (payload: SaveProgressPayload) => Promise<void>;
  onComplete: (payload: {
    stats: ReturnType<typeof analyzeSession>;
    stars: number;
    events: KeystrokeEvent[];
    level: number;
    itemIndex: number;
    levelComplete: boolean;
    examFailed?: boolean;
  }) => Promise<void>;
};

function loadItem(
  mode: GameMode,
  level: number,
  itemIndex: number,
  aiLevelItems?: AiLevelItem[],
): { text: string; meta: LevelMeta } | null {
  const aiItem = aiLevelItems?.[itemIndex];
  if (aiItem) {
    if (mode === "AI_CUSTOM") {
      return {
        text: normalizeTypingText(aiItem.text),
        meta: {
          levelTitle: getLevelTitle(mode, level),
          aiPrompt: aiItem.prompt ? normalizeTypingText(aiItem.prompt) : undefined,
          aiHint: aiItem.hint,
        },
      };
    }
    if (mode === "CHAIN" && aiItem.hanzi) {
      return {
        text: aiItem.text,
        meta: {
          hanzi: aiItem.hanzi,
          chainHint: aiItem.chainHint,
          levelTitle: aiItem.title ?? getLevelTitle(mode, level),
        },
      };
    }
    return {
      text: normalizeTypingText(aiItem.text),
      meta: { levelTitle: aiItem.title ?? getLevelTitle(mode, level) },
    };
  }

  const content = getLevelContent(mode, level, itemIndex);
  if (!content) return null;

  if (content.kind === "idiom") {
    return {
      text: content.text,
      meta: {
        hanzi: content.hanzi,
        chainHint: content.chainHint,
        levelTitle: getLevelTitle(mode, level),
      },
    };
  }

  if (content.kind === "text") {
    return {
      text: normalizeTypingText(content.text),
      meta: { levelTitle: content.title ?? getLevelTitle(mode, level) },
    };
  }

  if (content.kind === "foundation") {
    return {
      text: content.text,
      meta: {
        levelTitle: getLevelTitle(mode, level),
        foundationLetter: content.letter,
        foundationKind: content.kindLabel,
      },
    };
  }

  return {
    text: content.text,
    meta: { levelTitle: getLevelTitle(mode, level) },
  };
}

function getModeLabel(mode: GameMode) {
  if (mode === "ASSESSMENT") return t("learn.assessment");
  if (mode === "AI_CUSTOM") return t("learn.aiCustom");
  if (mode === "ADVENTURE") return t("learn.adventure");
  if (mode === "FOUNDATION") return t("learn.foundation");
  return t("learn.chain");
}

function matchForMode(mode: GameMode, input: string, expected: string) {
  if (mode === "CHAIN") return matchPinyinKeystroke(input, expected);
  return matchKeystroke(input, expected);
}

function usesBurstTyping(mode: GameMode) {
  return mode === "ADVENTURE" || mode === "AI_CUSTOM";
}

function isKeyRain(mode: GameMode, gameType?: AiMiniGameType) {
  return mode === "AI_CUSTOM" && gameType === "key_rain";
}

export function TypingGame({
  childId,
  mode,
  age,
  level,
  startItemIndex,
  aiLevelItems,
  aiGameType,
  aiGameTitle,
  aiGameEmoji,
  onSaveProgress,
  onSaveCheckpoint,
  onComplete,
}: Props) {
  const initial = useMemo(
    () => loadItem(mode, level, startItemIndex, aiLevelItems),
    [mode, level, startItemIndex, aiLevelItems],
  );

  const itemsPerLevel = aiLevelItems?.length ?? getItemsPerLevel(mode, level);
  const totalItems = itemsPerLevel;

  const [itemIndex, setItemIndex] = useState(startItemIndex);
  const [targetText, setTargetText] = useState(initial?.text ?? "");
  const [levelMeta, setLevelMeta] = useState<LevelMeta>(initial?.meta ?? {});
  const [typed, setTyped] = useState("");
  const [events, setEvents] = useState<KeystrokeEvent[]>([]);
  const [targetKey, setTargetKey] = useState<string | undefined>(() => initial?.text[0]);
  const [pressedKey, setPressedKey] = useState<string>();
  const [pressResult, setPressResult] = useState<"correct" | "error" | null>(null);
  const [combo, setCombo] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shatteringIndices, setShatteringIndices] = useState<number[]>([]);
  const [errorShake, setErrorShake] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [saveError, setSaveError] = useState("");

  const lastTimestamp = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shatterTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorShakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishSavedRef = useRef(false);

  const persistCheckpoint = useCallback(
    async (payload: SaveProgressPayload, options?: SaveProgressOptions): Promise<boolean> => {
      const ok = await onSaveProgress(payload, options);
      if (!ok && !options?.silent) setSaveError("进度保存失败，请重试");
      return ok;
    },
    [onSaveProgress],
  );

  const saveCheckpointQuietly = useCallback(
    async (payload: SaveProgressPayload) => {
      if (onSaveCheckpoint) {
        await onSaveCheckpoint(payload);
        return;
      }
      await onSaveProgress(payload, { silent: true });
    },
    [onSaveCheckpoint, onSaveProgress],
  );

  useEffect(() => {
    void saveCheckpointQuietly({ level, itemIndex: startItemIndex });
  }, [level, saveCheckpointQuietly, startItemIndex]);

  useEffect(() => {
    const saveCheckpoint = () => {
      if (finished || celebrating || submitting) return;
      void saveCheckpointQuietly({ level, itemIndex });
    };

    window.addEventListener("pagehide", saveCheckpoint);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") saveCheckpoint();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pagehide", saveCheckpoint);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [celebrating, finished, itemIndex, level, saveCheckpointQuietly, submitting]);

  useEffect(() => {
    lastTimestamp.current = Date.now();
  }, []);

  const flashKey = useCallback(
    (rawInput: string, result: "correct" | "error") => {
      const timing = getBurstTiming(mode);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      setPressedKey(rawInput);
      setPressResult(result);
      flashTimer.current = setTimeout(() => {
        setPressedKey(undefined);
        setPressResult(null);
      }, result === "error" ? timing.flashErrorMs : timing.flashCorrectMs);
    },
    [mode],
  );

  const syncTargetKey = useCallback((text: string, index: number) => {
    setTargetKey(text[index]);
  }, []);

  const clearShatterTimers = useCallback(() => {
    for (const timer of shatterTimers.current.values()) {
      clearTimeout(timer);
    }
    shatterTimers.current.clear();
    setShatteringIndices([]);
  }, []);

  const triggerShatter = useCallback(
    (index: number) => {
      setShatteringIndices((prev) => (prev.includes(index) ? prev : [...prev, index]));

      const existing = shatterTimers.current.get(index);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        setShatteringIndices((prev) => prev.filter((i) => i !== index));
        shatterTimers.current.delete(index);
      }, getBurstTiming(mode).shatterMs);

      shatterTimers.current.set(index, timer);
    },
    [mode],
  );

  const goToNextItem = useCallback(
    async (nextItemIndex: number) => {
      if (nextItemIndex >= totalItems) {
        clearShatterTimers();
        setFinished(true);
        setLevelComplete(true);
        setTargetKey(undefined);
        return;
      }

      const next = loadItem(mode, level, nextItemIndex, aiLevelItems);
      if (!next) {
        setFinished(true);
        setLevelComplete(true);
        setTargetKey(undefined);
        return;
      }

      setItemIndex(nextItemIndex);
      setTargetText(next.text);
      setLevelMeta(next.meta);
      setTyped("");
      setTargetKey(next.text[0]);
      if (mode === "FOUNDATION") {
        void saveCheckpointQuietly({ level, itemIndex: nextItemIndex });
      } else {
        await saveCheckpointQuietly({ level, itemIndex: nextItemIndex });
      }
    },
    [aiLevelItems, clearShatterTimers, level, mode, saveCheckpointQuietly, totalItems],
  );

  const advanceAfterItem = useCallback(
    (nextItemIndex: number) => {
      if (isKeyRain(mode, aiGameType)) {
        clearShatterTimers();
        void goToNextItem(nextItemIndex);
        return;
      }

      if (usesBurstTyping(mode)) {
        setCelebrating(true);
        celebrateTimer.current = setTimeout(() => {
          clearShatterTimers();
          setCelebrating(false);
          void goToNextItem(nextItemIndex);
        }, getBurstTiming(mode).celebrateMs);
        return;
      }

      void goToNextItem(nextItemIndex);
    },
    [aiGameType, clearShatterTimers, goToNextItem, mode],
  );

  const handleBackspace = useCallback(() => {
    if (finished || celebrating || typed.length === 0) return;

    const removeIndex = typed.length - 1;
    const nextTyped = typed.slice(0, -1);
    setTyped(nextTyped);
    setEvents((prev) => prev.slice(0, -1));
    setCombo(0);
    syncTargetKey(targetText, nextTyped.length);
    flashKey("Backspace", "correct");
    lastTimestamp.current = Date.now();

    const timer = shatterTimers.current.get(removeIndex);
    if (timer) {
      clearTimeout(timer);
      shatterTimers.current.delete(removeIndex);
    }
    setShatteringIndices((prev) => prev.filter((i) => i !== removeIndex));
  }, [celebrating, finished, flashKey, syncTargetKey, targetText, typed]);

  const handleKey = useCallback(
    (rawKey: string) => {
      if (finished || celebrating) return;

      const expectedChar = targetText[typed.length];
      if (expectedChar === undefined) return;

      const now = Date.now();
      if (lastTimestamp.current === 0) lastTimestamp.current = now;

      const inputChar =
        rawKey === " " ? " " : rawKey === "Tab" ? "\t" : rawKey === "Enter" ? "\n" : rawKey;

      const correct = matchForMode(mode, inputChar, expectedChar);
      const event: KeystrokeEvent = {
        key: inputChar,
        timestamp: now,
        correct,
        latencyMs: now - lastTimestamp.current,
        expected: expectedChar,
      };
      lastTimestamp.current = now;

      setEvents((prev) => [...prev, event]);
      flashKey(inputChar, correct ? "correct" : "error");

      if (!correct) {
        setCombo(0);
        if (usesBurstTyping(mode)) {
          setErrorShake(true);
          if (errorShakeTimer.current) clearTimeout(errorShakeTimer.current);
          errorShakeTimer.current = setTimeout(
            () => setErrorShake(false),
            getBurstTiming(mode).errorShakeMs,
          );
        }
        return;
      }

      setCombo((c) => c + 1);

      if (usesBurstTyping(mode)) {
        const shatterAt = typed.length;
        const nextTyped = typed + expectedChar;
        setTyped(nextTyped);
        syncTargetKey(targetText, nextTyped.length);
        triggerShatter(shatterAt);

        if (nextTyped.length >= targetText.length) {
          advanceAfterItem(itemIndex + 1);
        }
        return;
      }

      const nextTyped = typed + expectedChar;
      setTyped(nextTyped);
      syncTargetKey(targetText, nextTyped.length);

      if (nextTyped.length >= targetText.length) {
        advanceAfterItem(itemIndex + 1);
      }
    },
    [
      advanceAfterItem,
      celebrating,
      finished,
      flashKey,
      itemIndex,
      mode,
      syncTargetKey,
      targetText,
      triggerShatter,
      typed,
    ],
  );

  const stats = analyzeSession(events);
  const stars = calculateStars(stats, age);
  const passAccuracy = mode === "FOUNDATION" ? getFoundationPassAccuracy(level) : undefined;
  const examPassed = passAccuracy === undefined || stats.accuracy >= passAccuracy;
  const levelPassed = levelComplete && examPassed;
  const examFailed = levelComplete && passAccuracy !== undefined && !examPassed;

  useEffect(() => {
    if (!finished || !levelComplete || finishSavedRef.current) return;
    finishSavedRef.current = true;
    void saveCheckpointQuietly({
      level,
      itemIndex: examFailed ? 0 : totalItems,
      levelComplete: levelPassed,
      stars: levelPassed ? stars : undefined,
    });
  }, [
    examFailed,
    finished,
    level,
    levelComplete,
    levelPassed,
    saveCheckpointQuietly,
    stars,
    totalItems,
  ]);

  useEffect(() => {
    if (!finished || !isKeyRain(mode, aiGameType)) return;
    const timer = setTimeout(() => {
      void submit();
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, mode, aiGameType]);

  const submit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setSaveError("");
    const saved = await persistCheckpoint({
      level,
      itemIndex: examFailed ? 0 : totalItems,
      levelComplete: levelPassed,
      stars: levelPassed ? stars : undefined,
    });
    if (!saved) {
      setSubmitting(false);
      return;
    }
    await onComplete({
      stats,
      stars,
      events,
      level,
      itemIndex: levelPassed ? totalItems : itemIndex,
      levelComplete: levelPassed,
      examFailed,
    });
    setSubmitting(false);
  }, [
    events,
    examFailed,
    itemIndex,
    level,
    levelPassed,
    onComplete,
    persistCheckpoint,
    stars,
    stats,
    submitting,
    totalItems,
  ]);

  const onKeyboardInput = useCallback(
    (rawKey: string) => {
      if (finished && !submitting && (rawKey === "Enter" || rawKey === "\n")) {
        void submit();
        return;
      }
      if (rawKey === "Backspace") {
        handleBackspace();
        return;
      }
      handleKey(rawKey);
    },
    [finished, handleBackspace, handleKey, submit, submitting],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (finished) {
        if (e.key === "Enter" && !submitting) {
          e.preventDefault();
          void submit();
        }
        return;
      }
      if (celebrating) return;
      if (e.isComposing) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        handleKey("\t");
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleKey("\n");
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        handleKey(" ");
        return;
      }
      if (e.key === "Shift") return;

      if (e.key.length !== 1) return;

      const keyChar = normalizeTypingChar(e.key);
      if (mode === "CHAIN") {
        if (!/[a-zA-Z ]/.test(keyChar)) return;
      } else if (!toKeyboardKey(keyChar) && !/[0-9]/.test(keyChar)) {
        return;
      }

      e.preventDefault();
      handleKey(keyChar);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [celebrating, finished, handleBackspace, handleKey, mode, submit, submitting]);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      for (const timer of shatterTimers.current.values()) {
        clearTimeout(timer);
      }
      shatterTimers.current.clear();
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      if (errorShakeTimer.current) clearTimeout(errorShakeTimer.current);
    },
    [],
  );

  const promptTitle =
    levelMeta.levelTitle ?? `${getModeLabel(mode)} · 第 ${level}/${getLevelCount(mode)} 关`;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col" data-child-id={childId}>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
        {mode === "AI_CUSTOM" && aiGameType ? (
          aiGameType === "key_rain" ? (
            <KeyRainStage
              gameTitle={aiGameTitle}
              gameEmoji={aiGameEmoji}
              levelTitle={promptTitle}
              targetText={targetText}
              hint={levelMeta.aiHint}
              typedLength={typed.length}
              itemRound={itemIndex + 1}
              totalRounds={totalItems}
              combo={combo}
              celebrating={celebrating}
              errorShake={errorShake}
            />
          ) : (
            <AiCustomStage
              gameType={aiGameType}
              gameTitle={aiGameTitle}
              gameEmoji={aiGameEmoji}
              levelTitle={promptTitle}
              targetText={targetText}
              displayPrompt={levelMeta.aiPrompt}
              hint={levelMeta.aiHint}
              typedLength={typed.length}
              itemRound={itemIndex + 1}
              totalRounds={totalItems}
              combo={combo}
              celebrating={celebrating}
              shatteringIndices={shatteringIndices}
              errorShake={errorShake}
            />
          )
        ) : mode === "ADVENTURE" ? (
          <AdventureStage
            word={targetText}
            typedLength={typed.length}
            shatteringIndices={shatteringIndices}
            errorShake={errorShake}
            wordRound={itemIndex + 1}
            totalRounds={totalItems}
            combo={combo}
            celebrating={celebrating}
            levelTitle={promptTitle}
          />
        ) : mode === "FOUNDATION" && levelMeta.foundationKind ? (
          <FoundationStage
            text={targetText}
            typedLength={typed.length}
            letter={levelMeta.foundationLetter}
            kindLabel={levelMeta.foundationKind}
            itemRound={itemIndex + 1}
            totalRounds={totalItems}
            combo={combo}
            levelTitle={promptTitle}
            passHint={
              passAccuracy
                ? `毕业考试：共 ${totalItems} 个单词，准确率 ≥ ${passAccuracy}% 即可通关`
                : undefined
            }
          />
        ) : mode === "CHAIN" && levelMeta.hanzi ? (
          <ChainStage
            hanzi={levelMeta.hanzi}
            pinyinTarget={targetText}
            typedLength={typed.length}
            chainHint={levelMeta.chainHint}
            idiomRound={itemIndex + 1}
            totalRounds={totalItems}
            combo={combo}
            levelTitle={promptTitle}
          />
        ) : (
          <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-8 text-white shadow-xl">
            <div className="mb-4 flex items-center justify-between text-sm opacity-90">
              <span>
                {t("game.combo")}: {combo}
              </span>
              <span>{promptTitle}</span>
            </div>
            <div className="min-h-16 whitespace-pre-wrap text-3xl font-bold tracking-wide md:text-4xl">
              {targetText.split("").map((char, index) => {
                const state =
                  index < typed.length ? "typed" : index === typed.length ? "active" : "pending";
                const colorClass =
                  index < typed.length
                    ? "text-emerald-300"
                    : index === typed.length
                      ? char === " "
                        ? ""
                        : "underline decoration-sky-300 decoration-4"
                      : "opacity-70";

                return (
                  <TargetPromptChar
                    key={`${char}-${index}`}
                    char={char}
                    state={state}
                    className={colorClass}
                  />
                );
              })}
            </div>
          </div>
        )}

        {finished && (
          <div
            className={`rounded-3xl border p-6 text-center ${
              levelComplete && !examPassed
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <p
              className={`text-2xl font-black ${
                levelComplete && !examPassed ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {levelComplete && !examPassed
                ? `未达考试标准（需 ${passAccuracy}% 准确率）`
                : levelPassed
                  ? "关卡完成！"
                  : t("game.great")}
            </p>
            <p className="mt-2 text-slate-600">
              {t("game.accuracy")} {Math.round(stats.accuracy)}% · {t("game.wpm")}{" "}
              {Math.round(stats.wpm)} · {t("game.stars")} {"⭐".repeat(stars)}
            </p>
            {levelComplete && !examPassed ? (
              <p className="mt-2 text-sm text-amber-800">再练一次，争取达到 {passAccuracy}% 即可毕业通关</p>
            ) : null}
            <Button className="mt-4" onClick={submit} disabled={submitting}>
              {submitting
                ? "保存中..."
                : levelComplete && !examPassed
                  ? t("game.tryAgain")
                  : t("game.finish")}
            </Button>
            {!submitting ? (
              <p className="mt-3 text-sm text-slate-500">按 Enter 键也可继续</p>
            ) : null}
            {saveError ? <p className="mt-3 text-sm text-rose-600">{saveError}</p> : null}
          </div>
        )}
      </div>

      <VirtualKeyboard
        targetKey={targetKey}
        pressedKey={pressedKey}
        pressResult={pressResult}
        onKeyPress={onKeyboardInput}
      />
    </div>
  );
}
