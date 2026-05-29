import Link from "next/link";
import { PLANS } from "@/lib/billing/plans";
import { Button } from "@/components/ui/button";

type DailyLimitNoticeProps = {
  childId?: string;
  compact?: boolean;
};

export function DailyLimitNotice({ childId, compact }: DailyLimitNoticeProps) {
  return (
    <div
      className={`rounded-3xl border-2 border-sun-200 bg-sun-50 text-sun-900 shadow-[0_14px_34px_-22px_rgb(251_176_30/0.6)] ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <p className={`font-display font-extrabold ${compact ? "text-sm" : "text-base"}`}>⏰ 今日免费练习次数已用完</p>
      <p className={`mt-2 text-sun-700/90 ${compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"}`}>
        请明天再来继续练习，或升级{" "}
        <span className="font-bold">{PLANS.basic.name}</span>（{PLANS.basic.price}
        {PLANS.basic.priceNote}）解锁全部官方关卡无限练习。
      </p>
      <div className={`flex flex-wrap gap-2 ${compact ? "mt-3" : "mt-4"}`}>
        <Link href="/pricing">
          <Button size={compact ? "default" : "lg"} variant="primary">
            查看升级方案
          </Button>
        </Link>
        <Link href="/settings">
          <Button size={compact ? "default" : "lg"} variant="secondary">
            兑换邀请码
          </Button>
        </Link>
        {childId ? (
          <Link href={`/learn/${childId}`} className="self-center text-sm font-bold text-grape-600 underline-offset-2 hover:underline">
            返回模式选择
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function DailyLimitBlocked({ childId }: { childId: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <DailyLimitNotice childId={childId} />
    </div>
  );
}
