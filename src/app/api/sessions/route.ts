import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { GameMode } from "@prisma/client";
import { incrementSessionUsage, canStartSession } from "@/lib/billing/entitlements";
import { trackEvent } from "@/lib/analytics";
import { saveModeProgress } from "@/lib/typing-engine/mode-progress";
import type { GameMode as ContentMode } from "@/lib/typing-engine/level-content";
import { getLevelCount } from "@/lib/typing-engine/level-content";

const schema = z.object({
  childId: z.string(),
  mode: z.enum(["ASSESSMENT", "ADVENTURE", "CHAIN", "FOUNDATION", "AI_CUSTOM"]),
  levelNumber: z.number().int().min(1).optional(),
  levelComplete: z.boolean().optional(),
  itemIndex: z.number().int().min(0).optional(),
  wpm: z.number(),
  accuracy: z.number(),
  durationSec: z.number(),
  stars: z.number(),
  comboMax: z.number(),
  rawEvents: z.array(z.any()),
  errorKeys: z.array(z.string()),
  slowKeys: z.array(z.string()),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());
    const child = await prisma.childProfile.findFirst({
      where: { id: body.childId, userId: session.user.id },
    });
    if (!child) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const access = await canStartSession(session.user.id, child.id, body.mode);
    const isLevelComplete = Boolean(body.levelComplete);
    const shouldSaveProgress =
      body.mode !== "AI_CUSTOM" &&
      body.levelNumber &&
      (isLevelComplete || body.itemIndex !== undefined);

    if (shouldSaveProgress) {
      await saveModeProgress({
        childId: child.id,
        mode: body.mode as ContentMode,
        level: body.levelNumber!,
        itemIndex: body.itemIndex ?? 0,
        levelComplete: body.levelComplete,
        stars: body.stars,
      });
    }

    if (body.mode !== "FOUNDATION" && !access.allowed && !isLevelComplete) {
      return NextResponse.json(
        {
          error: "今日免费练习次数已用完，请明天再来，或升级官方关卡版解锁无限练习",
          code: "DAILY_LIMIT",
        },
        { status: 403 },
      );
    }

    if (body.mode !== "FOUNDATION" && !access.allowed && isLevelComplete) {
      await trackEvent({
        userId: session.user.id,
        childId: child.id,
        event: "session_complete",
        props: { mode: body.mode, stars: body.stars, progressOnly: true },
      });
      return NextResponse.json({ saved: true, progressOnly: true });
    }

    const typingSession = await prisma.$transaction(async (tx) => {
      const created = await tx.typingSession.create({
        data: {
          childId: child.id,
          mode: body.mode as GameMode,
          levelNumber: body.levelNumber,
          wpm: body.wpm,
          accuracy: body.accuracy,
          durationSec: body.durationSec,
          stars: body.stars,
          comboMax: body.comboMax,
          rawEvents: body.rawEvents,
          errorKeys: body.errorKeys,
          slowKeys: body.slowKeys,
        },
      });

      await tx.childProfile.update({
        where: { id: child.id },
        data: {
          xp: { increment: body.stars * 10 },
          lastPlayedAt: new Date(),
          assessmentDone:
            body.mode === "ASSESSMENT" &&
            body.levelComplete &&
            (body.levelNumber ?? 1) >= getLevelCount("ASSESSMENT")
              ? true
              : child.assessmentDone,
          currentLevel: Math.max(
            child.currentLevel,
            body.mode === "ADVENTURE" && body.levelComplete && body.levelNumber
              ? body.levelNumber + 1
              : child.currentLevel,
          ),
        },
      });

      if (body.stars >= 3) {
        await tx.achievement.upsert({
          where: { childId_type: { childId: child.id, type: "three_star" } },
          create: { childId: child.id, type: "three_star" },
          update: {},
        });
      }

      return created;
    });

    await incrementSessionUsage(child.id, body.mode);
    await trackEvent({
      userId: session.user.id,
      childId: child.id,
      event: "session_complete",
      props: { mode: body.mode, stars: body.stars },
    });

    return NextResponse.json(typingSession);
  } catch (error) {
    console.error("[sessions POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
