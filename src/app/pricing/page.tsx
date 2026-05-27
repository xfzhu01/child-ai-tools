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
        "全部 43 关由易到难",
        "不含 AI 定制关",
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
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-center text-4xl font-black">选择适合家庭的方案</h1>
      <p className="mt-4 text-center text-slate-600">
        官方关卡 ¥19.9/年 · AI 智能版 ¥49.9/年 · 正式支付上线前可通过邀请码兑换
      </p>
      <div className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.highlight
                ? "flex h-full flex-col border-indigo-400 bg-indigo-50 shadow-lg shadow-indigo-100"
                : "flex h-full flex-col"
            }
          >
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <p className="mt-2 text-3xl font-black text-indigo-700">{plan.price}</p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f}>✓ {f}</li>
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
      <p className="mt-8 text-center text-sm text-slate-500">{t("pricing.bundleNote")}</p>
    </div>
  );
}
