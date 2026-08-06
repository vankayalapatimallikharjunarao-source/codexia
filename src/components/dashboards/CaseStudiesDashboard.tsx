import React from "react";
import { Quote } from "lucide-react";

interface CaseStudiesDashboardProps {
  userTier?: "standard" | "premium";
  onNewLog?: (desc: string, severity: "HIGH" | "MEDIUM" | "LOW") => void;
  showNotification?: (msg: string) => void;
}

export default function CaseStudiesDashboard({
  userTier,
  onNewLog,
  showNotification
}: CaseStudiesDashboardProps) {
  // 3 identical cards
  const cards = [1, 2, 3];

  return (
    <div className="font-mono text-xs text-[#A0A2B0]">
      {/* 3 cards in a row (desktop), stacked (mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {cards.map((cardIndex) => (
          <div
            key={cardIndex}
            className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col items-center text-center space-y-4 hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300"
          >
            {/* Circular placeholder avatar, 48px, grey (#4A4A4A) */}
            <div className="w-12 h-12 rounded-full bg-[#4A4A4A] flex-shrink-0" />

            {/* Large quotation mark icon below avatar, cyan accent */}
            <Quote className="w-8 h-8 text-cyan flex-shrink-0" fill="none" strokeWidth={1.5} />

            {/* 3 placeholder bars: 100% / 80% / 60% width, 12px height, #3A3A3A, border-radius 4px */}
            <div className="w-full space-y-2 py-2 flex flex-col items-center">
              <div className="w-full h-3 bg-[#3A3A3A] rounded-[4px]" />
              <div className="w-[80%] h-3 bg-[#3A3A3A] rounded-[4px]" />
              <div className="w-[60%] h-3 bg-[#3A3A3A] rounded-[4px]" />
            </div>

            {/* Badge at bottom: pill shape, label "Case study — coming soon", transparent background, 1px cyan border, cyan text, 11px font */}
            <div className="pt-2">
              <span className="inline-block px-4 py-1 border border-cyan text-cyan text-[11px] rounded-full bg-transparent tracking-wide select-none">
                Case study — coming soon
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Below the 3 cards: Full-width section, border-top separator */}
      <div className="mt-12 pt-8 border-t border-[#2a2c35] w-full flex justify-center">
        {/* Centered italic text, max-width 540px, color #A0A0A0 */}
        <p className="italic text-center text-[#A0A0A0] text-sm leading-relaxed max-w-[540px]">
          "Codexia is newly founded. We're building our first cohort case studies now — check back after our first live programs, or reach out directly if you want to understand our approach before then."
        </p>
      </div>
    </div>
  );
}
