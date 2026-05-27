"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportChartPoint } from "@/lib/typing-engine/child-report";

export function ReportTrendChart({ data }: { data: ReportChartPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">暂无练习数据，完成首次练习后将生成趋势图。</p>;
  }

  return (
    <div className="h-72 w-full min-h-0 min-w-0">
      <ResponsiveContainer width="100%" height={288} minWidth={0}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            yAxisId="accuracy"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            width={42}
          />
          <YAxis
            yAxisId="wpm"
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px rgb(15 23 42 / 0.08)",
            }}
            labelFormatter={(_, payload) => {
              const point = payload?.[0]?.payload as ReportChartPoint | undefined;
              return point ? `练习 ${point.date.replace("#", "")} · ${point.label}` : "";
            }}
            formatter={(value, name) => {
              if (name === "accuracy") return [`${value}%`, "准确率"];
              if (name === "wpm") return [`${value}`, "净速度 WPM"];
              return [value, name];
            }}
          />
          <Legend
            verticalAlign="top"
            height={28}
            formatter={(value) => (value === "accuracy" ? "准确率 (%)" : "净速度 (WPM)")}
          />
          <Line
            yAxisId="accuracy"
            type="monotone"
            dataKey="accuracy"
            stroke="#4f46e5"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, fill: "#eef2ff" }}
            activeDot={{ r: 5 }}
            name="accuracy"
          />
          <Line
            yAxisId="wpm"
            type="monotone"
            dataKey="wpm"
            stroke="#ea580c"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, fill: "#fff7ed" }}
            activeDot={{ r: 5 }}
            name="wpm"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KeyboardHeatmap({
  entries,
}: {
  entries: { key: string; errorRate: number; hasData: boolean }[];
}) {
  const max = Math.max(...entries.filter((item) => item.hasData).map((item) => item.errorRate), 0.01);
  const rows = [
    entries.filter((item) => "qwertyuiop".includes(item.key)),
    entries.filter((item) => "asdfghjkl".includes(item.key)),
    entries.filter((item) => "zxcvbnm".includes(item.key)),
  ];

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex justify-center gap-1.5"
          style={{ paddingLeft: rowIndex === 1 ? "1.1rem" : rowIndex === 2 ? "2.2rem" : 0 }}
        >
          {row.map((item) => {
            const intensity = item.hasData ? 0.25 + (item.errorRate / max) * 0.75 : 0;
            return (
              <div
                key={item.key}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold uppercase shadow-sm"
                style={{
                  backgroundColor: item.hasData
                    ? `rgba(239, 68, 68, ${intensity})`
                    : "rgb(241 245 249)",
                  color: item.hasData && intensity > 0.55 ? "#fff" : "#334155",
                }}
                title={
                  item.hasData
                    ? `${item.key.toUpperCase()} · 错误率 ${Math.round(item.errorRate * 100)}%`
                    : `${item.key.toUpperCase()} · 样本不足`
                }
              >
                {item.key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  footnote,
}: {
  label: string;
  value: string;
  hint?: string;
  footnote?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-sm font-medium text-indigo-700">{hint}</p> : null}
      {footnote ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{footnote}</p> : null}
    </div>
  );
}

export function ReportMetricGrid({
  metrics,
}: {
  metrics: {
    avgAccuracy: number;
    medianAccuracy: number;
    avgWpm: number;
    wpmTarget: number;
    wpmVsTargetPct: number;
    totalPracticeMin: number;
    sessionCount: number;
    avgComboMax: number;
    consistencyScore: number;
    streakDays: number;
    ageBand: string;
    accuracyTrend: string;
    wpmTrend: string;
    accuracyTrendTone: string;
    wpmTrendTone: string;
  };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="准确率 Accuracy"
        value={`${metrics.avgAccuracy}%`}
        hint={`中位数 ${metrics.medianAccuracy}% · ${metrics.accuracyTrend}`}
        footnote="正确按键数 ÷ 总按键数。反映输入正确性，建议优先保持在 90% 以上。"
      />
      <MetricCard
        label="净速度 Net WPM"
        value={`${metrics.avgWpm}`}
        hint={`同龄目标 ${metrics.wpmTarget} WPM · 达成 ${metrics.wpmVsTargetPct}% · ${metrics.wpmTrend}`}
        footnote="WPM = 正确字符数 ÷ 5 ÷ 分钟。打字教学常用净速度指标，不含错误回退时间。"
      />
      <MetricCard
        label="有效练习时长"
        value={`${metrics.totalPracticeMin} 分钟`}
        hint={`${metrics.sessionCount} 次有效 session`}
        footnote="累计有效练习时长，反映投入量。短频次、高质量练习优于一次过长练习。"
      />
      <MetricCard
        label="稳定性 Consistency"
        value={`${metrics.consistencyScore} / 100`}
        hint={`最高连击均值 ${metrics.avgComboMax} · 连续 ${metrics.streakDays} 天`}
        footnote={`${metrics.ageBand} 岁档表现波动越小，稳定性分越高。连击反映节奏保持能力。`}
      />
      <div className="sm:col-span-2 xl:col-span-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${metrics.accuracyTrendTone}`}>
          准确率趋势 · {metrics.accuracyTrend}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${metrics.wpmTrendTone}`}>
          速度趋势 · {metrics.wpmTrend}
        </span>
      </div>
    </div>
  );
}

export function WeakKeysTable({
  rows,
}: {
  rows: { key: string; errorRate: number; avgLatencyMs: number; count: number }[];
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">完成更多练习后，将基于足够样本量（≥3 次按键）生成键位诊断。</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4 font-semibold">键位</th>
            <th className="py-2 pr-4 font-semibold">错误率</th>
            <th className="py-2 pr-4 font-semibold">平均延迟</th>
            <th className="py-2 font-semibold">样本量</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-100 last:border-0">
              <td className="py-3 pr-4 font-bold uppercase text-slate-800">{row.key}</td>
              <td className="py-3 pr-4 text-rose-700">{Math.round(row.errorRate * 100)}%</td>
              <td className="py-3 pr-4 text-slate-700">{Math.round(row.avgLatencyMs)} ms</td>
              <td className="py-3 text-slate-600">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ModeProgressPanel({
  rows,
}: {
  rows: { title: string; summary: string; percent: number; complete: boolean }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.title} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-slate-800">{row.title}</p>
            <span className="text-xs font-semibold text-indigo-700">
              {row.complete ? "已完成" : `${row.percent}%`}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{row.summary}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
              style={{ width: `${row.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
