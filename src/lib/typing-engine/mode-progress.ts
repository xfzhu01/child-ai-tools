import type { GameMode as ContentMode } from "@/lib/typing-engine/level-content";
import { getLevelCount } from "@/lib/typing-engine/level-content";
import prisma from "@/lib/db";
import { GameMode, type ModeProgress } from "@prisma/client";

export type ModeProgressSnapshot = {
  currentLevel: number;
  maxUnlocked: number;
  itemIndex: number;
  levelStars: Record<string, number>;
};

export function parseLevelStars(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number") out[key] = value;
  }
  return out;
}

export function toSnapshot(row: ModeProgress): ModeProgressSnapshot {
  return {
    currentLevel: row.currentLevel,
    maxUnlocked: row.maxUnlocked,
    itemIndex: row.itemIndex,
    levelStars: parseLevelStars(row.levelStars),
  };
}

export async function getModeProgress(childId: string, mode: ContentMode) {
  const row = await prisma.modeProgress.findUnique({
    where: { childId_mode: { childId, mode } },
  });
  if (row) return toSnapshot(row);
  return {
    currentLevel: 1,
    maxUnlocked: 1,
    itemIndex: 0,
    levelStars: {},
  } satisfies ModeProgressSnapshot;
}

export async function getAllModeProgress(childId: string) {
  const rows = await prisma.modeProgress.findMany({ where: { childId } });
  const modes: ContentMode[] = ["ASSESSMENT", "ADVENTURE", "CHAIN", "FOUNDATION"];
  const map: Partial<Record<ContentMode, ModeProgressSnapshot>> = {};
  for (const mode of modes) {
    const row = rows.find((r) => r.mode === mode);
    map[mode] = row ? toSnapshot(row) : {
      currentLevel: 1,
      maxUnlocked: 1,
      itemIndex: 0,
      levelStars: {},
    };
  }
  return map;
}

type SaveProgressInput = {
  childId: string;
  mode: ContentMode;
  level: number;
  itemIndex: number;
  levelComplete?: boolean;
  stars?: number;
};

export async function saveModeProgress(input: SaveProgressInput) {
  const prismaMode = input.mode as GameMode;
  const maxLevels = getLevelCount(input.mode);
  const existing = await prisma.modeProgress.findUnique({
    where: { childId_mode: { childId: input.childId, mode: prismaMode } },
  });
  const stars = parseLevelStars(existing?.levelStars);
  if (input.levelComplete && input.stars !== undefined) {
    const prev = stars[String(input.level)] ?? 0;
    stars[String(input.level)] = Math.max(prev, input.stars);
  }

  let currentLevel = input.level;
  let maxUnlocked = existing?.maxUnlocked ?? 1;
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

  return prisma.modeProgress.upsert({
    where: { childId_mode: { childId: input.childId, mode: prismaMode } },
    create: {
      childId: input.childId,
      mode: prismaMode,
      currentLevel,
      maxUnlocked,
      itemIndex,
      levelStars: stars,
    },
    update: {
      currentLevel,
      maxUnlocked,
      itemIndex,
      levelStars: stars,
    },
  });
}

export function isLevelUnlocked(
  progress: ModeProgressSnapshot,
  level: number,
): boolean {
  return level <= progress.maxUnlocked;
}
