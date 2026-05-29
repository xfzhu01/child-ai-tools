"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tier = "basic" | "ai";

export default function AdminPage() {
  const [data, setData] = useState<{ users: { id: string; email: string; name: string | null }[]; invites: { code: string; tier: string }[] } | null>(null);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantTier, setGrantTier] = useState<Tier>("ai");
  const [inviteTier, setInviteTier] = useState<Tier>("ai");
  const [message, setMessage] = useState("");

  const load = () => fetch("/api/admin").then((r) => r.json()).then(setData);
  useEffect(() => { load(); }, []);

  const grant = async () => {
    const res = await fetch("/api/admin?action=grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: grantUserId, tier: grantTier }),
    });
    setMessage(res.ok ? `已开通 ${grantTier === "ai" ? "AI 智能版" : "官方关卡版"}` : "失败");
    load();
  };

  const createInvite = async () => {
    const res = await fetch("/api/admin?action=invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxUses: 1, tier: inviteTier }),
    });
    const invite = await res.json();
    setMessage(`新邀请码：${invite.code}（${inviteTier === "ai" ? "AI 智能版" : "官方关卡版"}）`);
    load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">管理后台</h1>
      <Card className="mt-8">
        <h2 className="font-bold">手动开通订阅</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input placeholder="用户 ID" value={grantUserId} onChange={(e) => setGrantUserId(e.target.value)} />
          <select
            className="rounded-xl border-2 border-grape-100 px-3 text-sm"
            value={grantTier}
            onChange={(e) => setGrantTier(e.target.value as Tier)}
          >
            <option value="basic">官方关卡版 ¥19.9</option>
            <option value="ai">AI 智能版 ¥49.9</option>
          </select>
          <Button onClick={grant}>开通</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            className="rounded-xl border-2 border-grape-100 px-3 text-sm"
            value={inviteTier}
            onChange={(e) => setInviteTier(e.target.value as Tier)}
          >
            <option value="basic">官方关卡版邀请码</option>
            <option value="ai">AI 智能版邀请码</option>
          </select>
          <Button variant="secondary" onClick={createInvite}>生成邀请码</Button>
        </div>
        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </Card>
      <Card className="mt-6">
        <h2 className="font-bold">最近用户</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {data?.users.map((u) => (
            <li key={u.id} className="rounded-lg bg-slate-50 p-2">
              {u.name} · {u.email} · <code className="text-xs">{u.id}</code>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="mt-6">
        <h2 className="font-bold">邀请码</h2>
        <ul className="mt-4 space-y-1 font-mono text-sm">
          {data?.invites.map((i) => (
            <li key={i.code}>
              {i.code} · {i.tier === "basic" ? "官方关卡版" : "AI 智能版"}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
