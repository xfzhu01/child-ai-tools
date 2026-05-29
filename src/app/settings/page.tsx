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
        ? `${subscription.label} · 无限官方关卡 + AI 定制关 + AI 学习报告 + ${PLANS.ai.bundleBenefit}`
        : `${subscription.label} · 无限官方关卡 + AI 学习报告`;

  return (
    <div className="relative mx-auto max-w-2xl px-5 py-14">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="candy-float absolute -top-24 right-0 h-64 w-80 rounded-full bg-grape-200/40 blur-3xl" />
      </div>

      <h1 className="font-display text-3xl font-extrabold text-slate-900">账号设置</h1>
      <p className="mt-2 text-sm text-slate-500">管理您的账号信息和订阅</p>

      <Card className="mt-8">
        <h2 className="font-display text-base font-extrabold text-slate-900">账号信息</h2>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="text-sm text-slate-500">邮箱</span>
            <span className="text-sm font-bold text-slate-900">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="text-sm text-slate-500">昵称</span>
            <span className="text-sm font-bold text-slate-900">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-grape-50 px-4 py-2.5 ring-1 ring-inset ring-grape-100">
            <span className="text-sm text-grape-600">订阅状态</span>
            <span className="text-sm font-bold text-grape-700">{statusDetail}</span>
          </div>
        </div>
        <Link
          href="/pricing"
          className="mt-4 inline-flex text-sm font-bold text-grape-600 transition hover:text-grape-700"
        >
          查看定价方案 →
        </Link>
      </Card>

      <Card className="mt-5">
        <h2 className="font-display text-base font-extrabold text-slate-900">开通付费版</h2>
        <p className="mt-2 text-sm text-slate-500">
          如有邀请码可直接兑换激活。也可发邮件至{" "}
          <a href="mailto:397543632@qq.com" className="font-bold text-grape-600 hover:text-grape-700">
            397543632@qq.com
          </a>
          {" "}注明注册邮箱和想开通的版本（官方关卡版 ¥19.9/年 或 AI 智能版 ¥49.9/年），24 小时内为您开通。
        </p>
        <RedeemInviteForm />
      </Card>

      <Card className="mt-5">
        <h2 className="font-display text-base font-extrabold text-slate-900">语言</h2>
        <p className="mt-3 text-sm text-slate-600">当前：简体中文（英文预留）</p>
      </Card>
    </div>
  );
}
