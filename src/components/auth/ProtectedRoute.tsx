import React from "react";
import { useAuth } from "../../context/AuthContext";
import LoginPage from "./LoginPage";
import { Loader2, ShieldAlert, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  onNavigateToSignUp?: () => void;
  onNavigateToForgotPassword?: () => void;
  onNavigateHome?: () => void;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onNavigateHome
}: ProtectedRouteProps) {
  const { currentUser, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 bg-cyan/10 border border-cyan/30 rounded-2xl">
            <Loader2 className="w-8 h-8 text-cyan animate-spin" />
          </div>
          <span className="font-mono text-xs uppercase font-bold tracking-widest text-cyan animate-pulse">
            Verifying Authentication State...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <div className="max-w-md mx-auto mt-6 px-4">
          <div className="p-4 bg-cyan/10 border border-cyan/40 rounded-xl text-cyan text-xs font-mono flex items-center gap-3 shadow-lg">
            <Lock className="w-5 h-5 text-cyan shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider">Authentication Required</p>
              <p className="text-slate-300 font-sans text-xs mt-0.5">
                Please sign in to your Codexia account to access this protected area.
              </p>
            </div>
          </div>
        </div>
        <LoginPage
          onNavigateToSignUp={onNavigateToSignUp}
          onNavigateToForgotPassword={onNavigateToForgotPassword}
        />
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-[#12131A] border border-red-500/40 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-red-400">
            Admin Privilege Required
          </h2>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            Your current account (<strong className="text-white font-mono">{currentUser.email}</strong>) does not have administrator privileges required for this telemetry monitor.
          </p>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="mt-2 px-4 py-2.5 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-300 font-mono text-xs uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Return to Public Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
