import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">用户协议</h1>
        <p className="mt-2 text-sm text-slate-500">最后更新：2024 年</p>
      </div>
      <Card className="space-y-4 leading-7 text-slate-700">
        <p>小宝打字面向家长提供儿童打字学习服务。家长应确保孩子合理使用，控制每日练习时长。</p>
        <p>禁止利用本平台进行任何违法或不当行为。AI 生成内容仅供学习参考。</p>
      </Card>
    </div>
  );
}
