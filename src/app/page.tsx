import Link from "next/link";
import { auth } from "@/lib/auth";
import { getStartPath } from "@/lib/auth/start-path";
import { getTryPath } from "@/lib/auth/try-path";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { FREE_DAILY_SESSIONS } from "@/lib/billing/free-tier-constants";

const features = [
  {
    title: t("landing.feature1Title"),
    desc: t("landing.feature1Desc"),
    icon: "🎯",
    wrap: "from-grape-50 to-white ring-grape-100",
    iconBg: "bg-grape-100",
  },
  {
    title: t("landing.feature2Title"),
    desc: t("landing.feature2Desc"),
    icon: "🚀",
    wrap: "from-bubble-50 to-white ring-bubble-100",
    iconBg: "bg-bubble-100",
  },
  {
    title: t("landing.feature3Title"),
    desc: t("landing.feature3Desc"),
    icon: "📊",
    wrap: "from-mint-50 to-white ring-mint-100",
    iconBg: "bg-mint-100",
  },
];

const steps = [
  { label: t("landing.step1"), desc: t("landing.step1Desc") },
  { label: t("landing.step2"), desc: t("landing.step2Desc") },
  { label: t("landing.step3"), desc: t("landing.step3Desc") },
];

export default async function HomePage() {
  const session = await auth();
  const startPath = getStartPath(!!session?.user);
  const tryHref = await getTryPath(session?.user?.id);
  const startLabel = session?.user ? "进入家长中心" : t("landing.cta");
  const tryHint = session?.user
    ? t("landing.tryHintLoggedIn")
    : `${t("landing.tryHint")} · 其他模式每日 ${FREE_DAILY_SESSIONS} 关`;

  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-7.5rem)] max-w-5xl flex-col justify-between px-5 py-8 md:py-10">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-b from-grape-200/60 via-bubble-100/40 to-transparent blur-3xl" />
        <div className="candy-float absolute -right-16 top-40 h-56 w-56 rounded-full bg-sun-200/50 blur-3xl" />
        <div className="candy-float-slow absolute -left-16 top-64 h-52 w-52 rounded-full bg-mint-200/40 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="pt-8 text-center md:pt-10">
        <span className="candy-pop-in inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white/80 px-4 py-1.5 text-xs font-bold text-grape-700 shadow-sm ring-1 ring-grape-100">
          <span className="candy-wiggle">🎈</span>
          {t("landing.heroBadge")}
        </span>

        <h1 className="candy-pop-in mt-5 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mt-2 font-display text-2xl font-extrabold md:text-3xl">
          <span className="candy-text-rainbow">{t("landing.heroTitleAccent")}</span>
        </p>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
          {t("landing.heroSubtitle")}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href={tryHref}>
            <Button variant="child" size="xl">
              <span className="candy-wiggle mr-1">🎮</span>
              {t("landing.tryCta")}
            </Button>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={startPath}
              className="font-bold text-grape-700 transition hover:text-grape-900"
            >
              {startLabel} →
            </Link>
            <span className="h-4 w-0.5 rounded-full bg-grape-200" />
            <Link
              href="/pricing"
              className="font-semibold text-slate-500 transition hover:text-grape-700"
            >
              查看定价
            </Link>
          </div>
          <p className="text-xs text-slate-500">{tryHint}</p>
        </div>
      </section>

      {/* Features */}
      <section className="mt-12 md:mt-14">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((item) => (
            <div
              key={item.title}
              className={`candy-card group rounded-3xl bg-gradient-to-br p-5 ring-1 ring-inset ${item.wrap}`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${item.iconBg}`}
              >
                {item.icon}
              </span>
              <h2 className="mt-3 font-display text-lg font-extrabold text-slate-800">
                {item.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mt-5 md:mt-7">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-grape-500 via-grape-600 to-bubble-500 px-6 py-6 shadow-candy md:px-8">
          <div className="candy-float pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <p className="mb-4 text-center font-display text-sm font-extrabold uppercase tracking-widest text-white/80">
            ✨ 三步上手
          </p>
          <div className="relative grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="flex items-start gap-3 rounded-2xl bg-white/15 px-4 py-3.5 ring-1 ring-inset ring-white/20 backdrop-blur-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-sun-300 to-sun-500 font-display text-sm font-extrabold text-amber-950 shadow-sm">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-white">{step.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-white/85">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
