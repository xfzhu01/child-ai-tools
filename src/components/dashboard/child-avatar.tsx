import { cn } from "@/lib/utils";
import { resolveChildAvatar } from "@/lib/child-avatar";

type ChildAvatarProps = {
  child: { id: string; avatarUrl?: string | null };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: { box: "h-12 w-12 text-2xl ring-2", badge: "text-[10px] px-1.5 py-0.5" },
  md: { box: "h-16 w-16 text-3xl ring-[3px]", badge: "text-xs px-2 py-0.5" },
  lg: { box: "h-20 w-20 text-4xl ring-4", badge: "text-xs px-2 py-0.5" },
  xl: { box: "h-24 w-24 text-5xl ring-4", badge: "text-sm px-2.5 py-1" },
};

export function ChildAvatar({ child, size = "md", className }: ChildAvatarProps) {
  const preset = resolveChildAvatar(child);
  const style = sizes[size];

  return (
    <div className={cn("relative inline-flex shrink-0 flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br shadow-inner",
          style.box,
          preset.ring,
          preset.bg,
        )}
        aria-hidden
      >
        <span className="select-none drop-shadow-sm">{preset.emoji}</span>
      </div>
      <span
        className={cn(
          "rounded-full bg-white/90 font-medium text-slate-500 shadow-sm",
          style.badge,
        )}
      >
        {preset.label}
      </span>
    </div>
  );
}
