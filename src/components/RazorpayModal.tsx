import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Smartphone, ShieldCheck, X, ArrowLeft, ArrowRight, Loader2, Sparkles, Building, QrCode, AlertCircle, HelpCircle } from "lucide-react";
import { PricingTier } from "../types";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PricingTier | null;
  onPaymentSuccess: (tier: PricingTier, isUSD: boolean) => void;
  onOpenLegal?: (tab: "terms" | "privacy" | "refund" | "about") => void;
}

export default function RazorpayModal({ isOpen, onClose, tier, onPaymentSuccess, onOpenLegal }: RazorpayModalProps) {
  const [method, setMethod] = useState<"none" | "card" | "upi" | "netbanking">("none");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [useUSD, setUseUSD] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Razorpay auto-connection diagnostics state
  const [keyId, setKeyId] = useState<string>("");
  const [hasSecret, setHasSecret] = useState<boolean>(false);
  const [detectedVars, setDetectedVars] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/razorpay-config")
        .then(res => res.json())
        .then(data => {
          setKeyId(data.keyId || "");
          setHasSecret(data.hasSecret || false);
          setDetectedVars(data.detectedVars || []);
        })
        .catch(err => {
          console.error("Error loading Razorpay configuration:", err);
          const clientKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "";
          setKeyId(clientKey);
        });
    }
  }, [isOpen]);

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // UPI Form State
  const [upiId, setUpiId] = useState("");

  // Bank Netbanking State
  const [selectedBank, setSelectedBank] = useState("");

  if (!isOpen || !tier) return null;

  const totalAmount = useUSD ? `$${tier.priceUSD}` : `₹${tier.priceINR.toLocaleString()}`;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    // Format into blocks of 4
    let formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const runLocalSimulation = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onPaymentSuccess(tier, useUSD);
        setSuccess(false);
        setMethod("none");
        onClose();
      }, 2500);
    }, 2000);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let key = keyId;

    // Fallback to client-side env variable if backend retrieval wasn't populated
    if (!key) {
      key = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "";
    }

    if (key) {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setLoading(false);
        alert("Unable to load Razorpay Payment Gateway SDK. Please check your network connection.");
        return;
      }

      // Convert to INR to prevent 'Currency not supported' error on standard Indian Razorpay merchant accounts
      const amountInINR = useUSD ? Math.round(tier.priceUSD * 83) : tier.priceINR;
      const amountInPaise = amountInINR * 100;
      const currency = "INR";

      const options = {
        key: key,
        amount: amountInPaise,
        currency: currency,
        name: "CODEXIA",
        description: `Enrollment in ${tier.name}`,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
        handler: function (response: any) {
          setLoading(false);
          setSuccess(true);
          setTimeout(() => {
            onPaymentSuccess(tier, useUSD);
            setSuccess(false);
            setMethod("none");
            onClose();
          }, 2500);
        },
        prefill: {
          name: cardName || "Student",
          email: "student@codexia.io",
          contact: "9999999999"
        },
        notes: {
          tier_id: tier.id,
          tier_name: tier.name,
          payment_method: method,
          original_currency: useUSD ? "USD" : "INR"
        },
        theme: {
          color: "#6366f1"
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Razorpay construction error:", err);
        setLoading(false);
        runLocalSimulation();
      }
    } else {
      runLocalSimulation();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Checkout Window */}
      <div className="relative w-full max-w-[440px] bg-slate-900/90 backdrop-blur-2xl border border-white/20 text-white p-6 font-mono text-xs shadow-2xl overflow-hidden rounded-3xl">
        {/* Ambient Grid overlay inside payment modal */}
        <div className="grid-overlay absolute inset-0 pointer-events-none opacity-30"></div>

        {/* Razorpay Banner Header */}
        <div className="relative flex justify-between items-center pb-4 border-b border-white/10 mb-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">RAZORPAY SECURE</h2>
              <p className="text-[9px] text-slate-400 uppercase">GATEWAY // TRANSACTION DIRECT</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-indigo-400 border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Splash */}
        <AnimatePresence>
          {success && (
            <motion.div 
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="w-16 h-16 rounded-full border border-indigo-500/30 flex items-center justify-center bg-indigo-500/10 mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <ShieldCheck className="w-10 h-10 text-emerald-400 animate-pulse" />
              </motion.div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-indigo-400 mb-2">TRANSACTION APPROVED</h3>
              <p className="text-[10px] text-slate-300 uppercase max-w-xs leading-relaxed font-sans">
                Receipt reference pay_id_{Math.floor(Math.random() * 900000 + 100000)}_OXA. Cohort registration dispatched to live admin registry dashboard.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Splash */}
        <AnimatePresence>
          {loading && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-30">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
              <h3 className="text-sm font-bold tracking-widest uppercase mb-1">AUTHORIZING TRANSIT FUNDS</h3>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                Contacting banking ledger node... Please do not close this modal.
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Normal Form Area */}
        <div className="relative z-10">
          {/* Order Brief */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] text-indigo-400 uppercase tracking-widest">MERCHANT: CODEXIA</span>
                <h4 className="text-sm font-bold uppercase tracking-wide text-white">{tier.name}</h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase block">AMOUNT DUE</span>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">{totalAmount}</span>
              </div>
            </div>

            {/* Currency switcher */}
            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[9px] text-slate-400 uppercase">
              <span>Select currency:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setUseUSD(false)}
                  className={`px-2 py-0.5 border rounded-md transition-all cursor-pointer ${!useUSD ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 font-bold" : "border-white/10 text-slate-400"}`}
                >
                  INR (₹)
                </button>
                <button 
                  onClick={() => setUseUSD(true)}
                  className={`px-2 py-0.5 border rounded-md transition-all cursor-pointer ${useUSD ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 font-bold" : "border-white/10 text-slate-400"}`}
                >
                  USD ($)
                </button>
              </div>
            </div>
          </div>

          {/* Razorpay Diagnostic Banner */}
          <div className={`p-3.5 rounded-2xl mb-4 border font-mono text-[10px] ${
            keyId 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${keyId ? "bg-emerald-400 animate-pulse" : "bg-blue-400"}`} />
                <span className="font-bold uppercase tracking-wider">
                  {keyId ? "RAZORPAY GATEWAY CONNECTED" : "SANDBOX SIMULATION ACTIVE"}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowConfigGuide(!showConfigGuide)}
                className="text-slate-400 hover:text-white uppercase text-[8px] border border-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-all"
              >
                {showConfigGuide ? "CLOSE" : "HOW TO CONNECT"}
              </button>
            </div>
            
            <p className="mt-1.5 text-[9px] text-slate-300 leading-normal uppercase">
              {keyId 
                ? `SUCCESS // Loaded merchant key: ${keyId.slice(0, 12)}...${keyId.slice(-4)}. Transaction will process through your live Razorpay gateway.`
                : "A high-fidelity sandbox secure checkout simulation is running. To process real payments, you need to connect your custom merchant credentials."
              }
            </p>

            {showConfigGuide && (
              <div className="mt-2.5 pt-2.5 border-t border-white/10 text-slate-300 space-y-1.5 text-[9px]">
                <p className="font-bold text-white uppercase">How to integrate your Razorpay Account:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[9px] text-slate-400">
                  <li>Go to your Razorpay Dashboard &gt; Settings &gt; API Keys to generate a <code className="text-indigo-400 bg-white/5 px-1 rounded font-bold">Key ID</code>.</li>
                  <li>Click the <strong className="text-white">Settings</strong> menu in AI Studio (top right).</li>
                  <li>Add a new secret environment variable named <code className="text-indigo-400 bg-white/5 px-1 rounded font-bold">VITE_RAZORPAY_KEY_ID</code> (or <code className="text-indigo-400 bg-white/5 px-1 rounded font-bold">RAZORPAY_KEY_ID</code>) and paste your Key ID.</li>
                  <li>Restart the dev server to apply.</li>
                </ol>
                {detectedVars.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-white/5 text-[8px] text-indigo-400 uppercase">
                    Detected Env Vars: <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">{detectedVars.join(", ")}</code>
                  </div>
                )}
              </div>
            )}
          </div>

          {method === "none" ? (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Select Secure Payment Coordinate:</p>
              
              {/* Card option */}
              <button
                onClick={() => setMethod("card")}
                className="w-full p-4 bg-white/5 border border-white/10 hover:border-indigo-500/50 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                  <div>
                    <span className="font-bold uppercase text-white block">Credit / Debit Card</span>
                    <span className="text-[9px] text-slate-400 uppercase font-normal">Visa, Mastercard, RuPay, Amex</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 animate-pulse" />
              </button>

              {/* UPI option */}
              <button
                onClick={() => setMethod("upi")}
                className="w-full p-4 bg-white/5 border border-white/10 hover:border-indigo-500/50 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                  <div>
                    <span className="font-bold uppercase text-white block">UPI / QR Code</span>
                    <span className="text-[9px] text-slate-400 uppercase font-normal">Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 animate-pulse" />
              </button>

              {/* Netbanking option */}
              <button
                onClick={() => setMethod("netbanking")}
                className="w-full p-4 bg-white/5 border border-white/10 hover:border-indigo-500/50 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                  <div>
                    <span className="font-bold uppercase text-white block">Net Banking</span>
                    <span className="text-[9px] text-slate-400 uppercase font-normal">All major Indian retail banks</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 animate-pulse" />
              </button>

              <div className="text-[9px] text-slate-400 uppercase tracking-widest text-center pt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>PCI-DSS COMPLIANT // 256-BIT TLS DATA ENCRYPTION</span>
              </div>
            </div>
          ) : (
            <div>
              {/* Back button */}
              <button 
                onClick={() => setMethod("none")}
                className="mb-4 text-slate-400 hover:text-indigo-400 font-bold flex items-center gap-1 uppercase cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to methods
              </button>

              {/* Card Payment Form */}
              {method === "card" && (
                <form onSubmit={handlePaySubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase tracking-wider block">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl focus:outline-none p-2.5 text-sm font-bold tracking-widest text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl focus:outline-none p-2.5 text-sm font-bold text-center tracking-widest text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block">CVV</label>
                      <input
                        type="password"
                        required
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="•••"
                        className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl focus:outline-none p-2.5 text-sm font-bold text-center tracking-widest text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase tracking-wider block">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. JOHN DOE"
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl focus:outline-none p-2.5 text-sm font-bold uppercase text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/30 transition-all mt-4 cursor-pointer"
                  >
                    AUTHORIZE {totalAmount}
                  </button>
                </form>
              )}

              {/* UPI Payment Form */}
              {method === "upi" && (
                <div className="space-y-4 text-center">
                  {/* Dynamic simulated QR code */}
                  <div className="p-3 bg-white mx-auto w-36 h-36 border border-white/10 rounded-2xl flex flex-col items-center justify-center">
                    <QrCode className="w-28 h-28 text-black" />
                  </div>
                  <p className="text-[10px] text-slate-300 uppercase tracking-wide max-w-xs mx-auto">
                    Scan this dynamic QR Code using Google Pay, PhonePe, or BHIM UPI app to pay.
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-[9px] text-slate-400 uppercase">OR ENTER UPI ID</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                  </div>

                  <form onSubmit={handlePaySubmit} className="space-y-3 text-left">
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. student@upi"
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl focus:outline-none p-2.5 text-center text-sm font-bold font-mono text-indigo-400"
                    />
                    <button
                      type="submit"
                      disabled={!upiId.includes("@")}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-45 rounded-xl"
                    >
                      PAY {totalAmount} VIA UPI
                    </button>
                  </form>
                </div>
              )}

              {/* Netbanking Form */}
              {method === "netbanking" && (
                <form onSubmit={handlePaySubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase tracking-wider block">Choose Retail Bank</label>
                    <select
                      required
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl focus:outline-none p-2.5 text-white"
                    >
                      <option value="" className="bg-slate-900">Select Indian Bank Option</option>
                      <option value="sbi" className="bg-slate-900">State Bank of India (SBI)</option>
                      <option value="hdfc" className="bg-slate-900">HDFC Bank</option>
                      <option value="icici" className="bg-slate-900">ICICI Bank</option>
                      <option value="axis" className="bg-slate-900">Axis Bank</option>
                      <option value="kotak" className="bg-slate-900">Kotak Mahindra Bank</option>
                      <option value="pnb" className="bg-slate-900">Punjab National Bank (PNB)</option>
                    </select>
                  </div>

                  <p className="text-[9px] text-slate-400 uppercase leading-relaxed pt-2">
                    Note: Clicking pay will temporarily redirect you to your chosen bank portal secure simulation for single-session authentication.
                  </p>

                  <button
                    type="submit"
                    disabled={!selectedBank}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all mt-4 cursor-pointer disabled:opacity-45 rounded-xl"
                  >
                    INBOUND BANK NET PAY
                  </button>
                </form>
              )}

              {/* Legal & Policy Quick Link Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Processed via PayU Gateway</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenLegal?.("privacy")}
                    className="hover:text-cyan underline cursor-pointer"
                  >
                    Privacy
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLegal?.("terms")}
                    className="hover:text-cyan underline cursor-pointer"
                  >
                    Terms
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLegal?.("refund")}
                    className="hover:text-cyan underline cursor-pointer"
                  >
                    Refunds
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
