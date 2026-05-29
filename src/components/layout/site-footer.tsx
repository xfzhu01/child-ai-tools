import { t } from "@/lib/i18n";

export function SiteFooter({ tryHref }: { tryHref: string }) {
  return (
    <footer className="border-t-2 border-white/70 bg-cream-50/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-7 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p className="font-medium">
          © {new Date().getFullYear()} {t("app.name")} · {t("app.tagline")}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
          <a href={tryHref} className="transition hover:text-grape-600">
            立即体验
          </a>
          <a href="/pricing" className="transition hover:text-grape-600">
            定价
          </a>
          <a href="/legal/privacy" className="transition hover:text-grape-600">
            隐私政策
          </a>
          <a href="/legal/terms" className="transition hover:text-grape-600">
            用户协议
          </a>
          <a href="/legal/refund" className="transition hover:text-grape-600">
            退款政策
          </a>
          <a href="/help" className="transition hover:text-grape-600">
            帮助
          </a>
        </div>
      </div>
    </footer>
  );
}
