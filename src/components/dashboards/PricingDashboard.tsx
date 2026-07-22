import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Check,
  Sparkles
} from "lucide-react";
import { PricingTier } from "../../types";

interface PricingDashboardProps {
  userTier: "standard" | "premium";
  onUpgradeClick: (tier: PricingTier) => void;
  pricingTiers: PricingTier[];
  showNotification: (msg: string) => void;
  keyId: string;
  masterclassActive: boolean;
  masterclassTimeLeft: number;
}

export default function PricingDashboard({
  userTier = "standard",
  onUpgradeClick,
  pricingTiers,
  showNotification,
  keyId,
  masterclassActive,
  masterclassTimeLeft
}: PricingDashboardProps) {
  const [useUSD, setUseUSD] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState([
    { id: "TXN-9022", date: "2024.10.20", amount: "₹4,999", desc: "Cohort Base Enrollment", status: "COMPLETED" },
    { id: "TXN-8812", date: "2024.08.15", amount: "₹1,200", desc: "API Sandbox Credit Load", status: "COMPLETED" }
  ]);

  const activeTierObj = pricingTiers.find(t => t.id === userTier) || pricingTiers[0];

  return (
    <div className="font-mono text-xs text-[#A0A2B0]">
      {/* Header */}
      <header className="mb-8 border-l-4 border-cyan pl-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-serif text-xl md:text-2xl font-medium text-white leading-normal">
            Pricing
          </h1>
          <p className="text-[9px] uppercase tracking-widest mt-0.5">
            Manage your cohort investment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase">Display Currency:</span>
          <div className="flex bg-black p-0.5 border border-[#2a2c35] rounded">
            <button
              onClick={() => setUseUSD(false)}
              className={`px-2.5 py-1 text-[8px] font-bold uppercase rounded ${
                !useUSD ? "bg-cyan text-black" : "text-[#A0A2B0] hover:text-white"
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setUseUSD(true)}
              className={`px-2.5 py-1 text-[8px] font-bold uppercase rounded ${
                useUSD ? "bg-cyan text-black" : "text-[#A0A2B0] hover:text-white"
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Masterclass Promo Alert Banner */}
      {masterclassActive && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 bg-gradient-to-r from-red-500/20 via-red-950/20 to-cyan/15 border-2 border-red-500/40 rounded-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 grid-overlay pointer-events-none opacity-5"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] bg-red-500 text-black px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest animate-pulse inline-block">
                URGENT // COHORT CONVERSION EVENT ACTIVE
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                Free Masterclass Dynamic Pricing Slashed!
              </h3>
              <p className="text-[9px] text-[#A0A2B0] uppercase tracking-wide max-w-3xl">
                The masterclass is currently live! Seat pricing is temporarily reduced. After the timer expires, prices will immediately return to standard rates. <span className="text-white font-bold">You will not be able to get this promotional price again.</span>
              </p>
            </div>

            <div className="bg-black/80 border border-red-500/30 p-3 rounded-lg flex flex-col items-center min-w-[130px] shadow-lg">
              <span className="text-[8px] text-[#A0A2B0] uppercase tracking-widest block mb-0.5 font-bold">REVERSION_CLOCK</span>
              <span className="text-lg font-mono font-bold text-red-400 animate-pulse tabular-nums">
                {Math.floor(masterclassTimeLeft / 60) < 10 ? "0" : ""}{Math.floor(masterclassTimeLeft / 60)}:
                {masterclassTimeLeft % 60 < 10 ? "0" : ""}{masterclassTimeLeft % 60}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BASE COHORT CARD */}
            <div className="border border-[#2a2c35] p-6 bg-[#16171D]/40 flex flex-col justify-between relative rounded-xl overflow-hidden text-left min-h-[440px]">
              <div>
                {/* Track badge */}
                <div className="inline-block px-3 py-1 border border-cyan bg-transparent text-cyan text-[10px] font-mono font-bold tracking-wider rounded-full uppercase mb-5">
                  Base Cohort
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  {masterclassActive ? (
                    <>
                      <span className="text-2xl font-sans font-bold text-cyan tracking-tight leading-none">
                        {useUSD ? "$59" : "₹3,999"}
                      </span>
                      <span className="text-xs font-sans font-medium text-[#A0A2B0]/60 line-through tracking-tight leading-none">
                        {useUSD ? "$79" : "₹4,999"}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan/10 text-cyan border border-cyan/20 animate-pulse uppercase tracking-wider ml-1">
                        SAVE {useUSD ? "$20" : "₹1,000"}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-sans font-bold text-white tracking-tight leading-none">
                      {useUSD ? "$79" : "₹4,999"}
                    </span>
                  )}
                </div>

                {/* Payment note */}
                <p className="text-[10px] text-[#A0A2B0] font-sans mb-5 uppercase tracking-wider">
                  Single upfront seat payment
                </p>

                {/* Divider */}
                <div className="h-[1px] bg-[#2A2A2A] w-full mb-5" />

                {/* Feature list */}
                <ul className="space-y-3.5 mb-6 text-left font-sans text-xs text-[#A0A2B0]">
                  <motion.li 
                    whileHover="hover"
                    className="flex items-start gap-2.5 group cursor-pointer"
                  >
                    <motion.div
                      variants={{
                        hover: { scale: 1.25, rotate: 10, y: -0.5 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="group-hover:text-white transition-colors duration-200">6-day live curriculum access</span>
                  </motion.li>
                  <motion.li 
                    whileHover="hover"
                    className="flex items-start gap-2.5 group cursor-pointer"
                  >
                    <motion.div
                      variants={{
                        hover: { scale: 1.25, rotate: 10, y: -0.5 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="group-hover:text-white transition-colors duration-200">Digital interactive documentation</span>
                  </motion.li>
                  <motion.li 
                    whileHover="hover"
                    className="flex items-start gap-2.5 group cursor-pointer"
                  >
                    <motion.div
                      variants={{
                        hover: { scale: 1.25, rotate: 10, y: -0.5 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="group-hover:text-white transition-colors duration-200">Community access</span>
                  </motion.li>
                  <motion.li 
                    whileHover="hover"
                    className="flex items-start gap-2.5 group cursor-pointer"
                  >
                    <motion.div
                      variants={{
                        hover: { scale: 1.25, rotate: 10, y: -0.5 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="group-hover:text-white transition-colors duration-200">Hands-on project: build and demo one real AI-powered tool</span>
                  </motion.li>
                  <motion.li 
                    whileHover="hover"
                    className="flex items-start gap-2.5 group cursor-pointer"
                  >
                    <motion.div
                      variants={{
                        hover: { scale: 1.25, rotate: 10, y: -0.5 }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="group-hover:text-white transition-colors duration-200">Completion certificate</span>
                  </motion.li>
                </ul>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => {
                  const baseTier = pricingTiers.find(t => t.id === "standard") || {
                    id: "standard",
                    name: "Base Cohort",
                    subtitle: masterclassActive ? "Launch pricing" : "6-Day sprint",
                    priceINR: masterclassActive ? 3999 : 4999,
                    priceUSD: masterclassActive ? 59 : 79,
                    features: [],
                    isPremium: false
                  };
                  onUpgradeClick(baseTier);
                }}
                className="w-full py-2.5 bg-cyan text-[#16171D] font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded cursor-pointer mt-auto"
              >
                ENROLL NOW
              </button>
            </div>

            {/* PREMIUM ALPHA CARD */}
            <motion.div 
              animate={{
                borderColor: ["rgba(6,182,212,0.2)", "rgba(6,182,212,0.55)", "rgba(6,182,212,0.2)"],
                boxShadow: [
                  "0 0 20px rgba(6,182,212,0.03)",
                  "0 0 35px rgba(6,182,212,0.15)",
                  "0 0 20px rgba(6,182,212,0.03)"
                ]
              }}
              whileHover={{
                borderColor: "rgba(6,182,212,0.7)",
                boxShadow: "0 0 40px rgba(6,182,212,0.25)",
                scale: 1.01
              }}
              transition={{
                borderColor: {
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                },
                boxShadow: {
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                },
                scale: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }
              }}
              className="border p-6 bg-[#16171D]/40 flex flex-col justify-between rounded-xl relative overflow-hidden text-left min-h-[440px]"
            >
              {/* Animated Sparkles and Shimmer Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Shimmer sweep effect */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 4.5,
                    ease: "easeInOut",
                    repeatDelay: 3
                  }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan/5 to-transparent skew-x-12"
                />
                
                {/* Floating Twinkling Sparkles Radial */}
                <motion.div
                  animate={{
                    opacity: [0.15, 0.45, 0.15],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.08),transparent_70%)]"
                />

                {/* Particle 1 */}
                <motion.div
                  initial={{ opacity: 0.1, scale: 0.6 }}
                  animate={{ 
                    opacity: [0.1, 0.9, 0.1],
                    scale: [0.6, 1.2, 0.6],
                    y: [0, -12, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    delay: 0.2,
                    ease: "easeInOut"
                  }}
                  className="absolute top-10 right-12 text-cyan/70"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-cyan/20" />
                </motion.div>

                {/* Particle 2 */}
                <motion.div
                  initial={{ opacity: 0.2, scale: 0.4 }}
                  animate={{ 
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.4, 1.0, 0.4],
                    y: [0, -8, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    delay: 1.5,
                    ease: "easeInOut"
                  }}
                  className="absolute top-28 left-8 text-cyan/50"
                >
                  <Sparkles className="w-3 h-3 fill-cyan/10" />
                </motion.div>

                {/* Particle 3 */}
                <motion.div
                  initial={{ opacity: 0.15, scale: 0.5 }}
                  animate={{ 
                    opacity: [0.15, 0.95, 0.15],
                    scale: [0.5, 1.3, 0.5],
                    y: [0, -15, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.5,
                    delay: 0.8,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-24 right-8 text-cyan/60"
                >
                  <Sparkles className="w-4 h-4 fill-cyan/20" />
                </motion.div>

                {/* Particle 4 */}
                <motion.div
                  initial={{ opacity: 0.1, scale: 0.5 }}
                  animate={{ 
                    opacity: [0.1, 0.7, 0.1],
                    scale: [0.5, 1.1, 0.5],
                    y: [0, -10, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4.5,
                    delay: 2.2,
                    ease: "easeInOut"
                  }}
                  className="absolute top-1/2 left-12 text-cyan/40"
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>

                {/* Sparkling/twinkling background dot 1 */}
                <motion.div
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  className="absolute top-6 left-1/3 w-1 h-1 bg-cyan rounded-full shadow-[0_0_8px_#06b6d4]"
                />

                {/* Sparkling/twinkling background dot 2 */}
                <motion.div
                  animate={{ opacity: [0.1, 0.9, 0.1] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: 1.2 }}
                  className="absolute bottom-16 left-1/4 w-1.5 h-1.5 bg-cyan rounded-full shadow-[0_0_10px_#06b6d4]"
                />
                
                {/* Sparkling/twinkling background dot 3 */}
                <motion.div
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: 0.1 }}
                  className="absolute top-20 right-24 w-1 h-1 bg-white rounded-full shadow-[0_0_6px_#ffffff]"
                />
              </div>

              <div className="relative z-10 flex flex-col justify-between h-full w-full">
                <div>
                  {/* Track badge */}
                  <div className="inline-block px-3 py-1 border border-cyan bg-transparent text-cyan text-[10px] font-mono font-bold tracking-wider rounded-full uppercase mb-5">
                    Premium Alpha
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    {masterclassActive ? (
                      <>
                        <span className="text-2xl font-sans font-bold text-cyan tracking-tight leading-none">
                          {useUSD ? "$149" : "₹9,999"}
                        </span>
                        <span className="text-xs font-sans font-medium text-[#A0A2B0]/60 line-through tracking-tight leading-none">
                          {useUSD ? "$199" : "₹12,999"}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan/10 text-cyan border border-cyan/20 animate-pulse uppercase tracking-wider ml-1">
                          SAVE {useUSD ? "$50" : "₹3,000"}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-sans font-bold text-white tracking-tight leading-none">
                        {useUSD ? "$199" : "₹12,999"}
                      </span>
                    )}
                  </div>

                  {/* Payment note */}
                  <p className="text-[10px] text-[#A0A2B0] font-sans mb-5 uppercase tracking-wider">
                    Single upfront seat payment
                  </p>

                  {/* Divider */}
                  <div className="h-[1px] bg-[#2A2A2A] w-full mb-5" />

                  {/* Feature list */}
                  <ul className="space-y-3.5 mb-6 text-left font-sans text-xs text-[#A0A2B0]">
                    <motion.li 
                      whileHover="hover"
                      className="flex items-start gap-2.5 group cursor-pointer"
                    >
                      <motion.div
                        variants={{
                          hover: { scale: 1.25, rotate: 10, y: -0.5 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <span className="group-hover:text-white transition-colors duration-200">13-day standalone Multi-Bot & Automation Studio curriculum</span>
                    </motion.li>
                    <motion.li 
                      whileHover="hover"
                      className="flex items-start gap-2.5 group cursor-pointer"
                    >
                      <motion.div
                        variants={{
                          hover: { scale: 1.25, rotate: 10, y: -0.5 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <span className="group-hover:text-white transition-colors duration-200">Hands-on build: design and ship a working multi-bot system across the program</span>
                    </motion.li>
                    <motion.li 
                      whileHover="hover"
                      className="flex items-start gap-2.5 group cursor-pointer"
                    >
                      <motion.div
                        variants={{
                          hover: { scale: 1.25, rotate: 10, y: -0.5 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <span className="group-hover:text-white transition-colors duration-200">1:1 architecture & workflow review session</span>
                    </motion.li>
                    <motion.li 
                      whileHover="hover"
                      className="flex items-start gap-2.5 group cursor-pointer"
                    >
                      <motion.div
                        variants={{
                          hover: { scale: 1.25, rotate: 10, y: -0.5 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <span className="group-hover:text-white transition-colors duration-200">Priority live Q&A access</span>
                    </motion.li>
                    <motion.li 
                      whileHover="hover"
                      className="flex items-start gap-2.5 group cursor-pointer"
                    >
                      <motion.div
                        variants={{
                          hover: { scale: 1.25, rotate: 10, y: -0.5 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <span className="group-hover:text-white transition-colors duration-200">Professionally packaged capstone write-up — ready to share with employers or clients</span>
                    </motion.li>
                    <motion.li 
                      whileHover="hover"
                      className="flex items-start gap-2.5 group cursor-pointer"
                    >
                      <motion.div
                        variants={{
                          hover: { scale: 1.25, rotate: 10, y: -0.5 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <span className="group-hover:text-white transition-colors duration-200">Small-batch cohort, capped seats for direct mentor attention</span>
                    </motion.li>
                    <motion.li 
                      whileHover="hover"
                      className="flex items-start gap-2.5 group cursor-pointer"
                    >
                      <motion.div
                        variants={{
                          hover: { scale: 1.25, rotate: 10, y: -0.5 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <span className="group-hover:text-white transition-colors duration-200">Completion certificate</span>
                    </motion.li>
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => {
                    const premiumTier = pricingTiers.find(t => t.id === "premium") || {
                      id: "premium",
                      name: "Premium Alpha",
                      subtitle: masterclassActive ? "Executive Masterclass Offer (reverts soon!)" : "13-Day standalone sprint",
                      priceINR: masterclassActive ? 9999 : 12999,
                      priceUSD: masterclassActive ? 149 : 199,
                      features: [
                        "13-day standalone Multi-Bot & Automation Studio curriculum",
                        "Hands-on build: design and ship a working multi-bot system across the program",
                        "1:1 architecture & workflow review session",
                        "Priority live Q&A access",
                        "Professionally packaged capstone write-up — ready to share with employers or clients",
                        "Small-batch cohort, capped seats for direct mentor attention",
                        "Completion certificate"
                      ],
                      isPremium: true
                    };
                    onUpgradeClick(premiumTier);
                  }}
                  className="w-full py-2.5 bg-cyan text-[#16171D] font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded cursor-pointer mt-auto"
                >
                  ENROLL NOW
                </button>
              </div>
            </motion.div>

          </div>

          {/* Savings Note */}
          <div className="text-center mt-8 mb-6 mx-auto max-w-[480px]">
            <p className="text-xs text-[#A0A0A0] font-sans leading-relaxed">
              Enrolling in both programs separately? Premium Alpha is the deeper standalone track — not an extension of Base Cohort. They cover different scopes. Pick the one that fits where you are.
            </p>
          </div>
        </div>
      </div>
  );
}
