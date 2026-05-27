import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import {
  getAllModeProgress,
  getModeProgress,
  saveModeProgress,
} from "@/lib/typing-engine/mode-progress";
import type { GameMode as ContentMode } from "@/lib/typing-engine/level-content";

const patchSchema = z.object({
  mode: z.enum(["ASSESSMENT", "ADVENTURE", "CHAIN", "FOUNDATION", "AI_CUSTOM"]),
  level: z.number().int().min(1),
  itemIndex: z.number().int().min(0),
  levelComplete: z.boolean().optional(),
  stars: z.number().int().min(0).max(5).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ childId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { childId } = await params;
  const child = await prisma.childProfile.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const progress = await getAllModeProgress(childId);
  return NextResponse.json({ progress });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ childId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { childId } = await params;
    const child = await prisma.childProfile.findFirst({
      where: { id: childId, userId: session.user.id },
    });
    if (!child) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = patchSchema.parse(await request.json());
    const updated = await saveModeProgress({
      childId,
      mode: body.mode as ContentMode,
      level: body.level,
      itemIndex: body.itemIndex,
      levelComplete: body.levelComplete,
      stars: body.stars,
    });

    return NextResponse.json({ progress: await getModeProgress(childId, body.mode as ContentMode), row: updated });
  } catch (error) {
    console.error("[progress PATCH]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ childId: string }> },
) {
  return PATCH(request, { params });
}
