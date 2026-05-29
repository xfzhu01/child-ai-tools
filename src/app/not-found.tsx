import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="candy-float absolute left-1/4 top-10 h-40 w-40 rounded-full bg-bubble-200/40 blur-3xl" />
        <div className="candy-float-slow absolute right-1/4 top-32 h-44 w-44 rounded-full bg-grape-200/40 blur-3xl" />
      </div>
      <p className="text-6xl"><span className="candy-wiggle inline-block">🧭</span></p>
      <h1 className="mt-4 font-display text-3xl font-extrabold">哎呀，页面走丢了</h1>
      <p className="mt-2 text-slate-600">像打字时按错键一样，我们帮你回到正轨！</p>
      <Link href="/" className="mt-6">
        <Button variant="child" size="lg">回到首页</Button>
      </Link>
    </div>
  );
}
