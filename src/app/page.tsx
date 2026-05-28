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
  },
  {
    title: t("landing.feature2Title"),
    desc: t("landing.feature2Desc"),
    icon: "🚀",
  },
  {
    title: t("landing.feature3Title"),
    desc: t("landing.feature3Desc"),
    icon: "📊",
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
        <div className="absolute -top-32 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-100/70 via-violet-50/40 to-transparent blur-3xl" />
        <div className="absolute -right-20 top-48 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="pt-8 text-center md:pt-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {t("landing.heroBadge")}
        </span>

        <h1 className="mt-5 text-5xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mt-2 text-xl font-medium text-indigo-600/90 md:text-2xl">
          {t("landing.heroTitleAccent")}
        </p>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
          {t("landing.heroSubtitle")}
        </p>

        <div className="mt-7 flex flex-col items-center gap-2.5">
          <Link href={tryHref}>
            <Button
              variant="child"
              size="lg"
              className="min-h-12 min-w-[12rem] rounded-full px-10 text-base shadow-xl shadow-amber-300/40 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              {t("landing.tryCta")}
            </Button>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={startPath}
              className="font-semibold text-indigo-700 transition hover:text-indigo-900"
            >
              {startLabel} →
            </Link>
            <span className="h-4 w-px bg-slate-300" />
            <Link
              href="/pricing"
              className="font-medium text-slate-500 transition hover:text-indigo-700"
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
              className="group rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-5 shadow-sm backdrop-blur-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <span className="text-2xl">{item.icon}</span>
              <h2 className="mt-3 text-base font-bold text-slate-900">
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
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 md:px-8">
          <p className="mb-3.5 text-center text-xs font-bold uppercase tracking-widest text-indigo-200">
            三步上手
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="flex items-start gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-amber-950 shadow-sm">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{step.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-indigo-100/90">
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
