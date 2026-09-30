import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, ShieldCheck, CheckCircle2, Lock, RefreshCw, CreditCard, Sparkles, Building2, Smartphone, Mail, User } from "lucide-react";

export interface PayUSessionData {
  txnid: string;
  courseId: string;
  courseName: string;
  originalPrice: number;
  offerPrice: number;
  offerActive: boolean;
  finalAmount: number;
  currency: string;
  redirectUrl: string;
}

interface PayUCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: PayUSessionData | null;
  onPaymentVerified: () => void;
  onOpenLegal?: (tab: "terms" | "privacy" | "refund" | "about") => void;
}

export default function PayUCheckoutModal({
  isOpen,
  onClose,
  sessionData,
  onPaymentVerified,
  onOpenLegal,
}: PayUCheckoutModalProps) {
  const [activePortalTab, setActivePortalTab] = useState<"payu_form" | "payu_iframe">("payu_form");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill user data if available
  useEffect(() => {
    if (sessionData) {
      setErrorMsg(null);
      setIsProcessing(false);
      setVerifiedSuccess(false);
    }
  }, [sessionData]);

  if (!isOpen || !sessionData) return null;

  const currencySymbol = sessionData.currency === "USD" ? "$" : "₹";
  const formattedAmount = `${currencySymbol}${sessionData.finalAmount.toLocaleString()}`;

  const fallbackUrl = (sessionData.courseId === "premium") ? "https://u.payu.in/1rC2wPC1aNFT" : "https://u.payu.in/crJLw8TgDtWB";

  const handleOpenGatewayTab = () => {
    const payuUrl = sessionData.redirectUrl || fallbackUrl;
    window.open(payuUrl, "_blank", "noopener,noreferrer");
  };

  const handleBookNowPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() && !email.trim()) {
      setErrorMsg("Please enter a valid Phone Number or Email Address to proceed.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/payu/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnid: sessionData.txnid,
          customer: {
            phone,
            email,
            name: customerName || "Cohort Student"
          }
        }),
      });

      const data = await res.json();
      if (data && data.verified) {
        setVerifiedSuccess(true);
        setTimeout(() => {
          onPaymentVerified();
        }, 1500);
      } else {
        setErrorMsg(data.error || "Payment failed on PayU Gateway. Please try again.");
      }
    } catch (err) {
      console.error("PayU processing error:", err);
      setErrorMsg("Connection error to PayU Gateway servers. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window matching PayU Official Interface */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-3xl bg-[#0f1117] border border-emerald-500/30 text-white rounded-2xl shadow-2xl overflow-hidden z-10 my-auto"
        >
          {/* PayU Brand Top Bar */}
          <div className="bg-[#151821] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded">
                <span className="font-extrabold text-black text-sm tracking-tighter font-sans">pay<span className="text-emerald-600">U</span></span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-white tracking-wide">
                  VANKAYALAPATI MALLIKHARJUNA RAO
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  VERIFIED PAYU MERCHANT // CODEXIA
                </span>
              </div>
            </div>

            {/* Portal Tab Switches */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePortalTab("payu_form")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activePortalTab === "payu_form"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Checkout Portal
              </button>
              <button
                type="button"
                onClick={() => setActivePortalTab("payu_iframe")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activePortalTab === "payu_iframe"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Web Staging Preview
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white border border-transparent hover:border-white/10 rounded-lg transition-all ml-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {verifiedSuccess ? (
            /* Success View */
            <div className="p-10 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">
                Payment Successful & Verified!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your payment of <strong className="text-emerald-400 font-mono">{formattedAmount}</strong> was confirmed by PayU Gateway.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs animate-pulse">
                <Sparkles className="w-4 h-4" />
                Unlocking Cohort Access & Redirecting...
              </div>
            </div>
          ) : activePortalTab === "payu_iframe" ? (
            /* Dedicated Secure External Launch View (Prevents iframe X-Frame-Options & BotD rate-limit rejections) */
            <div className="p-8 flex flex-col items-center text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ExternalLink className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Official PayU Gateway Checkout
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  For banking compliance and anti-fraud protection, PayU requires completing payment directly in a secure, authenticated browser tab.
                </p>
              </div>

              <div className="w-full max-w-md p-4 bg-[#12141d] rounded-xl border border-white/10 text-left space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Selected Program:</span>
                  <span className="text-white font-bold">{sessionData.courseName}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Locked Amount:</span>
                  <span className="text-emerald-400 font-bold">{formattedAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Gateway Provider:</span>
                  <span className="text-white">PayU Payments Private Limited</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenGatewayTab}
                className="w-full max-w-md py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Open Official PayU Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleBookNowPayment}
                className="w-full max-w-md py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-mono font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/10"
              >
                <span>Verify Status & Grant Access</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Split Gateway View (Exact match of User's Image 1) */
            <div className="grid grid-cols-1 md:grid-cols-12 bg-[#0d0e13]">
              {/* Left Column - Merchant & Item Details */}
              <div className="md:col-span-5 p-6 bg-[#12141d] border-r border-white/5 flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <div className="bg-white px-3 py-1.5 rounded inline-block mb-3 shadow-sm">
                      <span className="font-black text-black text-lg tracking-tighter font-sans">pay<span className="text-emerald-600">U</span></span>
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-snug">
                      VANKAYALAPATI MALLIKHARJUNA RAO
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      MERCHANT ID: PAYU_CODEXIA_PROD
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block mb-1">
                        ITEM
                      </span>
                      <p className="text-base font-bold text-white uppercase tracking-wide">
                        {sessionData.courseName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Authoritative Cohort Seat Allocation
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Original Price:</span>
                        <span className="line-through text-slate-500">
                          {currencySymbol}{sessionData.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      {sessionData.offerActive && (
                        <div className="flex justify-between font-bold text-emerald-400">
                          <span>Launch Offer Price:</span>
                          <span>{formattedAmount}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-emerald-500/20 flex justify-between font-mono font-bold text-white text-sm">
                        <span>Amount Due:</span>
                        <span className="text-emerald-400">{formattedAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Lock className="w-3 h-3" />
                    <span>256-Bit SSL PayU Encrypted</span>
                  </div>
                  <p>Transaction ID: {sessionData.txnid}</p>
                </div>
              </div>

              {/* Right Column - Payment Form (Exact Image 1 layout) */}
              <div className="md:col-span-7 p-6 sm:p-8 bg-[#0f1117] flex flex-col justify-between">
                <form onSubmit={handleBookNowPayment} className="space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                      PAYMENT DETAILS
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE PAYU GATEWAY
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
                      {errorMsg}
                    </div>
                  )}

                  {/* Enter Amount to Pay (Pre-filled & Verified by Server) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Enter amount to pay
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 top-0 bottom-0 px-3.5 bg-slate-800 border-r border-slate-700 rounded-l-lg flex items-center text-slate-300 font-bold text-sm">
                        {currencySymbol}
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={sessionData.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        className="w-full bg-[#171922] border border-slate-700 text-white pl-12 pr-4 py-2.5 rounded-lg text-sm font-bold font-mono focus:outline-none cursor-not-allowed"
                      />
                      <span className="absolute right-3 text-[10px] font-mono text-emerald-400 uppercase font-bold">
                        VERIFIED PRICE
                      </span>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-slate-400 text-xs font-mono font-bold">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Enter Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#171922] border border-slate-700 focus:border-emerald-500 text-white pl-12 pr-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#171922] border border-slate-700 focus:border-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Customer Name <span className="text-slate-500 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#171922] border border-slate-700 focus:border-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {/* BOOK NOW Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-black font-sans font-bold text-sm uppercase tracking-wider rounded-lg transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>PROCESSING THROUGH PAYU...</span>
                      </>
                    ) : (
                      <span>BOOK NOW</span>
                    )}
                  </button>
                </form>

                {/* External Portal Option */}
                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <p className="text-[11px] text-slate-400 mb-2">
                    Prefer opening on PayU's hosted page?
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenGatewayTab}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono font-bold underline cursor-pointer"
                  >
                    <span>Launch PayU Web Staging Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Legal Footer */}
          <div className="bg-[#12141c] px-6 py-3 border-t border-white/10 flex flex-wrap justify-between items-center text-[10px] text-slate-400 font-sans">
            <span>Powered by PayU Payment Gateway & Codexia Engine</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenLegal?.("terms")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal?.("privacy")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal?.("refund")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
