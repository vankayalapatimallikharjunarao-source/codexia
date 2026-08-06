import React, { useRef, useState } from "react";
import { Download, Printer, Copy, Check, ShieldCheck, Award, Sparkles, X } from "lucide-react";
import { toPng } from "html-to-image";
import CertificateDesign from "./CertificateDesign";
import { CertificateData } from "../utils/certificateGenerator";

interface CertificateTemplateProps {
  data: CertificateData;
  onClose?: () => void;
  showNotification?: (msg: string) => void;
}

export default function CertificateTemplate({
  data,
  onClose,
  showNotification
}: CertificateTemplateProps) {
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      const dataUrl = await toPng(certRef.current, { pixelRatio: 3, cacheBust: true, fontEmbedCSS: '', skipFonts: true });
      const link = document.createElement("a");
      link.download = `Codexia_Certificate_${(data.studentName || "Student").trim().replace(/\s+/g, "_")}_${data.certificateId || "Graduation"}.png`;
      link.href = dataUrl;
      link.click();
      if (showNotification) {
        showNotification(`DOWNLOAD INITIATED // Certificate ${data.certificateId}`);
      }
    } catch (err) {
      console.error("Failed to generate certificate image", err);
      if (showNotification) {
        showNotification("ERROR // Failed to export certificate image.");
      }
    }
  };

  const handlePrint = async () => {
    if (!certRef.current) return;
    try {
      const dataUrl = await toPng(certRef.current, { pixelRatio: 3, cacheBust: true, fontEmbedCSS: '', skipFonts: true });
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        if (showNotification) showNotification("ERROR // Pop-up blocked. Please allow pop-ups to print.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Codexia Certificate - ${data.studentName}</title>
            <style>
              @page {
                size: landscape;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background-color: #04060b;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              img {
                width: 100vw;
                height: 100vh;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Codexia Certificate" />
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Failed to print certificate", err);
      if (showNotification) {
        showNotification("ERROR // Failed to prepare certificate for printing.");
      }
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.certificateId);
    setCopied(true);
    if (showNotification) {
      showNotification(`COPIED TO CLIPBOARD // ${data.certificateId}`);
    }
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-6">
      {/* Header Bar with Status & Actions */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#12131C] border border-[#2a2c3a] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Official Credential
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-sm font-sans font-bold text-white tracking-tight">
              Certificate of Completion — {data.studentName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyId}
            className="px-3 py-1.5 rounded-lg bg-[#1a1c28] hover:bg-[#252838] border border-[#32364a] text-slate-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy Certificate ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Copied" : data.certificateId}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-[#1a1c28] hover:bg-[#252838] border border-[#32364a] text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan/90 to-blue-600 hover:from-cyan hover:to-blue-500 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Certificate</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1a1c28] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#32364a] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Render Certificate Component with Background Image */}
      <div 
        ref={certRef}
        className="w-full relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#04060b] group"
      >
        <CertificateDesign data={data} />
      </div>

      {/* Verification Ledger Footer Info */}
      <div className="w-full p-4 rounded-xl bg-[#0e0f17]/80 border border-[#222433] flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs font-mono gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Cryptographically Sealed &amp; Registered under Codexia Academic Ledger</span>
        </div>
        <div className="text-[11px] text-slate-500">
          ID: <span className="text-cyan">{data.certificateId}</span> • Date: <span className="text-slate-300">{data.completionDate}</span>
        </div>
      </div>
    </div>
  );
}
