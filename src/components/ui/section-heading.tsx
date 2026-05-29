import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "left", className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-grape-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-grape-700 ring-1 ring-inset ring-grape-200">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-2xl font-extrabold text-slate-800 md:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
