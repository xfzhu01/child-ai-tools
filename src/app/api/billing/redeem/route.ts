import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redeemInviteCode } from "@/lib/billing/entitlements";
import { z } from "zod";

const schema = z.object({ code: z.string().min(4) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());
    const tier = await redeemInviteCode(session.user.id, body.code.trim().toUpperCase());
    return NextResponse.json({ success: true, tier });
  } catch (error) {
    const message = error instanceof Error ? error.message : "兑换失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
