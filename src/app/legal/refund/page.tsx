import { Card } from "@/components/ui/card";

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-black">退款政策</h1>
      <Card className="mt-8 space-y-4 text-slate-700 leading-7">
        <p>正式付费上线后，订阅用户可在购买后 7 天内申请无理由退款（未大量使用的账号）。</p>
        <p>内测邀请码兑换的权益不支持转让。如有问题请联系客服。</p>
      </Card>
    </div>
  );
}
