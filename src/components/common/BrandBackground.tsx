import React from 'react';

interface BrandBackgroundProps {
  className?: string;
  variant?: 'full' | 'subtle' | 'minimal' | 'hero';
  children?: React.ReactNode;
}

export const BrandBackground: React.FC<BrandBackgroundProps> = ({
  className = '',
  variant = 'full',
  children
}) => {
  return (
    <div className={`relative overflow-hidden w-full ${className}`}>
      {/* Background Graphic Canvas */}
      <div className="absolute inset-0 pointer-events-none select-none -z-10 overflow-hidden" aria-hidden="true">
        {/* Crisp Base Mesh Lighting */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] via-[#F4F8FC] to-[#EFF6FF]" />

        {/* 1. TOP-LEFT ROYAL NAVY WAVE */}
        <svg
          className="absolute -top-4 -left-4 w-[280px] sm:w-[420px] md:w-[520px] h-auto text-[#0B2265] opacity-95 transition-opacity"
          viewBox="0 0 520 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="topNavyGrad" x1="0" y1="0" x2="480" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B2265" />
              <stop offset="60%" stopColor="#0E338A" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>

          {/* Solid organic wave */}
          <path
            d="M -10 -10 L -10 240 C 60 250 120 220 180 140 C 240 60 340 50 480 30 L 480 -10 Z"
            fill="url(#topNavyGrad)"
          />

          {/* Thin contour trace line */}
          <path
            d="M -10 270 C 80 280 150 245 220 160 C 290 75 390 60 510 40"
            stroke="#1E40AF"
            strokeWidth="2.5"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* Top-left dot grid (5x4) */}
          <g fill="#93C5FD" fillOpacity="0.35">
            {[0, 1, 2, 3, 4].map(x =>
              [0, 1, 2, 3].map(y => (
                <circle key={`tl-dot-${x}-${y}`} cx={35 + x * 18} cy={35 + y * 18} r="2.2" />
              ))
            )}
          </g>
        </svg>

        {/* 2. BOTTOM-LEFT ELECTRIC CYAN / TEAL WAVE */}
        <svg
          className="absolute -bottom-6 -left-6 w-[320px] sm:w-[480px] md:w-[600px] h-auto opacity-95"
          viewBox="0 0 600 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="botCyanGrad" x1="0" y1="360" x2="520" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00A896" />
              <stop offset="40%" stopColor="#00B4D8" />
              <stop offset="85%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Smooth fluid cyan wave */}
          <path
            d="M -10 370 L -10 180 C 70 170 140 210 220 280 C 290 340 380 350 560 300 L 560 370 Z"
            fill="url(#botCyanGrad)"
          />

          {/* Outer cyan swoosh line */}
          <path
            d="M -10 150 C 90 140 165 185 250 255 C 330 320 420 330 580 280"
            stroke="#06B6D4"
            strokeWidth="3"
            strokeOpacity="0.5"
            fill="none"
          />

          {/* Watermark Laptop Outline Icon */}
          <g stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.3" fill="none" transform="translate(60, 240)">
            <rect x="15" y="10" width="55" height="36" rx="4" />
            <path d="M 5 46 L 80 46 C 82 46 84 48 84 50 L 84 52 L 1 52 L 1 50 C 1 48 3 46 5 46 Z" />
            <line x1="38" y1="48" x2="47" y2="48" strokeWidth="2" />
          </g>

          {/* Dot matrix inside bottom-left */}
          <g fill="#0284C7" fillOpacity="0.25">
            {[0, 1, 2, 3, 4].map(x =>
              [0, 1, 2].map(y => (
                <circle key={`bl-dot-${x}-${y}`} cx={25 + x * 20} cy={110 + y * 20} r="2.2" />
              ))
            )}
          </g>
        </svg>

        {/* 3. BOTTOM-RIGHT ENERGETIC SUN ORANGE / AMBER DOUBLE WAVE */}
        <svg
          className="absolute -bottom-6 -right-6 w-[360px] sm:w-[540px] md:w-[680px] h-auto opacity-95"
          viewBox="0 0 680 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="orangeWaveGrad" x1="680" y1="420" x2="100" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="35%" stopColor="#FF7A00" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="orangeSubtleGrad" x1="680" y1="420" x2="180" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#FF7A00" />
            </linearGradient>
          </defs>

          {/* Background orange layer */}
          <path
            d="M 690 430 L 690 140 C 580 150 490 220 400 300 C 310 380 210 380 90 340 L 90 430 Z"
            fill="url(#orangeSubtleGrad)"
            fillOpacity="0.75"
          />

          {/* Foreground vibrant orange wave */}
          <path
            d="M 690 430 L 690 180 C 570 190 480 260 380 330 C 300 385 220 395 120 370 L 120 430 Z"
            fill="url(#orangeWaveGrad)"
          />

          {/* Outer fine orange trail line */}
          <path
            d="M 690 110 C 560 120 460 200 370 275 C 280 350 180 365 70 320"
            stroke="#FF7A00"
            strokeWidth="3"
            strokeOpacity="0.5"
            fill="none"
          />

          {/* Watermark Gamepad Controller Icon */}
          <g stroke="#FFFFFF" strokeWidth="2.8" strokeOpacity="0.32" fill="none" transform="translate(520, 270)">
            <path d="M 20 28 C 20 18 30 10 44 10 L 66 10 C 80 10 90 18 90 28 C 90 42 84 62 76 68 C 72 71 67 68 64 64 L 58 56 L 52 56 L 46 64 C 43 68 38 71 34 68 C 26 62 20 42 20 28 Z" />
            {/* D-pad */}
            <path d="M 36 28 L 44 28 M 40 24 L 40 32" strokeWidth="2.5" />
            {/* Action buttons */}
            <circle cx="68" cy="25" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />
            <circle cx="76" cy="30" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />
          </g>

          {/* Watermark Python / Snake STEM Icon */}
          <g stroke="#FFFFFF" strokeWidth="2.6" strokeOpacity="0.3" fill="none" transform="translate(560, 160)">
            <path d="M 28 8 C 18 8 10 14 10 22 L 10 28 L 26 28 L 26 32 L 8 32 C 3 32 0 36 0 42 C 0 48 4 52 10 52 L 16 52 L 16 46 C 16 38 24 32 32 32 L 44 32 C 50 32 54 28 54 22 C 54 16 50 8 44 8 L 28 8 Z" />
            <circle cx="20" cy="14" r="2" fill="#FFFFFF" fillOpacity="0.4" />
          </g>

          {/* Bottom-right Dot matrix */}
          <g fill="#D97706" fillOpacity="0.35">
            {[0, 1, 2, 3, 4, 5].map(x =>
              [0, 1, 2].map(y => (
                <circle key={`br-dot-${x}-${y}`} cx={420 + x * 20} cy={350 + y * 20} r="2.2" />
              ))
            )}
          </g>
        </svg>

        {/* 4. FLOATING SUBTLE STEM WATERMARKS (Top-Right / Center-Right) */}
        {variant !== 'minimal' && (
          <div className="absolute top-12 right-12 md:right-24 flex flex-col items-end gap-12 pointer-events-none opacity-40">
            {/* Dot grid */}
            <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
              {[0, 1, 2, 3, 4, 5].map(x =>
                [0, 1, 2].map(y => (
                  <circle key={`tr-grid-${x}-${y}`} cx={10 + x * 18} cy={10 + y * 18} r="2" fill="#94A3B8" />
                ))
              )}
            </svg>

            {/* Code angle brackets </ > */}
            <svg width="44" height="32" viewBox="0 0 44 32" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-8">
              <polyline points="14 6 4 16 14 26" />
              <polyline points="30 6 40 16 30 26" />
              <line x1="24" y1="4" x2="20" y2="28" />
            </svg>

            {/* Curly Braces { } */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M 12 6 C 8 6 6 8 6 12 L 6 14 C 6 16 4 18 2 18 C 4 18 6 20 6 22 L 6 24 C 6 28 8 30 12 30" />
              <path d="M 24 6 C 28 6 30 8 30 12 L 30 14 C 30 16 32 18 34 18 C 32 18 30 20 30 22 L 30 24 C 30 28 28 30 24 30" />
            </svg>

            {/* Lightbulb (Ideas / Imagine) */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-14 opacity-70">
              <path d="M 20 4 C 12 4 8 10 8 16 C 8 20 12 24 14 26 L 14 30 L 26 30 L 26 26 C 28 24 32 20 32 16 C 32 10 28 4 20 4 Z" />
              <line x1="16" y1="33" x2="24" y2="33" />
              <line x1="18" y1="36" x2="22" y2="36" />
            </svg>

            {/* Engineering Gear Cog */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-32 -mt-4 opacity-50">
              <circle cx="18" cy="18" r="6" />
              <path d="M 18 2 L 18 6 M 18 30 L 18 34 M 2 18 L 6 18 M 30 18 L 34 18 M 6.7 6.7 L 9.5 9.5 M 26.5 26.5 L 29.3 29.3 M 6.7 29.3 L 9.5 26.5 M 26.5 9.5 L 29.3 6.7" />
            </svg>
          </div>
        )}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
