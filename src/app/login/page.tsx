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
        <div className="absolute -top-24 left-1/2 h-80 w-96 -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900">欢迎回来</h1>
          <p className="mt-2 text-sm text-slate-500">登录家长账号管理孩子学习</p>
        </div>

        <Card className="border-slate-200/60 bg-white/90 p-8">
          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">邮箱</label>
              <Input type="email" name="email" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">密码</label>
              <Input type="password" name="password" placeholder="输入密码" required />
            </div>
            {state?.error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? "登录中..." : "登录"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          还没有账号？
          <Link href="/register" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
