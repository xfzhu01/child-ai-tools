import { t } from "@/lib/i18n";

export function SiteFooter({ tryHref }: { tryHref: string }) {
  return (
    <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {t("app.name")} · {t("app.tagline")}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a href={tryHref} className="transition hover:text-indigo-600">
            立即体验
          </a>
          <a href="/pricing" className="transition hover:text-indigo-600">
            定价
          </a>
          <a href="/legal/privacy" className="transition hover:text-slate-700">
            隐私政策
          </a>
          <a href="/legal/terms" className="transition hover:text-slate-700">
            用户协议
          </a>
          <a href="/legal/refund" className="transition hover:text-slate-700">
            退款政策
          </a>
          <a href="/help" className="transition hover:text-slate-700">
            帮助
          </a>
        </div>
      </div>
    </footer>
  );
}
