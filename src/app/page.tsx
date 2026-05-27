import Link from "next/link";
import { auth } from "@/lib/auth";
import { getStartPath } from "@/lib/auth/start-path";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { BrandLogo } from "@/components/brand/brand-logo";

export default async function HomePage() {
  const session = await auth();
  const startPath = getStartPath(!!session?.user);
  const startLabel = session?.user ? "进入家长中心" : t("landing.cta");

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <div className="flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-indigo-600">
          {t("app.tagline")}
        </p>
        <h1 className="mt-4 text-4xl font-black text-slate-900 md:text-6xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">{t("landing.heroSubtitle")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href={startPath}>
            <Button variant="child" size="lg">
              {startLabel}
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="secondary" size="lg">
              查看定价
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 md:grid-cols-3">
        {[
          { title: t("landing.feature1Title"), desc: t("landing.feature1Desc") },
          { title: t("landing.feature2Title"), desc: t("landing.feature2Desc") },
          { title: t("landing.feature3Title"), desc: t("landing.feature3Desc") },
        ].map((item) => (
          <Card key={item.title} className="bg-white/80">
            <h3 className="text-xl font-bold text-indigo-700">{item.title}</h3>
            <p className="mt-3 text-slate-600">{item.desc}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Card>
          <h2 className="text-2xl font-bold">我们 vs 免费打字网站</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">能力</th>
                  <th className="py-2">免费打字站</th>
                  <th className="py-2 text-indigo-700">小宝打字</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["年龄设计", "泛年龄/无分层", "6–12 岁精准分层"],
                  ["AI 个性化", "热力图/固定课", "按键级 + LLM 定制关"],
                  ["家长报告", "弱/无", "趋势 + 热力图 + AI 周报"],
                  ["付费模式", "免费/校培", "¥19.9 官方关卡 + ¥49.9 AI 版"],
                ].map(([a, b, c]) => (
                  <tr key={a} className="border-b border-slate-100">
                    <td className="py-3 font-medium">{a}</td>
                    <td className="py-3 text-slate-500">{b}</td>
                    <td className="py-3 font-semibold text-indigo-700">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
