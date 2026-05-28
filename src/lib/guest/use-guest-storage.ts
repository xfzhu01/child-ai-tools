"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import {
  FREE_DAILY_SESSIONS,
  isUnlimitedFreeMode,
} from "@/lib/billing/free-tier-constants";
import type { GameMode } from "@/lib/typing-engine/level-content";
import type { ModeProgressSnapshot } from "@/lib/typing-engine/mode-progress";
import { readGuestStore, type GuestStore } from "@/lib/guest/guest-storage";

const SERVER_SNAPSHOT: GuestStore = { progress: {}, dailySessions: 0, dailyDate: "" };
const EMPTY_PROGRESS: ModeProgressSnapshot = {
  currentLevel: 1,
  maxUnlocked: 1,
  itemIndex: 0,
  levelStars: {},
};
const UNLIMITED_ACCESS = { allowed: true, remaining: Infinity };

let cachedSerialized = "";
let cachedSnapshot: GuestStore = SERVER_SNAPSHOT;

function getGuestStoreSnapshot(): GuestStore {
  const next = readGuestStore();
  const serialized = JSON.stringify(next);
  if (serialized === cachedSerialized) {
    return cachedSnapshot;
  }
  cachedSerialized = serialized;
  cachedSnapshot = next;
  return cachedSnapshot;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("xiaobao-guest-update", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("xiaobao-guest-update", handler);
  };
}

export function useGuestStore() {
  return useSyncExternalStore(subscribe, getGuestStoreSnapshot, () => SERVER_SNAPSHOT);
}

export function useGuestProgress(mode: GameMode) {
  const store = useGuestStore();
  return store.progress[mode] ?? EMPTY_PROGRESS;
}

export function useGuestSessionAccess(mode?: GameMode) {
  const store = useGuestStore();
  return useMemo(() => {
    if (mode && isUnlimitedFreeMode(mode)) {
      return UNLIMITED_ACCESS;
    }
    const remaining = Math.max(0, FREE_DAILY_SESSIONS - store.dailySessions);
    return { allowed: remaining > 0, remaining };
  }, [mode, store.dailySessions]);
}

export function useAllGuestProgress() {
  const store = useGuestStore();
  return store.progress;
}
