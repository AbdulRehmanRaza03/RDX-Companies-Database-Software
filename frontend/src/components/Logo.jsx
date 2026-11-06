// Brand logo — a clean, professional "RDX LeadFlow" mark using an SVG gradient.
export default function Logo({ size = 36, withText = true, dark = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rdxLogo" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="11" fill="url(#rdxLogo)" />
        <path
          d="M13 33V15l8 18h2l8-18v18"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withText && (
        <div className="leading-tight">
          <div className={`text-sm font-bold ${dark ? 'text-white' : 'text-ink-900'}`}>RDX LeadFlow</div>
          <div className={`text-[10px] ${dark ? 'text-brand-200' : 'text-ink-400'}`}>Revenue Agency</div>
        </div>
      )}
    </div>
  )
}
