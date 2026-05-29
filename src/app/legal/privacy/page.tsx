import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">隐私政策</h1>
        <p className="mt-2 text-sm text-slate-500">最后更新：2024 年</p>
      </div>
      <Card className="space-y-4 leading-7 text-slate-700">
        <p>我们遵循数据最小化原则，仅收集家长账号邮箱、孩子昵称与年龄，不收集儿童真实姓名。</p>
        <p>打字练习数据用于生成个性化推荐与家长报告，不会在公开场景展示。</p>
        <p>13 岁以下儿童档案创建需监护人同意。您可申请导出或删除相关数据。</p>
        <p>内测阶段数据可能存储于海外数据库（Neon），正式国内运营前将迁移至国内节点并完成合规评估。</p>
      </Card>
    </div>
  );
}
