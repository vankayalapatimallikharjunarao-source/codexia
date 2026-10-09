import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Star, ShieldCheck, Sparkles, Percent, User, Mail, Phone, ArrowRight, ArrowUpRight } from "lucide-react";
import { PricingTier } from "../types";

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
}

interface EnrollConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customer: CustomerDetails) => void;
  tier: PricingTier | null;
  currency: "INR" | "USD";
  masterclassActive: boolean;
  onOpenLegal?: (tab: "terms" | "privacy" | "refund" | "about") => void;
  initialCustomer?: Partial<CustomerDetails>;
}

export default function EnrollConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  tier,
  currency,
  masterclassActive,
  onOpenLegal,
  initialCustomer,
}: EnrollConfirmationModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFullName(initialCustomer?.fullName || "");
      setEmail(initialCustomer?.email || "");
      setPhone(initialCustomer?.phone || "");
      setErrors({});
    }
  }, [isOpen]);

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

  const validate = (): boolean => {
    const newErrors: { fullName?: string; email?: string; phone?: string } = {};

    const nameTrimmed = fullName.trim();
    if (!nameTrimmed) {
      newErrors.fullName = "Full Name is required";
    }

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed) {
      newErrors.email = "Email Address is required";
    } else if (!emailRegex.test(emailTrimmed)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = "Phone number must contain exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate()) {
      onConfirm({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, "")
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#111218] border border-white/10 text-white p-6 md:p-8 font-sans shadow-2xl overflow-hidden rounded-2xl z-10 my-8"
        >
          {/* Subtle cyber grid background accent */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Header Banner */}
          <div className="relative flex justify-between items-start pb-4 border-b border-white/5 mb-5 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan shrink-0">
                {tier.isPremium ? <Star className="w-5 h-5 fill-cyan" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A0A2B0]">
                  ENROLLMENT DETAILS
                </h2>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Provide student information for PayU checkout
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Plan Summary Card */}
          <div className="relative bg-[#171922] border border-white/5 rounded-xl p-4 mb-5 z-10">
            {/* Savings Badge */}
            {masterclassActive && (
              <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-cyan/10 text-cyan border border-cyan/20 uppercase tracking-wider">
                <Percent className="w-3 h-3" />
                SAVE {savingsDisplay}
              </div>
            )}

            <div className="mb-3">
              <span className="text-[9px] font-mono text-[#E58A3C] uppercase tracking-wider block mb-0.5">
                {tier.isPremium ? "EXECUTIVE TRACK" : "STANDARD TRACK"}
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white mb-0.5">
                {tier.name}
              </h3>
              <p className="text-xs text-slate-400">
                {tier.subtitle}
              </p>
            </div>

            {/* Price Section */}
            <div className="pt-3 border-t border-white/5 flex items-baseline gap-2.5">
              <span className="text-2xl font-sans font-bold text-cyan">
                {priceDisplay}
              </span>
              {masterclassActive && (
                <span className="text-xs font-sans font-medium text-slate-500 line-through">
                  {originalPrice}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono uppercase ml-auto">
                Taxes included
              </span>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="mb-5 z-10 relative space-y-3.5">
            <div className="text-[10px] font-mono text-[#A0A2B0] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/5">
              <User className="w-3.5 h-3.5 text-cyan" />
              Student Contact Information
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="Enter student full name"
                  className={`w-full bg-[#171922] border ${errors.fullName ? 'border-red-500' : 'border-white/10 focus:border-cyan'} rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors font-sans`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[10px] text-red-400 font-mono mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="e.g. student@example.com"
                  className={`w-full bg-[#171922] border ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-cyan'} rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors font-sans`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-400 font-mono mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-300 mb-1">
                Phone Number (10 Digits) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhone(val);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="e.g. 9876543210"
                  maxLength={15}
                  className={`w-full bg-[#171922] border ${errors.phone ? 'border-red-500' : 'border-white/10 focus:border-cyan'} rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors font-sans`}
                />
              </div>
              {errors.phone && (
                <p className="text-[10px] text-red-400 font-mono mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Legal Terms & Policy Notice */}
            <p className="text-[10px] text-slate-400 font-sans text-center pt-2">
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
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-cyan text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-cyan/90 transition-all rounded-lg cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-cyan/20"
              >
                Proceed to PayU
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

