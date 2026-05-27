"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AddChildPanel({ disabled, compact }: { disabled?: boolean; compact?: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", age: 7 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "创建失败");
      return;
    }
    router.refresh();
    setForm({ name: "", age: 7 });
  };

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5",
        disabled && "opacity-70",
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-inner ring-4 ring-indigo-100">
          ✨
        </div>
        <h3 className="mt-4 text-lg font-black text-indigo-900">添加新宝贝</h3>
        <p className="mt-1 text-sm text-slate-500">最多 3 个孩子档案，会自动分配可爱头像</p>
      </div>

      <form onSubmit={submit} className={cn("mt-5 flex flex-1 flex-col space-y-3", compact && "mt-4")}>
        <Input
          placeholder="孩子昵称"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={disabled}
          required
          className="bg-white"
        />
        <div>
          <label className="mb-1 block text-left text-xs font-medium text-slate-500">年龄（6–12 岁）</label>
          <Input
            type="number"
            min={6}
            max={12}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
            disabled={disabled}
            required
            className="bg-white"
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button type="submit" className="mt-auto w-full" disabled={disabled || loading}>
          {disabled ? "已达上限" : loading ? "创建中..." : "添加孩子"}
        </Button>
      </form>
    </article>
  );
}
