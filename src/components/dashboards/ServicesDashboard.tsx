import React from "react";
import { motion } from "motion/react";

export default function ServicesDashboard() {
  const services = [
    {
      headline: "Fractional AI Leadership",
      body: "Senior-level judgment on tap — technology decisions, process direction, and hands-on guidance, without hiring a full-time specialist.",
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
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
          <path d="M9 1v3" />
          <path d="M15 1v3" />
          <path d="M9 20v3" />
          <path d="M15 20v3" />
          <path d="M20 9h3" />
          <path d="M20 15h3" />
          <path d="M1 9h3" />
          <path d="M1 15h3" />
        </svg>
      ),
    },
    {
      headline: "Workflow & Systems Review",
      body: "A second set of senior eyes on what your team is building or running — before a costly mistake gets locked in.",
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <circle cx="10" cy="14" r="2.5" />
          <line x1="11.8" y1="15.8" x2="14.5" y2="18.5" />
        </svg>
      ),
    },
    {
      headline: "Applied AI Enablement",
      body: "Hands-on training so your team can actually use AI in their day-to-day work — not just in a one-hour demo that nobody applies.",
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
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      ),
    },
    {
      headline: "Team Training Sprints",
      body: "The Base Cohort and Premium Alpha programs, delivered privately for your whole team — same curriculum, applied directly to the way your team actually works.",
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <div className="font-mono text-xs text-[#A0A2B0] max-w-7xl mx-auto">
      {/* Section label: "What We Do" — small caps, cyan */}
      <div className="mb-2">
        <span 
          className="text-xs font-bold tracking-widest text-cyan uppercase"
          style={{ fontVariant: "small-caps" }}
        >
          What We Do
        </span>
      </div>

      {/* Subtitle */}
      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight mb-8 font-sans">
        Senior AI expertise and hands-on training, available without a full-time hire.
      </h2>

      {/* Layout: 2×2 grid (desktop), single column (mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, idx) => {
          const IconComponent = service.icon;
          return (
            <div
              key={idx}
              className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col items-start gap-4 hover:border-cyan/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {/* Icon sits directly on card surface, top-left of content, no wrapper */}
              <div className="w-6 h-6 text-cyan flex-shrink-0">
                <IconComponent className="w-6 h-6 text-cyan" />
              </div>

              {/* Text content */}
              <div className="space-y-1.5 pt-0">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {service.headline}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed uppercase">
                  {service.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section D: Who is Codexia for? */}
      <div className="mt-16 border-t border-[#2a2c35] pt-12">
        <div className="mb-8">
          <span 
            className="text-xs font-bold tracking-widest text-cyan uppercase block font-mono mb-2"
            style={{ fontVariant: "small-caps" }}
          >
            Who is Codexia for?
          </span>
          <h2 className="font-serif text-lg md:text-xl lg:text-2xl font-medium text-white mb-2 leading-normal">
            Tailored learning tracks designed to scale with your execution needs.
          </h2>
        </div>

        {/* 3 connected horizontal cards (stacked on mobile) with premium staggered entrance and interactive hover effects */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12
              }
            }
          }}
          className="flex flex-col md:flex-row border border-[#2a2c35] rounded-xl bg-[#16171D]/20 relative z-10"
        >
          {/* Card 1 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 120, damping: 18 }
              }
            }}
            whileHover={{ 
              y: -5,
              scale: 1.015,
              borderColor: "rgba(6, 182, 212, 0.4)",
              backgroundColor: "rgba(22, 23, 29, 0.55)"
            }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex-1 p-6 text-left relative overflow-hidden group cursor-pointer border-b md:border-b-0 md:border-r border-[#2a2c35] rounded-t-xl md:rounded-tr-none md:rounded-l-xl transition-all duration-300"
          >
            {/* Visual indicator corner dot */}
            <span className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-cyan/80 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
            <span className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Glowing background sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <span className="text-[10px] font-mono text-cyan uppercase font-bold block mb-2 transition-transform duration-300 group-hover:translate-x-1">
              01 // Individual
            </span>
            <h3 className="font-sans text-sm font-bold text-white mb-1 transition-colors duration-300 group-hover:text-cyan">
              Independent professional
            </h3>
            <p className="text-xs text-[#A0A2B0] transition-colors duration-300 group-hover:text-slate-200">
              Build your own micro-bots to automate daily execution.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 120, damping: 18 }
              }
            }}
            whileHover={{ 
              y: -5,
              scale: 1.015,
              borderColor: "rgba(6, 182, 212, 0.4)",
              backgroundColor: "rgba(22, 23, 29, 0.55)"
            }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex-1 p-6 text-left relative overflow-hidden group cursor-pointer border-b md:border-b-0 md:border-r border-[#2a2c35] transition-all duration-300"
          >
            {/* Visual indicator corner dot */}
            <span className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-cyan/80 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
            <span className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Glowing background sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <span className="text-[10px] font-mono text-cyan uppercase font-bold block mb-2 transition-transform duration-300 group-hover:translate-x-1">
              02 // Collaborative
            </span>
            <h3 className="font-sans text-sm font-bold text-white mb-1 transition-colors duration-300 group-hover:text-cyan">
              Small team (2–15 people)
            </h3>
            <p className="text-xs text-[#A0A2B0] transition-colors duration-300 group-hover:text-slate-200">
              Connected workflows across the team to multiply performance.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 120, damping: 18 }
              }
            }}
            whileHover={{ 
              y: -5,
              scale: 1.015,
              borderColor: "rgba(6, 182, 212, 0.4)",
              backgroundColor: "rgba(22, 23, 29, 0.55)"
            }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex-1 p-6 text-left relative overflow-hidden group cursor-pointer rounded-b-xl md:rounded-bl-none md:rounded-r-xl transition-all duration-300"
          >
            {/* Visual indicator corner dot */}
            <span className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-cyan/80 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
            <span className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Glowing background sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <span className="text-[10px] font-mono text-cyan uppercase font-bold block mb-2 transition-transform duration-300 group-hover:translate-x-1">
              03 // Enterprise
            </span>
            <h3 className="font-sans text-sm font-bold text-white mb-1 transition-colors duration-300 group-hover:text-cyan">
              Growing business
            </h3>
            <p className="text-xs text-[#A0A2B0] transition-colors duration-300 group-hover:text-slate-200">
              Team-wide training cohorts to standardize AI integration.
            </p>
          </motion.div>
        </motion.div>

        {/* Caption below */}
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-cyan/80">
          Base Cohort fits the first two; Premium Alpha fits all three.
        </p>
      </div>
    </div>
  );
}
