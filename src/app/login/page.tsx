"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col items-center justify-center px-5">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/2 h-80 w-96 -translate-x-1/2 rounded-full bg-grape-200/50 blur-3xl" />
        <div className="candy-float absolute right-0 top-40 h-40 w-40 rounded-full bg-bubble-200/40 blur-3xl" />
      </div>

      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl"><span className="candy-wiggle inline-block">👋</span></div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">欢迎回来</h1>
          <p className="mt-2 text-sm text-slate-500">登录家长账号管理孩子学习</p>
        </div>

        <Card className="p-8">
          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">邮箱</label>
              <Input type="email" name="email" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">密码</label>
              <Input type="password" name="password" placeholder="输入密码" required />
            </div>
            {state?.error && (
              <p className="rounded-xl bg-coral-50 px-3 py-2 text-sm font-medium text-coral-600">{state.error}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? "登录中..." : "登录"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          还没有账号？
          <Link href="/register" className="ml-1 font-bold text-grape-600 hover:text-grape-700">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
