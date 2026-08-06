import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, ArrowLeft, Loader2, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CodexiaLogo from "../CodexiaLogo";

interface ForgotPasswordPageProps {
  onNavigateToSignIn?: () => void;
}

export default function ForgotPasswordPage({
  onNavigateToSignIn
}: ForgotPasswordPageProps) {
  const { forgotPassword, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);

    if (!email.trim()) {
      setLocalError("Please enter your registered email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      // Handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md bg-[#12131A]/95 border border-[#2a2c38] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl"
      >
        {/* Header Header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="mb-4 p-2 rounded-xl bg-cyan/5 border border-cyan/20">
            <CodexiaLogo size="md" showText={false} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
            <KeyRound className="w-3.5 h-3.5 text-cyan" />
            <span>Account Credential Recovery</span>
          </div>
          <h1 className="text-2xl font-sans font-bold text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Enter your email to receive a secure password reset link
          </p>
        </div>

        {/* Error Notification Alert */}
        {activeError && !success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-sans flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-mono text-[10px] uppercase font-bold text-red-300 block mb-0.5">
                Recovery Error
              </span>
              <span>{activeError}</span>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-4"
          >
            <div className="w-14 h-14 bg-cyan/10 border border-cyan/40 rounded-full flex items-center justify-center text-cyan mx-auto shadow-lg shadow-cyan/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold uppercase text-cyan tracking-wider">
                Reset Link Dispatched
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                We have dispatched password reset instructions to{" "}
                <strong className="text-white font-mono">{email}</strong>. Please check your inbox and follow the link.
              </p>
            </div>
            {onNavigateToSignIn && (
              <button
                type="button"
                onClick={onNavigateToSignIn}
                className="w-full mt-4 py-3 px-4 bg-cyan text-[#0B0C10] font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
            )}
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-cyan text-[#0B0C10] font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>

            {/* Back link */}
            {onNavigateToSignIn && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={onNavigateToSignIn}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}
