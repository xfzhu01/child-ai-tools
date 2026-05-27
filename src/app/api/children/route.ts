import { NextResponse } from "next/server";
import { avatarPresetId } from "@/lib/child-avatar";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(20),
  age: z.number().int().min(6).max(12),
  avatarUrl: z.string().min(1).max(32).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const children = await prisma.childProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(children);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());
    const count = await prisma.childProfile.count({ where: { userId: session.user.id } });
    if (count >= 3) {
      return NextResponse.json({ error: "最多添加 3 个孩子" }, { status: 400 });
    }

    const child = await prisma.childProfile.create({
      data: {
        userId: session.user.id,
        name: body.name,
        age: body.age,
        avatarUrl: body.avatarUrl ?? avatarPresetId(`${session.user.id}-${body.name}-${count}`),
      },
    });
    return NextResponse.json(child);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
