import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "child";
    size?: "default" | "lg";
  }
>(({ className, variant = "primary", size = "default", ...props }, ref) => {
  const sizes = {
    default: "rounded-xl px-4 py-2.5 text-sm font-semibold",
    lg: "min-h-12 min-w-[10rem] rounded-full px-8 text-base font-bold",
  };
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-200/60",
    secondary:
      "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    child:
      "bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-md shadow-amber-200/50",
  };
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center transition-all disabled:opacity-50",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
