"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function parseRegisterError(error: unknown) {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "fieldErrors" in error) {
    const fieldErrors = (error as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {};
    const messages = Object.values(fieldErrors).flat();
    return messages.join("；") || "请检查表单填写";
  }
  return "注册失败";
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", consent: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.consent) {
      setError("请先勾选监护人同意");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          guardianConsent: form.consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(parseRegisterError(data.error));
        return;
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("账号已创建，但自动登录失败，请前往登录页手动登录");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col items-center justify-center px-5">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/2 h-80 w-96 -translate-x-1/2 rounded-full bg-violet-100/60 blur-3xl" />
      </div>

      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900">创建家长账号</h1>
          <p className="mt-2 text-sm text-slate-500">注册后为孩子建档，保存学习进度</p>
        </div>

        <Card className="border-slate-200/60 bg-white/90 p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">昵称</label>
              <Input placeholder="您的昵称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">邮箱</label>
              <Input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">密码</label>
              <Input type="password" placeholder="至少 8 位" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 rounded" required />
              <span>
                我确认是为 13 岁以下儿童创建学习档案的监护人，并已阅读
                <Link href="/legal/privacy" className="font-medium text-indigo-600 hover:text-indigo-700"> 隐私政策</Link>。
              </span>
            </label>
            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "注册中..." : "注册并开始"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          已有账号？
          <Link href="/login" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
