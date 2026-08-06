import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Award, Mail, Download, CheckCircle, RefreshCw, Sparkles, User, Printer } from "lucide-react";
import { toPng } from "html-to-image";
import CertificateDesign from "./CertificateDesign";
import { CertificateData } from "../utils/certificateGenerator";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken?: string | null;
  userEmail?: string;
  defaultStudentName?: string;
  cohortId?: string;
  track?: "base" | "premium" | string;
  showNotification: (msg: string) => void;
  onCertificateGenerated?: (cert: any) => void;
}

export default function CertificateModal({
  isOpen,
  onClose,
  sessionToken,
  userEmail,
  defaultStudentName = "",
  cohortId = "CODX-2026-07-BASE-01",
  track = "base",
  showNotification,
  onCertificateGenerated
}: CertificateModalProps) {
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [programName, setProgramName] = useState(
    track === "premium" || cohortId.includes("PREMIUM") ? "Premium Alpha" : "Base Cohort"
  );
  const [activeCohortId, setActiveCohortId] = useState(cohortId);
  const [completionDate, setCompletionDate] = useState(
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  );
  const [certificateId, setCertificateId] = useState(`CODX-CERT-${cohortId}-001`);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMailing, setIsMailing] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [emailDispatched, setEmailDispatched] = useState(false);
  const [step, setStep] = useState<"input" | "preview">("input");

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultStudentName) {
      setStudentName(defaultStudentName);
    } else if (userEmail) {
      const formatted = userEmail.split("@")[0].split(/[._]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      setStudentName(formatted);
    }
  }, [defaultStudentName, userEmail]);

  useEffect(() => {
    setActiveCohortId(cohortId);
    setProgramName(track === "premium" || cohortId.includes("PREMIUM") ? "Premium Alpha" : "Base Cohort");
    const cleanCohort = cohortId.replace(/^CODX-/, "");
    setCertificateId(`CODX-CERT-${cleanCohort}-${Math.floor(Math.random() * 899 + 100)}`);
  }, [cohortId, track]);

  if (!isOpen) return null;

  const certData: CertificateData = {
    studentName: studentName.trim() || "Student Name",
    program: programName,
    cohortId: activeCohortId,
    completionDate: completionDate,
    certificateId: generatedData?.certificate_id || certificateId
  };

  const handleConfirmAndGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      showNotification("ERROR // Name is required to be printed on certificate");
      return;
    }

    setIsGenerating(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
        headers["x-session-token"] = sessionToken;
      }

      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          studentName: studentName.trim(),
          cohortId: activeCohortId,
          sendMail: true
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedData(data.certificate);
        setEmailDispatched(data.mailDispatched);
        setStep("preview");
        showNotification(`CERTIFICATE ISSUED // Name: ${studentName.trim()} — Emailed to ${data.certificate.student_email}`);
        if (onCertificateGenerated) {
          onCertificateGenerated(data.certificate);
        }
      } else {
        showNotification(`ERROR // ${data.error || "Failed to generate certificate"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Server communication error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResendEmail = async () => {
    const certId = generatedData?.certificate_id || certificateId;
    setIsMailing(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
        headers["x-session-token"] = sessionToken;
      }

      const res = await fetch("/api/certificates/mail", {
        method: "POST",
        headers,
        body: JSON.stringify({
          cert_id: certId,
          email: userEmail
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailDispatched(true);
        showNotification(`DISPATCHED // Official Certificate sent to ${data.recipientEmail}`);
      } else {
        showNotification(`ERROR // ${data.error || "Failed to resend email"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Email dispatch failed: ${err.message}`);
    } finally {
      setIsMailing(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, cacheBust: true, fontEmbedCSS: '', skipFonts: true });
      const a = document.createElement("a");
      a.download = `Codexia_Certificate_${(studentName || "Student").trim().replace(/\s+/g, "_")}_${generatedData?.certificate_id || certificateId}.png`;
      a.href = dataUrl;
      a.click();
      showNotification("DOWNLOAD STARTED // High-resolution Certificate PNG saved to your downloads!");
    } catch (err: any) {
      console.error("Failed to download PNG", err);
      showNotification("ERROR // Failed to export certificate image");
    }
  };

  const handlePrint = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, cacheBust: true, fontEmbedCSS: '', skipFonts: true });
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showNotification("ERROR // Pop-up blocked. Please allow pop-ups to print.");
        return;
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Codexia Certificate - ${studentName}</title>
            <style>
              @page { size: landscape; margin: 0; }
              body { margin: 0; padding: 0; background: #04060b; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
              img { width: 100vw; height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Certificate" />
            <script>
              window.onload = function() { window.print(); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err: any) {
      console.error("Failed to print certificate", err);
      showNotification("ERROR // Failed to prepare certificate for printing");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-4xl bg-[#0c0d12] border border-cyan/30 text-white p-5 md:p-8 font-mono shadow-[0_0_50px_rgba(0,242,255,0.15)] rounded-2xl z-10 my-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b border-[#2a2c35] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shrink-0">
                <Award className="w-5 h-5 text-cyan" />
              </div>
              <div>
                <span className="text-[8px] text-cyan font-bold uppercase tracking-widest block">
                  CODEXIA CERTIFICATE GENERATOR // OFFICIAL LEDGER
                </span>
                <h2 className="text-sm md:text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  OFFICIAL CERTIFICATE OF COMPLETION
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white border border-transparent hover:border-[#2a2c35] rounded-lg transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "input" ? (
            /* STEP 1: Name Confirmation & Live Preview */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Form Controls Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-4 bg-cyan/5 border border-cyan/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan font-bold text-[10px] uppercase">
                    <User className="w-4 h-4" />
                    <span>STEP 1: CONFIRM STUDENT NAME</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                    Please specify the exact full name to be printed on your official Codexia Certificate of Completion.
                  </p>
                  
                  <div>
                    <label className="text-[8.5px] font-bold text-cyan uppercase block mb-1.5">
                      FULL NAME (FOR CERTIFICATE)
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Vankayalapati Mallikharjuna Rao"
                      className="w-full bg-black border-2 border-cyan/40 focus:border-cyan text-white text-xs font-bold py-2.5 px-3 rounded-lg outline-none uppercase font-serif tracking-wide"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="p-4 bg-[#14151c] border border-[#2a2c35] rounded-xl space-y-2 text-[9px]">
                  <div className="text-slate-400 font-bold uppercase border-b border-[#2a2c35] pb-1.5 mb-2 flex items-center justify-between">
                    <span>RECORD SPECIFICATIONS</span>
                    <span className="text-cyan">{activeCohortId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PROGRAM:</span>
                    <span className="text-white font-bold">{programName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">COMPLETION DATE:</span>
                    <span className="text-white font-bold">{completionDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RECIPIENT EMAIL:</span>
                    <span className="text-cyan font-bold">{userEmail || "Student Email"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CERTIFICATE ID:</span>
                    <span className="text-amber-300 font-bold">{certificateId}</span>
                  </div>
                </div>

                <form onSubmit={handleConfirmAndGenerate} className="space-y-3">
                  <button
                    type="submit"
                    disabled={isGenerating || !studentName.trim()}
                    className="w-full py-3 bg-cyan hover:bg-cyan/90 text-black font-bold uppercase text-[11px] rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        GENERATING & DISPATCHING EMAIL...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        CONFIRM NAME & GENERATE CERTIFICATE
                      </>
                    )}
                  </button>
                  <p className="text-[8px] text-center text-slate-400 uppercase">
                    🔒 Automatically updates your enrollment records and emails certificate to {userEmail}
                  </p>
                </form>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-7 bg-black border border-[#2a2c35] rounded-xl p-3 overflow-hidden space-y-2">
                <div className="flex justify-between items-center text-[8px] text-slate-400 uppercase font-bold px-1">
                  <span className="text-cyan">LIVE CERTIFICATE PATTERN PREVIEW</span>
                  <span>CANVAS PREVIEW</span>
                </div>

                {/* Certificate Component Render */}
                <div 
                  ref={previewRef}
                  className="w-full rounded-lg overflow-hidden border border-cyan/20 shadow-xl relative"
                >
                  <CertificateDesign data={certData} />
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Issued Certificate Actions */
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-bold text-white uppercase flex items-center gap-2">
                      CERTIFICATE SUCCESSFULLY GENERATED & DISPATCHED
                    </h3>
                    <p className="text-[10px] text-emerald-300 font-sans mt-0.5">
                      Your official Certificate of Completion has been generated, logged in Codexia database, and emailed to <strong className="text-white">{userEmail || generatedData?.student_email}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={handleResendEmail}
                    disabled={isMailing}
                    className="px-3 py-2 bg-black/60 hover:bg-black text-cyan border border-cyan/40 text-[9px] font-bold uppercase rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {isMailing ? "DISPATCHING..." : "RESEND EMAIL"}
                  </button>
                  <button
                    onClick={() => setStep("input")}
                    className="px-3 py-2 bg-black/60 hover:bg-black text-slate-300 border border-[#2a2c35] text-[9px] font-bold uppercase rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    EDIT NAME
                  </button>
                </div>
              </div>

              {/* Certificate Canvas Render */}
              <div className="bg-black border border-cyan/30 rounded-xl p-3 overflow-hidden">
                <div 
                  ref={previewRef}
                  className="w-full rounded-lg overflow-hidden border border-cyan/30 shadow-2xl"
                >
                  <CertificateDesign data={certData} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadPNG}
                  className="py-3 px-4 bg-cyan hover:bg-cyan/90 text-black font-bold uppercase text-[10px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan/20"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD HIGH-RES CERTIFICATE PNG
                </button>
                <button
                  onClick={handlePrint}
                  className="py-3 px-4 bg-[#181922] hover:bg-[#222430] text-cyan border border-cyan/40 font-bold uppercase text-[10px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  PRINT / SAVE AS PDF
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
