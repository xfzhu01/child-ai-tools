import { Card } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-black">帮助中心</h1>
      <Card className="mt-8 space-y-4">
        <div>
          <h2 className="font-bold">如何开始？</h2>
          <p className="mt-2 text-slate-600">注册家长账号 → 添加孩子 → 完成首次测评 → 选择游戏模式每日练习 10-15 分钟。</p>
        </div>
        <div>
          <h2 className="font-bold">如何开通付费版？</h2>
          <p className="mt-2 text-slate-600">
            官方关卡版 ¥19.9/年解锁全部官方关卡无限练习；AI 智能版 ¥49.9/年额外包含 AI 定制关、家长周报，以及日后成长包免费获取。
            内测阶段请在设置页输入管理员发放的邀请码，正式版将支持微信/支付宝订阅。
          </p>
        </div>
        <div>
          <h2 className="font-bold">联系客服</h2>
          <p className="mt-2 text-slate-600">邮箱：support@example.com（请替换为您的客服邮箱）</p>
        </div>
      </Card>
    </div>
  );
}
