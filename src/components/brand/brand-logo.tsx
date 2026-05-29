type BrandLogoProps = {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const iconSizes = { sm: 30, md: 38, lg: 46 } as const;
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
      <defs>
        <linearGradient id="brandGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A47CFF" />
          <stop offset="0.55" stopColor="#875CFF" />
          <stop offset="1" stopColor="#FB479E" />
        </linearGradient>
      </defs>
      <rect x="3" y="4" width="42" height="42" rx="13" fill="url(#brandGrad)" />
      <rect x="3" y="4" width="42" height="42" rx="13" fill="white" fillOpacity="0.08" />
      {/* friendly key cap */}
      <rect x="13" y="14" width="22" height="16" rx="5" fill="#FFFFFF" fillOpacity="0.95" />
      <path
        d="M19 22.5L22.5 26L29.5 18.5"
        stroke="#875CFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* sparkle */}
      <circle cx="35.5" cy="13" r="2.4" fill="#FFC53D" />
      <path d="M24 33.5h0.02M19 33.5h0.02M29 33.5h0.02" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function BrandLogo({ showText = true, size = "md", className = "" }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={iconSizes[size]} />
      {showText ? (
        <span className={`font-display font-extrabold tracking-tight ${textSizes[size]}`}>
          <span className="text-bubble-500">小宝</span>
          <span className="text-grape-700">打字</span>
        </span>
      ) : null}
    </span>
  );
}
