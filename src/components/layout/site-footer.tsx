import { t } from "@/lib/i18n";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} {t("app.name")} · {t("app.tagline")}
        </p>
        <div className="flex gap-4">
          <a href="/legal/privacy">隐私政策</a>
          <a href="/legal/terms">用户协议</a>
          <a href="/legal/refund">退款政策</a>
          <a href="/help">帮助</a>
        </div>
      </div>
    </footer>
  );
}
