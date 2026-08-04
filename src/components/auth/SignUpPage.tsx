import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CodexiaLogo from "../CodexiaLogo";

interface SignUpPageProps {
  onNavigateToSignIn?: () => void;
  onSuccessRedirect?: () => void;
}

export default function SignUpPage({
  onNavigateToSignIn,
  onSuccessRedirect
}: SignUpPageProps) {
  const { signupEmail, loginGoogle, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateFields = (): boolean => {
    setLocalError(null);
    setAuthError(null);

    if (!email.trim()) {
      setLocalError("Please enter your work email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setLocalError("Please enter a password.");
      return false;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match. Please verify both fields.");
      return false;
    }
    return true;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    try {
      await signupEmail(email.trim(), password);
      if (onSuccessRedirect) {
        onSuccessRedirect();
      }
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLocalError(null);
    setAuthError(null);
    setGoogleLoading(true);

    try {
      await loginGoogle();
      if (onSuccessRedirect) {
        onSuccessRedirect();
      }
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setGoogleLoading(false);
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
        {/* Header Branding */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="mb-4 p-2 rounded-xl bg-cyan/5 border border-cyan/20">
            <CodexiaLogo size="md" showText={false} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
            <UserCheck className="w-3.5 h-3.5 text-cyan" />
            <span>Create New User Profile</span>
          </div>
          <h1 className="text-2xl font-sans font-bold text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Join Codexia to build and deploy AI agent systems
          </p>
        </div>

        {/* Error Notification Alert */}
        {activeError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-sans flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-mono text-[10px] uppercase font-bold text-red-300 block mb-0.5">
                Registration Failed
              </span>
              <span>{activeError}</span>
            </div>
          </motion.div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-sans font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{googleLoading ? "Connecting to Google..." : "Sign up with Google"}</span>
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2a2c38]" />
          </div>
          <span className="relative px-3 bg-[#12131A] text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            OR SIGN UP WITH EMAIL
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUpSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
              Work Email Address
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

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
              Create Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-sans"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 bg-cyan text-[#0B0C10] font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan/20 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        {onNavigateToSignIn && (
          <div className="mt-8 pt-6 border-t border-[#2a2c38]/60 text-center text-xs font-sans text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToSignIn}
              className="text-cyan font-mono font-bold hover:underline cursor-pointer ml-1"
            >
              Sign In Instead →
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
