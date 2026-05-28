import Link from "next/link";
import { ModeSelectCard } from "@/components/learn/mode-select-card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { FREE_DAILY_SESSIONS } from "@/lib/billing/free-tier-constants";

const guestModes = [
  {
    id: "FOUNDATION" as const,
    title: t("learn.foundation"),
    desc: "26 个字母按传统指法顺序逐字母刮卡练习 · 完全免费无限练",
    href: "/try/levels/FOUNDATION",
  },
  {
    id: "ASSESSMENT" as const,
    title: t("learn.assessment"),
    desc: "3 关覆盖全键盘基线测评",
    href: "/try/levels/ASSESSMENT",
  },
  {
    id: "ADVENTURE" as const,
    title: t("learn.adventure"),
    desc: "30 关由易到难，每关 10 个单词",
    href: "/try/levels/ADVENTURE",
  },
  {
    id: "CHAIN" as const,
    title: t("learn.chain"),
    desc: "10 关成语拼音接龙由易到难",
    href: "/try/levels/CHAIN",
  },
];

export default function TryPage() {
  return (
    <div className="relative mx-auto max-w-5xl px-5 py-10 md:py-14">
      {/* Fun background decorations */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-16 top-20 h-48 w-48 rounded-full bg-pink-100/40 blur-3xl" />
        <div className="absolute -right-12 top-40 h-56 w-56 rounded-full bg-sky-100/40 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-40 w-40 rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute -top-10 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
          <span className="text-lg">🎯</span>
          <span className="text-sm font-semibold text-slate-600">无需登录 · 立刻开玩</span>
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-800 md:text-5xl">
          选择你的<span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">冒险</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-500">
          零基础指法无限练，其他模式每日 {FREE_DAILY_SESSIONS} 关免费体验
        </p>
      </div>

      {/* Mode cards */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {guestModes.map((mode) => (
          <ModeSelectCard
            key={mode.id}
            mode={mode.id}
            title={mode.title}
            description={mode.desc}
            progressLabel={null}
            href={mode.href}
            startLabel={mode.id === "FOUNDATION" ? "无限畅玩" : "开始体验"}
            showRecommendFoundation={mode.id === "FOUNDATION"}
            showRecommendAssessment={mode.id === "ASSESSMENT"}
          />
        ))}

        <ModeSelectCard
          mode="AI_CUSTOM"
          title={t("learn.aiCustom")}
          description="100 关随机小游戏 + AI 弱项分析 · 需注册并升级 AI 智能版"
          progressLabel={null}
          href="/register"
          locked
          startLabel="注册解锁"
        />
      </div>

      {/* Register prompt */}
      <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/40 p-6 md:p-7">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100/80 text-xl">
              ☁️
            </span>
            <div>
              <p className="font-semibold text-slate-800">想保存进度？</p>
              <p className="mt-0.5 text-sm text-slate-500">注册后数据同步云端，解锁家长报告</p>
            </div>
          </div>
          <Link href="/register">
            <Button size="lg">免费注册</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
