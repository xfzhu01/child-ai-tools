import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  guardianConsent: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    if (!body.guardianConsent) {
      return NextResponse.json({ error: "需要监护人同意" }, { status: 400 });
    }

    const email = body.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "邮箱已注册" }, { status: 409 });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        passwordHash: await hashPassword(body.password),
        guardianConsent: true,
        isAdmin: adminEmail === email,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((issue) => issue.message).join("；");
      return NextResponse.json({ error: message || "表单校验失败" }, { status: 400 });
    }
    console.error("register error", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
