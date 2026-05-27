"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { GameMode } from "@/lib/typing-engine/level-content";
import { getLevelTitle } from "@/lib/typing-engine/level-content";

const AI_STEPS = [
  "正在分析弱项键位…",
  "正在挑选小游戏形式…",
  "正在定制练习内容…",
  "马上就好，请稍等…",
];

const ORBIT_KEYS = ["A", "S", "D", "F", "J", "K", "L"];

type Props = {
  variant: "ai" | "default";
  mode?: GameMode;
  level?: number;
};

export function LevelLoadingScreen({ variant, mode, level }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (variant !== "ai") return;
    const id = setInterval(() => {
      setStep((current) => (current + 1) % AI_STEPS.length);
    }, 2200);
    return () => clearInterval(id);
  }, [variant]);

  if (variant === "default") {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-4 py-16">
        <div className="level-loader-card level-loader-card--plain w-full max-w-md px-8 py-10 text-center">
          <div className="level-loader-orbit level-loader-orbit--sm mx-auto">
            <div className="level-loader-core level-loader-core--sm">⌨️</div>
            <span className="level-loader-orbit-ring level-loader-orbit-ring--sm" aria-hidden />
          </div>
          <p className="mt-8 text-lg font-bold text-indigo-800">加载关卡中…</p>
          <p className="mt-2 text-sm text-slate-500">正在准备练习内容</p>
          <div className="level-loader-bar mt-8" aria-hidden>
            <span className="level-loader-bar-fill" />
          </div>
        </div>
      </div>
    );
  }

  const levelLabel =
    mode && level ? getLevelTitle(mode, level) : level ? `第 ${level} 关` : undefined;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="level-loader-card w-full max-w-lg px-8 py-10 text-center">
        <div className="relative mx-auto h-44 w-44">
          <span className="level-loader-spark level-loader-spark--1" aria-hidden>
            ✨
          </span>
          <span className="level-loader-spark level-loader-spark--2" aria-hidden>
            ⭐
          </span>
          <span className="level-loader-spark level-loader-spark--3" aria-hidden>
            ✦
          </span>

          <div className="level-loader-orbit mx-auto">
            <div className="level-loader-core">
              <span className="level-loader-core-icon">🤖</span>
              <span className="level-loader-core-glow" aria-hidden />
            </div>
            <div className="level-loader-orbit-keys" aria-hidden>
              {ORBIT_KEYS.map((key, index) => (
                <span
                  key={key}
                  className="level-loader-key"
                  style={{ "--orbit-index": index } as CSSProperties}
                >
                  {key}
                </span>
              ))}
            </div>
            <span className="level-loader-orbit-ring" aria-hidden />
          </div>
        </div>

        <p className="level-loader-title mt-8 text-2xl font-black tracking-tight">
          AI 正在为你生成下一关
        </p>
        {levelLabel ? (
          <p className="mt-2 text-sm font-medium text-violet-700">{levelLabel}</p>
        ) : null}

        <p key={step} className="level-loader-step mt-4 text-sm text-slate-600">
          {AI_STEPS[step]}
        </p>

        <div className="level-loader-dots mt-5 flex justify-center gap-2" aria-hidden>
          {AI_STEPS.map((_, index) => (
            <span
              key={index}
              className={`level-loader-dot ${index === step ? "level-loader-dot--active" : ""}`}
            />
          ))}
        </div>

        <div className="level-loader-bar mt-8" aria-hidden>
          <span className="level-loader-bar-fill" />
        </div>

        <p className="mt-4 text-xs text-slate-400">根据近期练习数据智能定制</p>
      </div>
    </div>
  );
}
