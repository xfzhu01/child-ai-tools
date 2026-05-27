import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card } from "@/components/ui/card";
import { getSubscriptionStatus } from "@/lib/billing/entitlements";
import { PLANS } from "@/lib/billing/plans";
import { RedeemInviteForm } from "@/components/settings/redeem-form";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { entitlements: true, subscriptions: true },
  });
  const subscription = await getSubscriptionStatus(session.user.id);
  const statusDetail =
    subscription.tier === "free"
      ? "免费版 · 每日 3 关"
      : subscription.hasAi
        ? `${subscription.label} · 无限官方关卡 + AI 定制关 + AI 周报 + ${PLANS.ai.bundleBenefit}`
        : `${subscription.label} · 无限练习官方关卡（不含 AI 定制关）`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-black">账号设置</h1>
      <Card className="mt-8">
        <h2 className="font-bold">账号信息</h2>
        <p className="mt-2 text-sm text-slate-600">邮箱：{user?.email}</p>
        <p className="text-sm text-slate-600">昵称：{user?.name}</p>
        <p className="mt-2 text-sm font-medium text-indigo-700">订阅状态：{statusDetail}</p>
        <Link href="/pricing" className="mt-2 inline-block text-sm text-indigo-600">
          查看定价方案 →
        </Link>
      </Card>
      <Card className="mt-6">
        <h2 className="font-bold">内测邀请码兑换</h2>
        <p className="mt-2 text-sm text-slate-500">
          正式支付上线前，可通过管理员发放的邀请码开通官方关卡版（¥19.9）或 AI 智能版（¥49.9）
        </p>
        <RedeemInviteForm />
      </Card>
      <Card className="mt-6">
        <h2 className="font-bold">语言</h2>
        <p className="mt-2 text-sm text-slate-600">当前：简体中文（英文预留）</p>
      </Card>
    </div>
  );
}
