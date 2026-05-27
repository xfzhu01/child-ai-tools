import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-black">用户协议</h1>
      <Card className="mt-8 space-y-4 text-slate-700 leading-7">
        <p>小宝打字面向家长提供儿童打字学习服务。家长应确保孩子合理使用，控制每日练习时长。</p>
        <p>禁止利用本平台进行任何违法或不当行为。AI 生成内容仅供学习参考。</p>
      </Card>
    </div>
  );
}
