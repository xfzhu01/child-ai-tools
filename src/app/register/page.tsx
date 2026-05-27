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
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold">创建家长账号</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input placeholder="您的昵称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input type="email" placeholder="邮箱" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type="password" placeholder="密码（至少 8 位）" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1" required />
            我确认是为 13 岁以下儿童创建学习档案的监护人，并已阅读
            <Link href="/legal/privacy" className="text-indigo-600 underline">隐私政策</Link>。
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "注册中..." : "注册并开始"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          已有账号？<Link href="/login" className="text-indigo-600">登录</Link>
        </p>
      </Card>
    </div>
  );
}
