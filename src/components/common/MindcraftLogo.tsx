import React from 'react';

interface MindcraftLogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'mark-only';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  showTagline?: boolean;
  theme?: 'light' | 'dark';
}

export const MindcraftLogo: React.FC<MindcraftLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = false,
  theme = 'light'
}) => {
  // Sizing definitions for the mark
  const markDimensions = {
    sm: { width: 36, height: 36 },
    md: { width: 48, height: 48 },
    lg: { width: 68, height: 68 },
    xl: { width: 96, height: 96 },
    custom: { width: 48, height: 48 }
  }[size];

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#0A2558]';
  const taglineColor = theme === 'dark' ? 'text-slate-300' : 'text-[#1D3557]';

  // SVG Mark containing the Head silhouette, Circuit Nodes, and Neural Brain
  const LogoMark = (
    <svg
      width={markDimensions.width}
      height={markDimensions.height}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200"
      aria-label="Mindcraft Academy Logo"
    >
      <defs>
        {/* Head & Circuit traces gradient: bright gold to fiery orange */}
        <linearGradient id="headOrangeGrad" x1="20" y1="20" x2="150" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="75%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Neural Brain circuit gradient: electric cyan to royal deep blue */}
        <linearGradient id="brainBlueGrad" x1="30" y1="120" x2="120" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="25%" stopColor="#00B4D8" />
          <stop offset="65%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Soft shadow for depth */}
        <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Outer Head Silhouette & Sprouting Circuit Traces */}
      <g filter="url(#subtleGlow)">
        {/* Head profile outer path with thick stroke and rounded caps */}
        <path
          d="M 104 36 C 85 24 54 28 38 46 C 26 59 23 72 23 77 L 17 83 L 26 86 L 24 93 L 31 96 L 27 106 C 30 114 36 122 45 127 C 65 137 98 135 116 117 C 127 105 132 89 127 75"
          stroke="url(#headOrangeGrad)"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Top-Right Circuit Trace 1 */}
        <path
          d="M 108 42 L 126 42 L 132 30 L 140 30"
          stroke="url(#headOrangeGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="143" cy="30" r="4.5" fill="#FBBF24" stroke="url(#headOrangeGrad)" strokeWidth="2.5" />

        {/* Mid-Right Circuit Trace 2 */}
        <path
          d="M 124 58 L 138 58 L 144 50 L 150 50"
          stroke="url(#headOrangeGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="152" cy="50" r="4.5" fill="#F59E0B" stroke="url(#headOrangeGrad)" strokeWidth="2.5" />

        {/* Lower-Right Circuit Trace 3 */}
        <path
          d="M 118 70 L 130 70 L 136 78 L 146 78"
          stroke="url(#headOrangeGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="149" cy="78" r="4.5" fill="#FF7A00" stroke="url(#headOrangeGrad)" strokeWidth="2.5" />
      </g>

      {/* Inner Neural Circuit Brain */}
      <g stroke="url(#brainBlueGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Left Hemisphere convolutions */}
        <path d="M 64 54 C 54 54 48 60 48 67 C 48 74 54 77 59 77 C 64 77 64 84 57 85 C 49 86 44 92 44 98 C 44 106 52 113 62 112 C 70 111 74 104 74 97 L 74 88" />
        
        {/* Upper lobe loop */}
        <path d="M 62 50 C 66 43 78 43 82 50 C 86 57 82 65 74 65" />

        {/* Central stem & division */}
        <path d="M 75 66 L 75 106" strokeWidth="6.5" />

        {/* Right Hemisphere convolutions */}
        <path d="M 88 54 C 98 54 105 61 105 68 C 105 75 98 78 93 78 C 88 78 88 85 95 86 C 103 87 108 93 108 100 C 108 107 100 113 90 113 C 82 113 78 106 78 98 L 78 88" />

        {/* Central bottom synaptic loop */}
        <path d="M 66 112 C 71 116 81 116 86 112" strokeWidth="5" />

        {/* Connection node dots */}
        <circle cx="75" cy="62" r="3" fill="#00B4D8" stroke="none" />
        <circle cx="75" cy="107" r="3" fill="#0284C7" stroke="none" />
      </g>
    </svg>
  );

  if (variant === 'icon' || variant === 'mark-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoMark}</div>;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {LogoMark}
        <div className="mt-3 flex flex-col items-center">
          <h1 className={`text-2xl sm:text-3xl font-black tracking-wider ${textColor} uppercase font-sans`}>
            MINDCRAFT
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-5 sm:w-8 h-[2px] bg-[#FF7A00] rounded-full" />
            <span className="text-xs sm:text-sm font-extrabold tracking-[0.28em] text-[#FF7A00] uppercase">
              ACADEMY
            </span>
            <span className="w-5 sm:w-8 h-[2px] bg-[#FF7A00] rounded-full" />
          </div>
          {showTagline && (
            <p className={`mt-2 text-xs sm:text-sm font-semibold tracking-wide ${taglineColor}`}>
              Code <span className="text-[#00B4D8] mx-1">•</span> Create <span className="text-[#00B4D8] mx-1">•</span> Imagine <span className="text-[#00B4D8] mx-1">•</span> Grow
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default 'horizontal' variant
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {LogoMark}
      <div className="flex flex-col justify-center">
        <span className={`text-lg sm:text-xl font-black tracking-wider ${textColor} leading-tight font-sans uppercase`}>
          MINDCRAFT
        </span>
        <div className="flex items-center gap-1.5 -mt-0.5">
          <span className="w-3.5 h-[1.5px] bg-[#FF7A00] rounded-full" />
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.25em] text-[#FF7A00] uppercase">
            ACADEMY
          </span>
          <span className="w-3.5 h-[1.5px] bg-[#FF7A00] rounded-full" />
        </div>
        {showTagline && (
          <span className={`text-[10px] font-medium tracking-normal ${taglineColor} mt-0.5 hidden sm:inline`}>
            Code • Create • Imagine • Grow
          </span>
        )}
      </div>
    </div>
  );
};
