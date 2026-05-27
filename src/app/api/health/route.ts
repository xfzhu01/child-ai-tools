import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, service: "child-ai-tools", db: "connected" });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.includes("Can't reach database")
          ? "数据库未连接，请先运行 docker compose up -d"
          : error.message || "数据库连接失败"
        : "db error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const event = await prisma.analyticsEvent.create({
      data: { event: "healthcheck_write", props: { ts: Date.now() } },
    });
    return NextResponse.json({ ok: true, id: event.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "write error" },
      { status: 500 },
    );
  }
}
