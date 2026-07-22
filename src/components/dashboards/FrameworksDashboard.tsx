import React from "react";
import { motion } from "motion/react";

export default function FrameworksDashboard() {
  const steps = [
    {
      number: "01",
      letter: "C",
      label: "Context",
      description: "What does the model need to know before it can help?",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      number: "02",
      letter: "O",
      label: "Objective",
      description: "What's the actual outcome — stated as a concrete deliverable?",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      number: "03",
      letter: "D",
      label: "Design",
      description: "What shape should the output take — format, length, structure, tone?",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    },
    {
      number: "04",
      letter: "E",
      label: "Evaluate",
      description: "How will you know it's good enough to actually use?",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="font-mono text-xs text-[#A0A2B0] max-w-7xl mx-auto">
      {/* Section label: "The C.O.D.E. Method" — small caps, cyan */}
      <div className="mb-3 flex items-center gap-3 relative z-10">
        <span className="h-[2px] w-6 bg-cyan/80 rounded-full" />
        <span 
          className="text-xs font-bold tracking-widest text-cyan uppercase font-mono"
          style={{ fontVariant: "small-caps" }}
        >
          The C.O.D.E. Method
        </span>
      </div>

      {/* Subtitle with premium font serif for amazing elegant look */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-white tracking-tight mb-12 font-serif max-w-4xl leading-snug">
        A repeatable four-question checklist behind every bot, prompt, and workflow we build and teach.
      </h2>

      {/* Desktop horizontal timeline (md and up) */}
      <div className="hidden md:block relative mt-16 mb-8">
        {/* Horizontal connector line with premium moving laser glow */}
        <div className="absolute top-[32px] left-[10%] right-[10%] h-[1.5px] bg-gradient-to-r from-cyan/5 via-[#2a2c35] to-cyan/5 z-0" />
        <div className="absolute top-[32px] left-[10%] right-[10%] h-[1.5px] bg-gradient-to-r from-transparent via-cyan/40 to-transparent z-0 overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent"
            animate={{
              left: ["-100%", "200%"]
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "linear"
            }}
          />
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="grid grid-cols-4 gap-6 relative z-10"
        >
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { type: "spring", stiffness: 100, damping: 15 }
                  }
                }}
                whileHover="hover"
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                {/* Icon wrapper with ripple animation */}
                <div className="relative w-16 h-16 mb-6 flex items-center justify-center z-10">
                  {/* Ambient hover glow */}
                  <motion.div 
                    variants={{
                      hover: { scale: 1.2, opacity: 1 }
                    }}
                    className="absolute inset-0 rounded-full bg-cyan/5 opacity-0 blur-md transition-all duration-300 pointer-events-none"
                  />
                  
                  {/* Outer pulsing ring */}
                  <motion.div 
                    variants={{
                      hover: { borderColor: "rgba(6, 182, 212, 1)", rotate: 90 }
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="absolute inset-0 rounded-full border border-[#2a2c35] bg-[#0D0E12] z-0"
                  />

                  <div className="relative z-10 text-cyan group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>

                {/* Step Card */}
                <motion.div
                  variants={{
                    hover: { 
                      y: -8,
                      borderColor: "rgba(6, 182, 212, 0.4)",
                      backgroundColor: "rgba(22, 23, 29, 0.55)",
                      boxShadow: "0 10px 30px -10px rgba(6, 182, 212, 0.15)"
                    }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-full p-6 rounded-xl border border-[#2a2c35]/60 bg-[#16171D]/20 backdrop-blur-sm text-center relative overflow-hidden transition-all duration-300 min-h-[190px] flex flex-col justify-start"
                >
                  {/* Glowing top accent */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Cyber letter indicator watermark in the background of the card */}
                  <div className="absolute -bottom-6 -right-2 text-[80px] font-bold font-serif text-white/[0.02] select-none pointer-events-none group-hover:text-cyan/[0.03] transition-colors duration-300">
                    {step.letter}
                  </div>

                  {/* Step Header */}
                  <div className="flex items-center gap-1.5 justify-center font-mono mb-3.5 border-b border-[#2a2c35]/40 pb-3">
                    <span className="text-cyan/60 text-[10px] font-bold tracking-wider">{step.number}</span>
                    <span className="text-[#2a2c35] text-[10px]">|</span>
                    <span className="text-cyan text-sm font-extrabold tracking-widest">{step.letter}</span>
                    <span className="text-[#2a2c35] text-[10px]">|</span>
                    <span className="text-white text-xs font-bold uppercase tracking-wider group-hover:text-cyan transition-colors duration-300">{step.label}</span>
                  </div>

                  {/* Step Description */}
                  <p className="text-xs text-[#A0A2B0] leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile vertical timeline (md and below) - completely redesigning to avoid collisions */}
      <div className="block md:hidden relative mt-10 mb-6 px-1">
        {/* Vertical connector line with moving laser pulse */}
        <div className="absolute left-[23px] top-6 bottom-6 w-[1.5px] bg-gradient-to-b from-cyan/5 via-[#2a2c35] to-cyan/5 z-0" />
        <div className="absolute left-[23px] top-6 bottom-6 w-[1.5px] bg-gradient-to-b from-transparent via-cyan/40 to-transparent z-0 overflow-hidden">
          <motion.div 
            className="absolute left-0 right-0 h-1/4 bg-gradient-to-b from-transparent via-cyan to-transparent"
            animate={{
              top: ["-25%", "125%"]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "linear"
            }}
          />
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="space-y-8 relative z-10"
        >
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { 
                    opacity: 1, 
                    x: 0,
                    transition: { type: "spring", stiffness: 100, damping: 15 }
                  }
                }}
                whileHover="hover"
                className="flex items-start gap-5 group cursor-pointer"
              >
                {/* Icon placed perfectly on the left line, no text interference */}
                <div className="relative w-11 h-11 flex items-center justify-center z-10 flex-shrink-0 mt-1">
                  {/* Outer concentric pulsing ring */}
                  <div className="absolute inset-0 rounded-full border border-cyan/40 bg-[#0D0E12] group-hover:border-cyan transition-colors duration-300" />
                  
                  {/* SVG Icon */}
                  <div className="relative z-10 text-cyan scale-90 group-hover:scale-105 transition-transform duration-300">
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>

                {/* Step Card offset to the right, fully avoiding the line */}
                <motion.div
                  variants={{
                    hover: { 
                      x: 4,
                      borderColor: "rgba(6, 182, 212, 0.4)",
                      backgroundColor: "rgba(22, 23, 29, 0.55)",
                      boxShadow: "0 4px 20px -5px rgba(6, 182, 212, 0.1)"
                    }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex-1 p-5 rounded-xl border border-[#2a2c35]/60 bg-[#16171D]/20 backdrop-blur-sm relative overflow-hidden transition-all duration-300"
                >
                  {/* Left cyan accent bar on hover */}
                  <div className="absolute inset-y-0 left-0 w-[2px] bg-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Step Header */}
                  <div className="flex flex-wrap items-center gap-1.5 font-mono mb-2 border-b border-[#2a2c35]/40 pb-2">
                    <span className="text-cyan/60 text-[9px] font-bold">{step.number}</span>
                    <span className="text-[#2a2c35] text-[9px]">|</span>
                    <span className="text-cyan text-xs font-extrabold">{step.letter}</span>
                    <span className="text-[#2a2c35] text-[9px]">|</span>
                    <span className="text-white text-[11px] font-bold uppercase tracking-wider group-hover:text-cyan transition-colors duration-300">{step.label}</span>
                  </div>

                  {/* Step Description */}
                  <p className="text-xs text-[#A0A2B0] leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
