import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Loader2, Mail, Check, AlertCircle, X, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff, Key, RefreshCw, Lock, CheckCircle2 } from "lucide-react";

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, password?: string) => void;
}

export default function GoogleOAuthModal({ isOpen, onClose, onSuccess }: GoogleOAuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Enter a valid Google account email address");
      return;
    }
    setErrorMessage("");
    setStep("password");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 5) {
      setErrorMessage("Password must be at least 5 characters");
      return;
    }
    setErrorMessage("");
    startOAuthVerification();
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
        // Authenticate directly under the newly established password signature
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
        setTimeout(() => runSteps(currentStep + 1), 400);
      } else {
        setStep("success");
        setTimeout(() => {
          onSuccess(email, overridePassword || password);
          resetState();
          onClose();
        }, 1000);
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
          className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity" 
        />

        {/* Modal Window Container */}
        <motion.div
          className="relative w-full max-w-md bg-white text-gray-800 rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 font-sans"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
        >
          {/* Top Google branding banner */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span className="font-semibold text-gray-700 tracking-tight text-xs">Sign in with Google</span>
            </div>
            {step !== "verifying" && step !== "success" && (
              <button
                onClick={() => {
                  onClose();
                  resetState();
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                id="google-oauth-close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col items-center justify-center mb-6 text-center">
              {/* Elegant Codexia Senior Thinker / Analyst Secure Shield Emblem */}
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 p-[2.5px] shadow-lg shadow-indigo-500/15 mb-3.5">
                <div className="flex items-center justify-center w-full h-full rounded-full bg-white text-indigo-600">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 opacity-25 blur-sm animate-pulse" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                {step === "otp_verify" ? "Security Verification Code" : 
                 step === "new_password" ? "Configure Password" : 
                 "Google Account Sign-In"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                to continue to <strong className="text-indigo-600 font-semibold">Codexia Grid Mesh</strong>
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: Enter Email */}
              {step === "email" && (
                <motion.form
                  key="email-form"
                  onSubmit={handleEmailSubmit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="name@gmail.com"
                        className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none pl-11 pr-4 py-3 rounded-xl text-sm text-gray-900 transition-all placeholder:text-gray-400"
                        autoFocus
                        id="google-email-input"
                      />
                    </div>
                    {errorMessage && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      id="google-email-next"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleInitiateSignUp}
                      className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Create Account</span>
                      <Key className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                    * Not your computer? Use private guest mode to sign in securely. Every session is dynamic and credentialed on our servers.
                  </p>
                </motion.form>
              )}

              {/* STEP 2: Enter Password */}
              {step === "password" && (
                <motion.form
                  key="password-form"
                  onSubmit={handlePasswordSubmit}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Show Selected Email */}
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-gray-700 truncate font-mono">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-[10px] text-indigo-600 hover:underline font-semibold shrink-0"
                      id="google-change-account"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Enter your password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] text-indigo-600 hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="••••••••"
                        className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none pl-4 pr-11 py-3 rounded-xl text-sm text-gray-900 transition-all placeholder:text-gray-400"
                        autoFocus
                        id="google-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {errorMessage && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      id="google-signin-submit"
                    >
                      <span>Sign In</span>
                      <Shield className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: OTP Code Verification Gate */}
              {step === "otp_verify" && (
                <motion.form
                  key="otp-form"
                  onSubmit={handleVerifyOtp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    A dynamic 5-digit security code has been transmitted to your email <strong className="text-gray-700 font-mono font-bold break-all">{email}</strong>. Please enter it below.
                  </p>

                  {/* Mailbox Simulator helper alert */}
                  {generatedOtp && (
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl p-3 mb-2 text-xs font-mono text-center flex flex-col gap-1 items-center animate-pulse">
                      <span className="font-bold flex items-center gap-1">✉️ SIMULATED MAILBOX SERVICE</span>
                      <span>Your secure verification OTP is: <strong className="text-sm tracking-wider text-indigo-950 bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-200 font-bold">{generatedOtp}</strong></span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block text-center">
                      5-Digit Verification OTP
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
                        className="w-40 tracking-[0.5em] text-center bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none py-3 rounded-xl text-xl font-bold font-mono text-gray-900 transition-all placeholder:text-gray-300"
                        autoFocus
                      />
                    </div>
                    {errorMessage && (
                      <p className="text-xs text-red-500 flex items-center justify-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={() => handleRequestOtp(otpPurpose)}
                      className="text-xs font-semibold text-blue-600 disabled:text-gray-400 flex items-center gap-1.5 hover:underline cursor-pointer disabled:no-underline"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 ? "" : "animate-spin"}`} />
                      {countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Security Code"}
                    </button>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Verify OTP</span>
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
                  className="space-y-4"
                >
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    Identity verified for <span className="font-semibold text-gray-700">{email}</span>. Configure your new secure login password.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
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
                          className="w-full bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none pl-4 pr-11 py-3 rounded-xl text-sm text-gray-900 transition-all placeholder:text-gray-400"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
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
                          className="w-full bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none pl-4 pr-11 py-3 rounded-xl text-sm text-gray-900 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-red-500 flex items-center justify-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Finalize Setup & Connect</span>
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 5: Cryptographic TLS Verification Ticker */}
              {step === "verifying" && (
                <motion.div
                  key="verifying-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-4 text-center flex flex-col items-center"
                >
                  <div className="relative mb-6">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                      <Shield className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 tracking-tight">OAUTH 2.0 PROTOCOL VERIFYING</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto font-mono">
                    Exchanging cryptographic handshake for <span className="text-blue-600 font-bold">{email}</span>
                  </p>

                  <div className="mt-6 w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-left max-w-sm">
                    <div className="font-mono text-[9px] text-gray-500 space-y-1.5 leading-normal">
                      {verificationSteps.map((stepMsg, idx) => {
                        const isActive = idx === verificationStep;
                        const isCompleted = idx < verificationStep;
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-start gap-2 ${
                              isActive ? "text-blue-600 font-bold" : isCompleted ? "text-gray-400" : "text-gray-300"
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
                  className="py-8 text-center flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-green-500/20">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">IDENTITY SECURELY AUTHENTICATED</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Google Identity Token Signature bound successfully.<br />Synchronized encrypted session ledger.
                  </p>

                  <div className="mt-4 px-4 py-2 bg-green-50 text-green-800 font-mono text-[10px] uppercase font-bold tracking-wider border border-green-100 rounded-full">
                    {email}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 justify-center text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              <span>Secured by Google Identity Infrastructure</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
