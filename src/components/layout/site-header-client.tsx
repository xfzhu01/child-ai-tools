"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Session } from "next-auth";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

function NavItem({
  href,
  children,
  active,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-2 text-sm font-bold transition-colors",
        active
          ? "bg-grape-100 text-grape-700 ring-1 ring-inset ring-grape-200"
          : "text-slate-600 hover:bg-grape-50 hover:text-grape-700",
      )}
    >
      {children}
    </Link>
  );
}

export function SiteHeaderClient({
  session,
  tryHref,
}: {
  session: Session | null;
  tryHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const logoHref = session?.user ? "/dashboard" : "/";
  const close = () => setOpen(false);
  const tryActive =
    pathname === tryHref || (tryHref.startsWith("/learn/") && pathname.startsWith("/learn/"));

  const publicLinks = [
    { href: "/", label: t("nav.home") },
    { href: tryHref, label: t("nav.try"), active: tryActive },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/help", label: t("nav.help") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-white/70 bg-cream-50/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
        <Link
          href={logoHref}
          aria-label={session?.user ? t("nav.dashboard") : t("app.name")}
          className="shrink-0 rounded-xl transition hover:opacity-90"
        >
          <BrandLogo size="md" />
        </Link>

        <nav
          role="navigation"
          aria-label="主导航"
          className="hidden items-center gap-1 md:flex"
        >
          {publicLinks.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              active={link.active ?? pathname === link.href}
            >
              {link.label}
            </NavItem>
          ))}
          {session?.user ? (
            <>
              <NavItem href="/dashboard" active={pathname.startsWith("/dashboard")}>
                {t("nav.dashboard")}
              </NavItem>
              {session.user.isAdmin ? (
                <NavItem href="/admin" active={pathname.startsWith("/admin")}>
                  {t("nav.admin")}
                </NavItem>
              ) : null}
              <form action={signOutAction} className="ml-1">
                <Button type="submit" variant="ghost" className="text-slate-600">
                  退出
                </Button>
              </form>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l-2 border-grape-100 pl-3">
              <Link href="/login">
                <Button variant="ghost">{t("nav.login")}</Button>
              </Link>
              <Link href="/register">
                <Button>{t("nav.register")}</Button>
              </Link>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-grape-100 bg-white text-grape-700 md:hidden"
          aria-expanded={open}
          aria-label="打开菜单"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">菜单</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t-2 border-grape-100 bg-cream-50 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                active={link.active ?? pathname === link.href}
                onClick={close}
              >
                {link.label}
              </NavItem>
            ))}
            {session?.user ? (
              <>
                <NavItem href="/dashboard" active={pathname.startsWith("/dashboard")} onClick={close}>
                  {t("nav.dashboard")}
                </NavItem>
                {session.user.isAdmin ? (
                  <NavItem href="/admin" active={pathname.startsWith("/admin")} onClick={close}>
                    {t("nav.admin")}
                  </NavItem>
                ) : null}
                <form action={signOutAction} className="pt-2">
                  <Button type="submit" variant="ghost" className="w-full justify-start">
                    退出
                  </Button>
                </form>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t-2 border-grape-100 pt-3">
                <Link href="/login" onClick={close}>
                  <Button variant="secondary" className="w-full">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/register" onClick={close}>
                  <Button className="w-full">{t("nav.register")}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
