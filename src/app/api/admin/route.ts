import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  grantAiEntitlement,
  grantBasicEntitlement,
} from "@/lib/billing/entitlements";
import { TIER_AI, TIER_BASIC } from "@/lib/billing/plans";
import { z } from "zod";
import { randomBytes } from "crypto";

const grantSchema = z.object({
  userId: z.string(),
  days: z.number().optional(),
  tier: z.enum([TIER_BASIC, TIER_AI]).default(TIER_AI),
});
const inviteSchema = z.object({
  maxUses: z.number().default(1),
  tier: z.enum([TIER_BASIC, TIER_AI]).default(TIER_AI),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "grant") {
    const body = grantSchema.parse(await request.json());
    if (body.tier === TIER_BASIC) {
      await grantBasicEntitlement(body.userId, body.days ?? 365);
    } else {
      await grantAiEntitlement(body.userId, body.days ?? 365);
    }
    return NextResponse.json({ success: true, tier: body.tier });
  }

  if (action === "invite") {
    const body = inviteSchema.parse(await request.json());
    const code = randomBytes(4).toString("hex").toUpperCase();
    const invite = await prisma.inviteCode.create({
      data: {
        code,
        maxUses: body.maxUses,
        tier: body.tier,
        createdById: session.user.id,
      },
    });
    return NextResponse.json(invite);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true, entitlements: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const invites = await prisma.inviteCode.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ users, invites });
}
