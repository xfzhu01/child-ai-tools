import Link from "next/link";
import { auth } from "@/lib/auth";
import { getStartPath } from "@/lib/auth/start-path";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { AI_PLAN_FEATURES, PLANS } from "@/lib/billing/plans";

export default async function PricingPage() {
  const session = await auth();
  const startPath = getStartPath(!!session?.user);

  const plans = [
    {
      name: t("pricing.free"),
      price: PLANS.free.price,
      features: ["每日 3 关", "字母大冒险 + 词语接龙", "基础进步记录"],
      cta: session?.user ? "进入家长中心" : "免费开始",
      href: startPath,
    },
    {
      name: t("pricing.basic"),
      price: `${PLANS.basic.price}${PLANS.basic.priceNote}`,
      features: [
        "无限练习官方关卡",
        "首次测评 + 字母大冒险 + 词语接龙",
        "全部官卡（不包括AI关卡）",
        "AI 学习报告（家长中心可查看）",
      ],
      cta: "内测兑换",
      href: "/settings",
    },
    {
      name: t("pricing.ai"),
      price: `${PLANS.ai.price}${PLANS.ai.priceNote}`,
      highlight: true,
      features: [...AI_PLAN_FEATURES],
      cta: "内测兑换 AI 版",
      href: "/settings",
    },
    {
      name: t("pricing.bundle"),
      price: "敬请期待",
      features: ["多 AI 工具打包", "更优惠的家庭方案", "统一家长中心", `AI 智能版用户${PLANS.ai.bundleBenefit}`],
      cta: session?.user ? "进入家长中心" : "加入 waitlist",
      href: startPath,
    },
  ];

  return (
    <div className="relative mx-auto max-w-5xl px-5 py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-100/60 via-violet-50/30 to-transparent blur-3xl" />
      </div>

      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
          简单透明定价
        </span>
        <h1 className="mt-5 text-4xl font-black text-slate-900 md:text-5xl">
          选择适合家庭的方案
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-slate-600">
          想提前开通？发送邮件至{" "}
          <a href="mailto:397543632@qq.com" className="font-medium text-indigo-600 hover:text-indigo-700">
            397543632@qq.com
          </a>
          {" "}即可付费激活
        </p>
      </div>

      <div className="mt-14 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.highlight
                ? "relative flex h-full flex-col border-indigo-300 bg-gradient-to-b from-indigo-50/90 to-white/90 shadow-lg shadow-indigo-100/50"
                : "flex h-full flex-col"
            }
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white">
                推荐
              </span>
            )}
            <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
            <p className="mt-2 text-3xl font-black text-indigo-700">{plan.price}</p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full bg-emerald-100 text-center text-[10px] font-bold leading-4 text-emerald-700">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href={plan.href} className="mt-8 block">
              <Button className="w-full" size="lg" variant={plan.highlight ? "primary" : "secondary"}>
                {plan.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-slate-500">{t("pricing.bundleNote")}</p>
    </div>
  );
}
