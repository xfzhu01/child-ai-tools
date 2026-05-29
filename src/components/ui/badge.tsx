import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeTone = "grape" | "sun" | "bubble" | "mint" | "aqua" | "coral" | "slate";

const TONES: Record<BadgeTone, string> = {
  grape: "bg-grape-100 text-grape-700 ring-grape-200",
  sun: "bg-sun-100 text-sun-700 ring-sun-200",
  bubble: "bg-bubble-100 text-bubble-700 ring-bubble-200",
  mint: "bg-mint-100 text-mint-700 ring-mint-200",
  aqua: "bg-aqua-100 text-aqua-700 ring-aqua-200",
  coral: "bg-coral-100 text-coral-700 ring-coral-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function Badge({
  className,
  tone = "grape",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
