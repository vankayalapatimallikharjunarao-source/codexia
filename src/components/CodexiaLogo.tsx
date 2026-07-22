import React from "react";

interface CodexiaLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export default function CodexiaLogo({
  size = "md",
  className = "",
  showText = true,
}: CodexiaLogoProps) {
  const sizeMap = {
    sm: { logo: "w-8 h-8", text: "text-sm", gap: "gap-2" },
    md: { logo: "w-12 h-12", text: "text-lg", gap: "gap-3" },
    lg: { logo: "w-28 h-28", text: "text-3xl", gap: "gap-6" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${currentSize.gap} ${className}`}>
      {/* Visual Glowing Node Matrix representation */}
      <div className={`${currentSize.logo} relative flex items-center justify-center`}>
        {/* Outer Pulsing Glow */}
        <div className="absolute inset-0 bg-cyan/10 rounded-full blur-md animate-pulse"></div>

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Constellation Network / Nodes */}
          <g className="animate-spin-slow origin-center" style={{ transformOrigin: "50% 50%", animationDuration: "16s" }}>
            {/* Outer connecting thin lines */}
            <circle cx="50" cy="50" r="38" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="0.75" strokeDasharray="3 3" />
            <polygon
              points="50,12 83,31 83,69 50,88 17,69 17,31"
              stroke="rgba(6, 182, 212, 0.15)"
              strokeWidth="0.5"
            />
            {/* Fine circuit threads */}
            <path d="M50,12 L50,88 M17,31 L83,69 M17,69 L83,31" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.5" />
            
            {/* Glowing nodes (dots) */}
            <circle cx="50" cy="12" r="2.5" fill="#06b6d4" className="shadow-lg shadow-cyan/50" />
            <circle cx="83" cy="31" r="2.5" fill="#06b6d4" />
            <circle cx="83" cy="69" r="2.5" fill="#06b6d4" />
            <circle cx="50" cy="88" r="2.5" fill="#06b6d4" />
            <circle cx="17" cy="69" r="2.5" fill="#06b6d4" />
            <circle cx="17" cy="31" r="2.5" fill="#06b6d4" />
            
            {/* Intermediate nodes */}
            <circle cx="33.5" cy="20.5" r="1.5" fill="#0891b2" />
            <circle cx="66.5" cy="20.5" r="1.5" fill="#0891b2" />
            <circle cx="83" cy="50" r="1.5" fill="#0891b2" />
            <circle cx="66.5" cy="79.5" r="1.5" fill="#0891b2" />
            <circle cx="33.5" cy="79.5" r="1.5" fill="#0891b2" />
            <circle cx="17" cy="50" r="1.5" fill="#0891b2" />
          </g>

          {/* Inner Circle Track */}
          <circle cx="50" cy="50" r="26" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="40 10 20 10" className="animate-spin-reverse" style={{ transformOrigin: "50% 50%", animationDuration: "12s" }} />

          {/* Glowing central "C" */}
          <g>
            {/* The main C arc */}
            <path
              d="M62,38 C58,32 50,32 45,36 C38,42 38,58 45,64 C50,68 58,68 62,62"
              stroke="#06b6d4"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]"
            />
            
            {/* Inner circuit lines inside the C */}
            <path
              d="M58,42 C55,38 49,38 46,41 C42,45 42,55 46,59 C49,62 55,62 58,58"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Horizontal circuit lines shooting right from C */}
            <path d="M58,47 L80,47" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
            <path d="M60,50 L84,50" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M58,53 L80,53" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />

            {/* Micro nodes on the tips of horizontal lines */}
            <circle cx="80" cy="47" r="1.5" fill="#22d3ee" />
            <circle cx="84" cy="50" r="2" fill="#22d3ee" className="animate-pulse" />
            <circle cx="80" cy="53" r="1.5" fill="#22d3ee" />
          </g>
        </svg>
      </div>

      {showText && (
        <span
          className={`font-mono ${currentSize.text} font-bold tracking-[0.25em] text-white flex items-center select-none`}
        >
          CODEXI
          <span className="text-cyan text-shadow-glow">A</span>
        </span>
      )}
    </div>
  );
}
