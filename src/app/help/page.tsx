import { Card } from "@/components/ui/card";

const faqs = [
  {
    emoji: "🚀",
    q: "如何开始？",
    a: "注册家长账号 → 添加孩子 → 完成首次测评 → 选择游戏模式每日练习 10-15 分钟。",
  },
  {
    emoji: "💎",
    q: "如何开通付费版？",
    a: "目前支持两种方式开通：1）在设置页输入邀请码自动激活；2）如需直接付费购买，请发邮件至 397543632@qq.com，注明您的注册邮箱和想开通的版本，我们会在 24 小时内为您手动开通。",
  },
  {
    emoji: "💌",
    q: "联系我们",
    a: "有任何问题或建议，欢迎发邮件至 397543632@qq.com，我们会尽快回复。",
  },
];

export default function HelpPage() {
  return (
    <div className="relative mx-auto max-w-3xl px-5 py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/2 h-72 w-[500px] -translate-x-1/2 rounded-full bg-grape-200/40 blur-3xl" />
      </div>

      <div className="text-center">
        <div className="mb-2 text-4xl"><span className="candy-wiggle inline-block">💡</span></div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 md:text-4xl">帮助中心</h1>
        <p className="mt-2 text-slate-500">常见问题解答</p>
      </div>

      <div className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.q} className="candy-card">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-slate-900">
              <span className="text-xl">{faq.emoji}</span>
              {faq.q}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
