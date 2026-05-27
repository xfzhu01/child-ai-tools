import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { hasAiAccess } from "@/lib/billing/entitlements";
import { buildRecommendation } from "@/lib/ai/recommend";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const childId = new URL(request.url).searchParams.get("childId");
  if (!childId) {
    return NextResponse.json({ error: "childId required" }, { status: 400 });
  }

  const child = await prisma.childProfile.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const aiUnlocked = await hasAiAccess(session.user.id);
  if (!aiUnlocked) {
    return NextResponse.json({ error: "AI 周报需要 AI 智能版" }, { status: 403 });
  }

  const result = await buildRecommendation(child.id);
  const saved = await prisma.aIRecommendation.create({
    data: {
      childId: child.id,
      focusKeys: result.focusKeys,
      summary: result.parentSummary,
      exercises: result.exercises,
      difficulty: result.difficulty,
    },
  });

  return NextResponse.json(saved);
}
