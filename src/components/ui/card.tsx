import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-white bg-white/85 p-6 shadow-[0_18px_40px_-22px_rgb(135_92_255/0.4)] ring-1 ring-grape-100/70 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
