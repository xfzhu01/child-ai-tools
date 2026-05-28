import { NextResponse } from "next/server";

/** Liveness probe for Docker — does not require database. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "child-ai-tools" });
}
