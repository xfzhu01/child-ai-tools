import { Card } from "@/components/ui/card";

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">退款政策</h1>
        <p className="mt-2 text-sm text-slate-500">最后更新：2024 年</p>
      </div>
      <Card className="space-y-4 leading-7 text-slate-700">
        <p>订阅用户可在购买后 7 天内申请无理由退款（未大量使用的账号）。</p>
        <p>邀请码兑换的权益不支持转让。如需退款或有其他问题，请发邮件至{" "}
          <a href="mailto:397543632@qq.com" className="font-bold text-grape-600 hover:text-grape-700">
            397543632@qq.com
          </a>。
        </p>
      </Card>
    </div>
  );
}
