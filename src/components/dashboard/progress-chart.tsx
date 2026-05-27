"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Point = { date: string; accuracy: number; wpm: number };

export function ProgressChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">暂无练习数据，快去开始第一关吧！</p>;
  }

  return (
    <div className="h-64 w-full min-h-0 min-w-0">
      <ResponsiveContainer width="100%" height={256} minWidth={0}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="accuracy" stroke="#6366f1" name="准确率" />
          <Line type="monotone" dataKey="wpm" stroke="#f59e0b" name="WPM" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KeyHeatmap({ keys }: { keys: { key: string; value: number }[] }) {
  const max = Math.max(...keys.map((k) => k.value), 1);
  return (
    <div className="grid grid-cols-10 gap-2">
      {keys.map((item) => (
        <div
          key={item.key}
          className="flex aspect-square items-center justify-center rounded-xl text-sm font-bold uppercase text-white"
          style={{
            backgroundColor: `rgba(239, 68, 68, ${0.2 + (item.value / max) * 0.8})`,
          }}
          title={`${item.key}: ${Math.round(item.value * 100)}% 错误率`}
        >
          {item.key}
        </div>
      ))}
    </div>
  );
}
