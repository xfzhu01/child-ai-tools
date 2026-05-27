type BrandLogoProps = {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const iconSizes = { sm: 28, md: 36, lg: 44 } as const;
const textSizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
} as const;

function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#6366F1" />
      <path
        d="M14 25L21 32L34 16"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLogo({ showText = true, size = "md", className = "" }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={iconSizes[size]} />
      {showText ? (
        <span className={`font-black tracking-tight text-indigo-700 ${textSizes[size]}`}>
          <span className="text-violet-600">小宝</span>
          <span>打字</span>
        </span>
      ) : null}
    </span>
  );
}
