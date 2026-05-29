import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatTone = "grape" | "sun" | "bubble" | "mint" | "aqua" | "coral";

const TONES: Record<StatTone, { wrap: string; value: string; label: string }> = {
  grape: { wrap: "from-grape-50 to-white ring-grape-100", value: "text-grape-700", label: "text-grape-500" },
  sun: { wrap: "from-sun-50 to-white ring-sun-100", value: "text-sun-700", label: "text-sun-600" },
  bubble: { wrap: "from-bubble-50 to-white ring-bubble-100", value: "text-bubble-700", label: "text-bubble-500" },
  mint: { wrap: "from-mint-50 to-white ring-mint-100", value: "text-mint-700", label: "text-mint-600" },
  aqua: { wrap: "from-aqua-50 to-white ring-aqua-100", value: "text-aqua-700", label: "text-aqua-600" },
  coral: { wrap: "from-coral-50 to-white ring-coral-100", value: "text-coral-700", label: "text-coral-600" },
};

export function StatTile({
  icon,
  value,
  label,
  tone = "grape",
  className,
}: {
  icon?: ReactNode;
  value: ReactNode;
  label: ReactNode;
  tone?: StatTone;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      className={cn(
        "rounded-3xl bg-gradient-to-br p-4 ring-1 ring-inset",
        t.wrap,
        className,
      )}
    >
      {icon ? <div className="mb-1 text-2xl">{icon}</div> : null}
      <div className={cn("font-display text-3xl font-extrabold tabular-nums", t.value)}>{value}</div>
      <div className={cn("mt-0.5 text-xs font-semibold", t.label)}>{label}</div>
    </div>
  );
}
