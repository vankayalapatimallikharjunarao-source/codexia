import React, { useState, useRef, useEffect } from "react";
import { User } from "firebase/auth";
import { LogOut, User as UserIcon, ShieldCheck, MailWarning, MailCheck, ExternalLink, ChevronDown, RefreshCw, Award, Save, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface UserProfileMenuProps {
  currentUser: User;
  isAdmin: boolean;
  onLogout: () => void;
  onNavigateToAdmin?: () => void;
  showNotification?: (msg: string) => void;
}

export default function UserProfileMenu({
  currentUser,
  isAdmin,
  onLogout,
  onNavigateToAdmin,
  showNotification
}: UserProfileMenuProps) {
  const { sendVerificationEmail } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);
  
  // Name for Certificate state
  const [certName, setCertName] = useState("");
  const [savingCertName, setSavingCertName] = useState(false);
  const [certNameSaved, setCertNameSaved] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = currentUser.displayName || currentUser.email?.split("@")[0] || "User";
  const email = currentUser.email || "";
  const photoURL = currentUser.photoURL;
  const isVerified = currentUser.emailVerified || currentUser.providerData.some(p => p.providerId === "google.com");

  // Fetch student profile certificate name when menu is opened
  useEffect(() => {
    if (isOpen) {
      fetch("/api/auth/session")
        .then(res => res.json())
        .then(data => {
          if (data && data.certificate_name) {
            setCertName(data.certificate_name);
          } else if (!certName) {
            setCertName(displayName);
          }
        })
        .catch(() => {
          if (!certName) setCertName(displayName);
        });
    }
  }, [isOpen, displayName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResendVerification = async () => {
    setResending(true);
    setResentSuccess(false);
    try {
      await sendVerificationEmail();
      setResentSuccess(true);
      if (showNotification) {
        showNotification(`VERIFICATION EMAIL DISPATCHED TO ${email.toUpperCase()}`);
      }
    } catch (err: any) {
      if (showNotification) {
        showNotification("VERIFICATION DISPATCH ERROR // RETRY MOMENTARILY");
      }
    } finally {
      setResending(false);
    }
  };

  const handleSaveCertName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCertName(true);
    setCertNameSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificate_name: certName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCertNameSaved(true);
        if (showNotification) {
          showNotification(`CERTIFICATE NAME SAVED // "${certName.trim() || displayName}"`);
        }
        setTimeout(() => setCertNameSaved(false), 2500);
      }
    } catch (err) {
      if (showNotification) {
        showNotification("ERROR // Failed to save certificate name");
      }
    } finally {
      setSavingCertName(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button / Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-[#12131A] border border-[#2a2c38] hover:border-cyan/50 transition-all cursor-pointer group"
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="w-7 h-7 rounded-lg object-cover border border-cyan/30"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan font-mono text-xs font-bold uppercase">
            {displayName.substring(0, 2).toUpperCase()}
          </div>
        )}

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] font-mono font-bold text-slate-200 leading-tight flex items-center gap-1 group-hover:text-cyan transition-colors">
            {displayName}
            {isAdmin && (
              <span className="px-1 py-0.2 text-[8px] bg-red-500/20 text-red-400 font-mono rounded border border-red-500/30">
                ADMIN
              </span>
            )}
          </span>
          <span className="text-[9px] font-mono text-slate-500 truncate max-w-[110px]">
            {email}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Profile Dropdown Popup Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#12131A] border border-[#2a2c38] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Meta Header */}
          <div className="pb-3 border-b border-[#2a2c38] mb-2">
            <div className="flex items-center gap-2.5">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="w-9 h-9 rounded-lg border border-cyan/40" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/40 flex items-center justify-center text-cyan font-mono font-bold text-sm">
                  {displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-mono font-bold text-white truncate">{displayName}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate">{email}</p>
              </div>
            </div>

            {/* Email Verification Status */}
            <div className="mt-2.5 pt-2 border-t border-[#1a1c26] flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">Account Verification:</span>
              {isVerified ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <MailCheck className="w-3 h-3 text-emerald-400" />
                  Verified
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-bold">
                  <MailWarning className="w-3 h-3 text-amber-400" />
                  Unverified
                </span>
              )}
            </div>

            {/* Resend Verification Button if unverified */}
            {!isVerified && (
              <button
                onClick={handleResendVerification}
                disabled={resending || resentSuccess}
                className="w-full mt-2 py-1 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Sending Link...
                  </>
                ) : resentSuccess ? (
                  <>
                    <MailCheck className="w-3 h-3 text-emerald-400" />
                    Check Email Inbox
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Resend Verification Email
                  </>
                )}
              </button>
            )}
            {/* Name for Certificate Section */}
            <form onSubmit={handleSaveCertName} className="mt-2 pt-2 border-t border-[#1a1c26] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Name for Certificate
                </label>
                {certNameSaved && (
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" />
                    Saved
                  </span>
                )}
              </div>
              <p className="text-[9px] font-mono text-slate-500 leading-tight">
                Official name printed on your graduation certificate:
              </p>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder={displayName}
                  className="w-full px-2 py-1 bg-[#0b0c12] border border-[#2a2c3a] focus:border-amber-500/60 rounded text-xs font-sans text-slate-200 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={savingCertName}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                  title="Save Name for Certificate"
                >
                  {savingCertName ? <RefreshCw className="w-3 h-3 animate-spin text-amber-300" /> : <Save className="w-3 h-3 text-amber-300" />}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1">
            {isAdmin && onNavigateToAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToAdmin();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono text-red-300 hover:bg-red-500/10 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>Admin Dashboard</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
