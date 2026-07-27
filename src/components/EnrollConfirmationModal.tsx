import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Star, ShieldCheck, Sparkles, Percent, HelpCircle } from "lucide-react";
import { PricingTier } from "../types";

interface EnrollConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tier: PricingTier | null;
  currency: "INR" | "USD";
  masterclassActive: boolean;
  onOpenLegal?: (tab: "terms" | "privacy" | "refund" | "about") => void;
}

export default function EnrollConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  tier,
  currency,
  masterclassActive,
  onOpenLegal,
}: EnrollConfirmationModalProps) {
  if (!isOpen || !tier) return null;

  const isINR = currency === "INR";
  
  // Calculate price and savings
  const priceDisplay = isINR 
    ? `₹${tier.priceINR.toLocaleString()}` 
    : `$${tier.priceUSD}`;

  const originalPrice = isINR
    ? (tier.id === "premium" ? "₹12,999" : "₹4,999")
    : (tier.id === "premium" ? "$199" : "$79");

  const savingsDisplay = isINR
    ? (tier.id === "premium" ? "₹3,000" : "₹1,000")
    : (tier.id === "premium" ? "$50" : "$20");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#111218] border border-white/10 text-white p-6 md:p-8 font-sans shadow-2xl overflow-hidden rounded-2xl z-10"
        >
          {/* Subtle cyber grid background accent */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Header Banner */}
          <div className="relative flex justify-between items-start pb-5 border-b border-white/5 mb-6 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan shrink-0">
                {tier.isPremium ? <Star className="w-5 h-5 fill-cyan" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A0A2B0]">
                  CONFIRM ENROLLMENT
                </h2>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Review selected seat allocation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Plan Summary Card */}
          <div className="relative bg-[#171922] border border-white/5 rounded-xl p-5 mb-6 z-10">
            {/* Savings Badge */}
            {masterclassActive && (
              <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-cyan/10 text-cyan border border-cyan/20 uppercase tracking-wider">
                <Percent className="w-3 h-3" />
                SAVE {savingsDisplay}
              </div>
            )}

            <div className="mb-4">
              <span className="text-[9px] font-mono text-[#E58A3C] uppercase tracking-wider block mb-1">
                {tier.isPremium ? "EXECUTIVE TRACK" : "STANDARD TRACK"}
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-white mb-0.5">
                {tier.name}
              </h3>
              <p className="text-xs text-slate-400">
                {tier.subtitle}
              </p>
            </div>

            {/* Price Section */}
            <div className="pt-4 border-t border-white/5 flex items-baseline gap-2.5">
              <span className="text-3xl font-sans font-bold text-cyan">
                {priceDisplay}
              </span>
              {masterclassActive && (
                <span className="text-sm font-sans font-medium text-slate-500 line-through">
                  {originalPrice}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono uppercase ml-auto">
                Taxes included
              </span>
            </div>
          </div>

          {/* Key Deliverables */}
          <div className="mb-6 z-10 relative">
            <h4 className="text-[10px] font-mono text-[#A0A2B0] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
              Syllabus Deliverables Included:
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-300">
              {tier.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Double Check Prompt */}
          <div className="flex gap-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 mb-6 z-10 relative">
            <HelpCircle className="w-5 h-5 text-[#E58A3C] shrink-0 mt-0.5 animate-pulse" />
            <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
              <span className="font-semibold text-white block mb-0.5">Preventing Accidental Clicks</span>
              You are about to initiate the secure payment gateway for <strong className="text-white font-semibold">{tier.name}</strong>. Please confirm this action to proceed.
            </div>
          </div>

          {/* Legal Terms & Policy Notice */}
          <p className="text-[10px] text-slate-400 font-sans text-center mb-4 z-10 relative">
            By proceeding, you agree to Codexia's{" "}
            <button
              type="button"
              onClick={() => onOpenLegal?.("terms")}
              className="text-cyan underline hover:text-white transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => onOpenLegal?.("refund")}
              className="text-cyan underline hover:text-white transition-colors cursor-pointer"
            >
              Refund Policy
            </button>.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 z-10 relative">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-cyan text-black font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-lg cursor-pointer text-center"
            >
              Confirm & Pay
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
