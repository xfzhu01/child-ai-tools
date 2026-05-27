import Link from "next/link";
import type { Session } from "next-auth";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";
import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteHeader({ session }: { session: Session | null }) {
  return (
    <header className="border-b border-indigo-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" aria-label={t("app.name")}>
          <BrandLogo size="md" />
        </Link>
        <nav role="navigation" className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <Link href="/help">{t("nav.help")}</Link>
          {session?.user ? (
            <>
              <Link href="/dashboard">{t("nav.dashboard")}</Link>
              {session.user.isAdmin && <Link href="/admin">管理</Link>}
              <form action={signOutAction}>
                <Button type="submit" variant="ghost">
                  退出
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">{t("nav.login")}</Link>
              <Link href="/register">
                <Button>{t("nav.register")}</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
