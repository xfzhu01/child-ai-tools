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
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold">家长登录</h1>
        <form action={formAction} className="mt-6 space-y-4">
          <Input type="email" name="email" placeholder="邮箱" required />
          <Input type="password" name="password" placeholder="密码" required />
          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "登录中..." : "登录"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          还没有账号？<Link href="/register" className="text-indigo-600">注册</Link>
        </p>
      </Card>
    </div>
  );
}
