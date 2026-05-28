import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { buildNextLevel, cacheNextLevel } from "@/lib/ai/next-level";
import { canAccessFeature, canCallAi, incrementAiUsage } from "@/lib/billing/entitlements";
import { checkRateLimit } from "@/lib/analytics";
import { z } from "zod";
const schema = z.object({
  childId: z.string(),
  mode: z.literal("AI_CUSTOM"),
  level: z.number().int().min(1).optional(),
  lastSessionId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(`ai:${session.user.id}`, 30)) {
    return NextResponse.json({ error: "请求过于频繁" }, { status: 429 });
  }

  try {
    const body = schema.parse(await request.json());
    const child = await prisma.childProfile.findFirst({
      where: { id: body.childId, userId: session.user.id },
    });
    if (!child) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowed = await canAccessFeature(session.user.id, "ai_custom");
    if (!allowed) {
      return NextResponse.json({ error: "AI 智能版才能使用 AI 生成关卡" }, { status: 403 });
    }

    if (!(await canCallAi(session.user.id, child.id))) {
      return NextResponse.json({ error: "AI 调用已达上限" }, { status: 403 });
    }

    const result = await buildNextLevel({
      childId: child.id,
      mode: body.mode,
      level: body.level ?? 1,
      lastSessionId: body.lastSessionId,
    });

    await cacheNextLevel(child.id, body.lastSessionId, result);
    await incrementAiUsage(child.id);

    return NextResponse.json({
      ...result,
      exercises: result.items,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}
