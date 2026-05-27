"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscriptionLabel, type SubscriptionTier } from "@/lib/billing/plans";

export function RedeemInviteForm() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/billing/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (res.ok) {
      const tier = data.tier as SubscriptionTier | "pro";
      const label = subscriptionLabel(tier === "pro" ? "ai" : tier);
      setMessage(`兑换成功！已开通 ${label}`);
    } else {
      setMessage(data.error ?? "兑换失败");
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 flex flex-wrap gap-2">
      <Input placeholder="输入邀请码" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
      <Button type="submit">兑换</Button>
      {message && <p className="w-full text-sm text-slate-600">{message}</p>}
    </form>
  );
}
