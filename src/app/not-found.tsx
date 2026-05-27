import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-4 text-3xl font-black">哎呀，页面走丢了</h1>
      <p className="mt-2 text-slate-600">像打字时按错键一样，我们帮你回到正轨！</p>
      <Link href="/" className="mt-6">
        <Button variant="child">回到首页</Button>
      </Link>
    </div>
  );
}
