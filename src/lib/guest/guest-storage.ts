"use client";

import {
  FREE_DAILY_SESSIONS,
  isUnlimitedFreeMode,
} from "@/lib/billing/free-tier-constants";
import type { GameMode } from "@/lib/typing-engine/level-content";
import type { ModeProgressSnapshot } from "@/lib/typing-engine/mode-progress";
import { getLevelCount } from "@/lib/typing-engine/level-content";

const STORAGE_KEY = "xiaobao-guest-v1";

type GuestStore = {
  progress: Partial<Record<GameMode, ModeProgressSnapshot>>;
  dailySessions: number;
  dailyDate: string;
};

export type { GuestStore };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_PROGRESS: ModeProgressSnapshot = {
  currentLevel: 1,
  maxUnlocked: 1,
  itemIndex: 0,
  levelStars: {},
};

function defaultProgress(): ModeProgressSnapshot {
  return {
    currentLevel: 1,
    maxUnlocked: 1,
    itemIndex: 0,
    levelStars: {},
  };
}

export function readGuestStore(): GuestStore {
  return readStore();
}

function readStore(): GuestStore {
  if (typeof window === "undefined") {
    return { progress: {}, dailySessions: 0, dailyDate: todayKey() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { progress: {}, dailySessions: 0, dailyDate: todayKey() };
    }
    const parsed = JSON.parse(raw) as GuestStore;
    if (parsed.dailyDate !== todayKey()) {
      return { ...parsed, dailySessions: 0, dailyDate: todayKey() };
    }
    return parsed;
  } catch {
    return { progress: {}, dailySessions: 0, dailyDate: todayKey() };
  }
}

function writeStore(store: GuestStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("xiaobao-guest-update"));
}

export function getGuestProgress(mode: GameMode): ModeProgressSnapshot {
  const store = readStore();
  return store.progress[mode] ?? EMPTY_PROGRESS;
}

export function getAllGuestProgress(): Partial<Record<GameMode, ModeProgressSnapshot>> {
  return readStore().progress;
}

export function getGuestSessionAccess(mode?: GameMode) {
  if (mode && isUnlimitedFreeMode(mode)) {
    return { allowed: true, remaining: Infinity };
  }
  const store = readStore();
  const remaining = Math.max(0, FREE_DAILY_SESSIONS - store.dailySessions);
  return { allowed: remaining > 0, remaining };
}

export function saveGuestModeProgress(input: {
  mode: GameMode;
  level: number;
  itemIndex: number;
  levelComplete?: boolean;
  stars?: number;
}) {
  const store = readStore();
  const existing = store.progress[input.mode] ?? defaultProgress();
  const stars = { ...existing.levelStars };
  if (input.levelComplete && input.stars !== undefined) {
    stars[String(input.level)] = Math.max(stars[String(input.level)] ?? 0, input.stars);
  }

  const maxLevels = getLevelCount(input.mode);
  let currentLevel = input.level;
  let maxUnlocked = existing.maxUnlocked;
  let itemIndex = input.itemIndex;

  if (input.levelComplete) {
    maxUnlocked = Math.max(maxUnlocked, input.level + 1);
    if (input.level < maxLevels) {
      currentLevel = input.level + 1;
      itemIndex = 0;
    } else {
      currentLevel = maxLevels;
      itemIndex = 0;
    }
  }

  maxUnlocked = Math.min(Math.max(maxUnlocked, currentLevel), maxLevels);

  store.progress[input.mode] = {
    currentLevel,
    maxUnlocked,
    itemIndex,
    levelStars: stars,
  };
  writeStore(store);
  return store.progress[input.mode]!;
}

export function incrementGuestSessionUsage(mode: GameMode) {
  if (isUnlimitedFreeMode(mode)) return;
  const store = readStore();
  if (store.dailyDate !== todayKey()) {
    store.dailySessions = 0;
    store.dailyDate = todayKey();
  }
  store.dailySessions += 1;
  writeStore(store);
}
