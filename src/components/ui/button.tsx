import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "child" | "accent";
    size?: "sm" | "default" | "lg" | "xl";
  }
>(({ className, variant = "primary", size = "default", ...props }, ref) => {
  const sizes = {
    sm: "rounded-xl px-3 py-1.5 text-xs font-bold",
    default: "rounded-2xl px-4 py-2.5 text-sm font-bold",
    lg: "min-h-12 min-w-[10rem] rounded-full px-8 text-base font-extrabold",
    xl: "min-h-14 min-w-[12rem] rounded-full px-10 text-lg font-extrabold",
  };
  const variants = {
    primary:
      "bg-gradient-to-b from-grape-400 to-grape-600 text-white shadow-candy ring-1 ring-grape-300/50 hover:from-grape-300 hover:to-grape-500",
    secondary:
      "bg-white text-grape-700 border-2 border-grape-200 hover:border-grape-300 hover:bg-grape-50",
    ghost: "bg-transparent text-slate-600 hover:bg-grape-50 hover:text-grape-700",
    child:
      "bg-gradient-to-b from-sun-300 to-sun-500 text-amber-950 shadow-[0_12px_28px_-10px_rgb(251_176_30/0.6)] ring-1 ring-sun-300/60 hover:from-sun-200 hover:to-sun-400",
    accent:
      "bg-gradient-to-b from-bubble-300 to-bubble-500 text-white shadow-glow ring-1 ring-bubble-200/60 hover:from-bubble-200 hover:to-bubble-400",
  };
  return (
    <button
      ref={ref}
      className={cn(
        "candy-press inline-flex items-center justify-center gap-1.5 outline-none focus-visible:ring-4 focus-visible:ring-grape-300/50 disabled:opacity-50 disabled:shadow-none",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
