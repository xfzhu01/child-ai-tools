import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { auth } from "@/lib/auth";
import { getTryPath } from "@/lib/auth/try-path";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Providers } from "@/components/providers";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "小宝打字 - 小朋友的 AI 高效打字学习工具",
    template: "%s | 小宝打字",
  },
  description:
    "面向 6–12 岁小学生的 AI 高效打字学习工具。游戏化闯关、按键级数据分析、AI 定制练习与家长周报。",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "小宝打字",
    description: "小朋友的 AI 高效打字学习工具",
    type: "website",
    locale: "zh_CN",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const tryHref = await getTryPath(session?.user?.id);

  return (
    <html lang="zh-CN" className={fredoka.variable}>
        <body className="min-h-screen bg-gradient-to-b from-cream-100 via-grape-50 to-bubble-50/50 text-slate-900 antialiased">
        <Providers session={session}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader session={session} tryHref={tryHref} />
            <main className="flex-1">{children}</main>
            <SiteFooter tryHref={tryHref} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
