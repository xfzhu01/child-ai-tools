import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";

const schema = z.object({
  event: z.string(),
  childId: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  try {
    const body = schema.parse(await request.json());
    await trackEvent({
      userId: session?.user?.id,
      childId: body.childId,
      event: body.event,
      props: body.props,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
