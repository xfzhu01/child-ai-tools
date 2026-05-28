import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
