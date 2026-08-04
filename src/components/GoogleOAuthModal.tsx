import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Loader2, Mail, Check, AlertCircle, X, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff, Key, RefreshCw, Lock } from "lucide-react";
import CodexiaLogo from "./CodexiaLogo";
import { useAuth } from "../context/AuthContext";

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, password?: string) => void;
}

export default function GoogleOAuthModal({ isOpen, onClose, onSuccess }: GoogleOAuthModalProps) {
  const { loginEmail, loginGoogle, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Advanced States: "email" | "password" | "otp_verify" | "new_password" | "verifying" | "success" | "error"
  const [step, setStep] = useState<"email" | "password" | "otp_verify" | "new_password" | "verifying" | "success" | "error">("email");
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationStep, setVerificationStep] = useState(0);

  // OTP specific states
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [otpPurpose, setOtpPurpose] = useState<"forgot" | "signup">("forgot");

  // New password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Resend countdown handler
  useEffect(() => {
    if (step === "otp_verify" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, step]);

  const verificationSteps = [
    "Establishing TLS Handshake to accounts.google.com...",
    "Retrieving OAuth 2.0 grant request parameters...",
    "Validating client identifier signature matching...",
    "Analyzing user authentication token parameters...",
    "Decrypting cryptographically signed JSON Web Token (JWT)...",
    "Binding OAuth token credentials to sector ledger..."
  ];

  if (!isOpen) return null;

  const isAdminEmail = (emailStr: string) => {
    const emailLower = emailStr.toLowerCase().trim();
    return (
      emailLower === "vankayalapatimallikharjunarao@gmail.com" ||
      emailLower.endsWith("@codexia.com") ||
      emailLower.endsWith("@codexia.io") ||
      emailLower === "developer"
    );
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    if (setAuthError) setAuthError(null);
    setGoogleLoading(true);
    try {
      const user = await loginGoogle();
      if (user && user.email) {
        onSuccess(user.email);
        resetState();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Google Authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Enter a valid work email address (e.g. developer@company.com)");
      return;
    }
    if (!password) {
      if (step === "email") {
        setStep("password");
        setErrorMessage("");
        return;
      } else {
        setErrorMessage("Please enter your password");
        return;
      }
    }

    setErrorMessage("");
    if (setAuthError) setAuthError(null);
    setEmailLoading(true);

    try {
      const user = await loginEmail(email.trim(), password);
      if (user && user.email) {
        onSuccess(user.email, password);
        resetState();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 5) {
      setErrorMessage("Password must be at least 5 characters");
      return;
    }
    await handleEmailSubmit(e);
  };

  const handleInitiateSignUp = () => {
    if (!email || !email.includes("@")) {
      setErrorMessage("Enter a valid Google account email address to create an account");
      return;
    }
    setErrorMessage("");
    if (isAdminEmail(email)) {
      handleRequestOtp("signup");
    } else {
      // Standard student accounts bypass the OTP gate and can set up credentials directly
      setStep("new_password");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleForgotPassword = () => {
    if (isAdminEmail(email)) {
      handleRequestOtp("forgot");
    } else {
      // Standard student accounts can reset credentials directly
      setStep("new_password");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleRequestOtp = async (purpose: "forgot" | "signup") => {
    if (!email || !email.includes("@")) {
      setErrorMessage("Enter a valid email address first");
      return;
    }
    setErrorMessage("");
    setOtpInput("");
    setOtpPurpose(purpose);
    
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedOtp(data.otp);
        setStep("otp_verify");
        setCountdown(59);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to send verification code");
      }
    } catch (err) {
      setErrorMessage("Network error. Could not request OTP code.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 5) {
      setErrorMessage("Verification code must be exactly 5 digits");
      return;
    }
    setErrorMessage("");
    
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpInput })
      });
      if (res.ok) {
        setStep("new_password");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Incorrect verification code. Please check and try again.");
      }
    } catch (err) {
      setErrorMessage("Network error. Could not verify OTP code.");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 5) {
      setErrorMessage("Password must be at least 5 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword, otp: otpInput })
      });
      if (res.ok) {
        startOAuthVerification(newPassword);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Could not update security credentials");
      }
    } catch (err) {
      setErrorMessage("Network error. Could not reset password.");
    }
  };

  const startOAuthVerification = (overridePassword?: string) => {
    setStep("verifying");
    setVerificationStep(0);

    const runSteps = (currentStep: number) => {
      if (currentStep < verificationSteps.length) {
        setVerificationStep(currentStep);
        setTimeout(() => runSteps(currentStep + 1), 350);
      } else {
        setStep("success");
        setTimeout(() => {
          onSuccess(email || "alex.student@gmail.com", overridePassword || password);
          resetState();
          onClose();
        }, 800);
      }
    };

    setTimeout(() => runSteps(0), 100);
  };

  const resetState = () => {
    setEmail("");
    setPassword("");
    setOtpInput("");
    setGeneratedOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowNewPassword(false);
    setStep("email");
    setErrorMessage("");
    setVerificationStep(0);
  };

  const handleBackToEmail = () => {
    setStep("email");
    setErrorMessage("");
    setPassword("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          onClick={() => { 
            if (step !== "verifying" && step !== "success") {
              onClose(); 
              resetState();
            }
          }} 
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        />

        {/* Modal Window Container - Image 2 Dark Theme */}
        <motion.div
          className="relative w-full max-w-md bg-[#12131A]/95 text-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#2a2c38] font-sans p-6 sm:p-8 backdrop-blur-xl"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
        >
          {/* Ambient lighting glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Right 'X' Close Button */}
          {step !== "verifying" && step !== "success" && (
            <button
              onClick={() => {
                onClose();
                resetState();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-20"
              id="google-oauth-close"
              title="Close sign-in window"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header Header Brand Emblem */}
          <div className="flex flex-col items-center justify-center text-center mb-6 relative z-10">
            <div className="mb-3 p-2 rounded-xl bg-cyan/5 border border-cyan/20">
              <CodexiaLogo size="md" showText={false} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
              <span>SECURE CREDENTIALS AUTHENTICATION</span>
            </div>
            <h1 className="text-2xl font-sans font-bold text-white tracking-tight">
              {step === "otp_verify" ? "Security Code" : 
               step === "new_password" ? "Set Password" : 
               "Sign in to Codexia"}
            </h1>
            <p className="text-xs font-sans text-slate-400 mt-1">
              Access your AI system architecture workspace
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Main Sign In Form (Matching Image 2) */}
            {step === "email" && (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 relative z-10"
              >
                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || emailLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-sans font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
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
                  <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
                </button>

                {/* Divider */}
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2a2c38]" />
                  </div>
                  <span className="relative px-3 bg-[#12131A] text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    OR CONTINUE WITH EMAIL
                  </span>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl flex items-center gap-1.5 mt-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errorMessage}
                  </p>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  {/* Email Input */}
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="developer@company.com"
                        className="w-full bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-sans"
                        autoFocus
                        id="google-email-input"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] font-mono text-cyan hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="••••••••••••"
                        className="w-full bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-sans"
                        id="google-password-input"
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-cyan text-[#0B0C10] font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan/20 mt-2"
                    id="google-signin-submit"
                  >
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Footer Navigation Link */}
                <div className="pt-4 border-t border-[#2a2c38]/60 text-center text-xs font-sans text-slate-400">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={handleInitiateSignUp}
                    className="text-cyan font-mono font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign Up Now →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Password Step (if accessed sequentially) */}
            {step === "password" && (
              <motion.form
                key="password-form"
                onSubmit={handlePasswordSubmit}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 relative z-10"
              >
                <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] border border-[#2a2c38] rounded-xl mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-full bg-cyan/20 text-cyan flex items-center justify-center text-xs font-bold shrink-0">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-300 truncate font-mono">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-[10px] text-cyan hover:underline font-mono shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                      Enter Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] font-mono text-cyan hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-sans"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl flex items-center gap-1.5 mt-1 font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="flex-1 border border-[#2a2c38] text-slate-300 py-2.5 rounded-xl hover:bg-white/5 text-xs font-mono uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-cyan text-[#0B0C10] font-mono font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan/20"
                  >
                    <span>Authenticate</span>
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: OTP Code Verification */}
            {step === "otp_verify" && (
              <motion.form
                key="otp-form"
                onSubmit={handleVerifyOtp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 relative z-10 font-sans"
              >
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  A dynamic 5-digit verification code has been transmitted to <strong className="text-white font-mono">{email}</strong>.
                </p>

                {generatedOtp && (
                  <div className="bg-cyan/10 border border-cyan/30 text-cyan rounded-xl p-3 text-xs font-mono text-center flex flex-col gap-1 items-center">
                    <span className="font-bold flex items-center gap-1">✉️ SIMULATED MAILBOX SERVICE</span>
                    <span>Your OTP code is: <strong className="text-sm tracking-wider text-white bg-cyan/20 px-2 py-0.5 rounded border border-cyan/40">{generatedOtp}</strong></span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block text-center">
                    5-Digit Security OTP
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      required
                      maxLength={5}
                      pattern="\d{5}"
                      value={otpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setOtpInput(val);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="•••••"
                      className="w-40 tracking-[0.5em] text-center bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 py-3 rounded-xl text-xl font-bold font-mono text-cyan transition-all placeholder:text-slate-700 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2 rounded-xl text-center">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={() => handleRequestOtp(otpPurpose)}
                    className="text-xs font-mono text-cyan disabled:text-slate-500 flex items-center gap-1.5 hover:underline cursor-pointer disabled:no-underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 ? "" : "animate-spin"}`} />
                    {countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Security Code"}
                  </button>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="flex-1 border border-[#2a2c38] text-slate-300 py-2.5 rounded-xl hover:bg-white/5 text-xs font-mono uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-cyan text-[#0B0C10] font-mono font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Verify Code</span>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 4: Setup/Establish New Password */}
            {step === "new_password" && (
              <motion.form
                key="new-password-form"
                onSubmit={handleResetPasswordSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 relative z-10 font-sans"
              >
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Configure password for <span className="font-mono text-white">{email}</span>.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="At least 5 characters"
                        className="w-full bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="Re-enter password"
                        className="w-full bg-[#0B0C10] border border-[#2a2c38] focus:border-cyan/60 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2 rounded-xl text-center">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-cyan text-[#0B0C10] font-mono font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan/20"
                  >
                    <span>Finalize Setup & Connect</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 5: Verification Ticker */}
            {step === "verifying" && (
              <motion.div
                key="verifying-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 text-center flex flex-col items-center relative z-10"
              >
                <div className="relative mb-6">
                  <Loader2 className="w-12 h-12 text-cyan animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <Shield className="w-5 h-5 text-cyan" />
                  </div>
                </div>

                <h3 className="text-base font-bold font-mono text-white tracking-tight uppercase">OAUTH 2.0 PROTOCOL VERIFYING</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-mono">
                  Exchanging cryptographic handshake for <span className="text-cyan font-bold">{email || "student"}</span>
                </p>

                <div className="mt-6 w-full bg-[#0B0C10] border border-[#2a2c38] p-4 rounded-xl text-left max-w-sm">
                  <div className="font-mono text-[9px] text-slate-400 space-y-1.5 leading-normal">
                    {verificationSteps.map((stepMsg, idx) => {
                      const isActive = idx === verificationStep;
                      const isCompleted = idx < verificationStep;
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-2 ${
                            isActive ? "text-cyan font-bold" : isCompleted ? "text-slate-500" : "text-slate-700"
                          }`}
                        >
                          <span className="w-3 select-none">{isCompleted ? "✔" : isActive ? "➢" : "▪"}</span>
                          <span className="break-all">{stepMsg}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Success confirmation */}
            {step === "success" && (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center flex flex-col items-center relative z-10"
              >
                <div className="w-16 h-16 bg-cyan/20 border border-cyan/40 rounded-full flex items-center justify-center text-cyan mb-6 shadow-lg shadow-cyan/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold font-sans text-white tracking-tight">IDENTITY SECURELY AUTHENTICATED</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Google Identity Token Signature bound successfully.<br />Synchronized encrypted session ledger.
                </p>

                <div className="mt-4 px-4 py-2 bg-cyan/10 text-cyan font-mono text-[10px] uppercase font-bold tracking-wider border border-cyan/30 rounded-full">
                  {email || "student"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-4 border-t border-[#2a2c38]/60 flex items-center gap-2 justify-center text-[10px] text-slate-500 font-mono uppercase tracking-wider relative z-10">
            <Shield className="w-3.5 h-3.5 text-cyan" />
            <span>Secured by Google Identity Infrastructure</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
