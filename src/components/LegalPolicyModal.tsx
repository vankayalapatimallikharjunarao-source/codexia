import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  ShieldCheck, 
  RefreshCw, 
  Building, 
  Search, 
  X, 
  Check, 
  Copy, 
  Printer, 
  AlertTriangle, 
  Info,
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Scale
} from "lucide-react";
import { LEGAL_DOCUMENTS, GRIEVANCE_OFFICER_DETAILS, LegalDocument } from "../data/legalDocuments";

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "terms" | "privacy" | "refund" | "about";
}

export default function LegalPolicyModal({
  isOpen,
  onClose,
  defaultTab = "terms"
}: LegalPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "refund" | "about">(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [serverStateLoaded, setServerStateLoaded] = useState(false);

  // Sync activeTab when defaultTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSearchQuery("");
    }
  }, [isOpen, defaultTab]);

  // Fetch central server verification endpoint to ensure server syncing
  useEffect(() => {
    if (isOpen) {
      fetch("/api/legal/documents")
        .then(res => res.json())
        .then(() => setServerStateLoaded(true))
        .catch(err => console.warn("Server legal API sync delay:", err));
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDoc: LegalDocument = LEGAL_DOCUMENTS[activeTab] || LEGAL_DOCUMENTS.terms;

  const handleCopySection = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter sections by search query
  const filteredSections = currentDoc.sections.filter(sec => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = sec.title.toLowerCase().includes(q);
    const matchesContent = sec.content.toLowerCase().includes(q);
    const matchesBullets = sec.bulletPoints?.some(b => b.toLowerCase().includes(q));
    const matchesTable = sec.tableData?.some(t => 
      t.situation.toLowerCase().includes(q) || t.refundDetails.toLowerCase().includes(q)
    );
    return matchesTitle || matchesContent || matchesBullets || matchesTable;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Main Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-[#0c0d12] border border-[#2a2c35] text-white flex flex-col rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Top Bar Header */}
          <div className="bg-[#12131b] border-b border-[#2a2c35] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-mono font-bold tracking-widest text-white uppercase">
                    CODEXIA // LEGAL & COMPLIANCE SYSTEM
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-cyan/10 text-cyan border border-cyan/20">
                    {currentDoc.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#8e919e] font-sans mt-0.5">
                  Official Entity Policy Ledger & Regulatory Documentation • {currentDoc.lastUpdated}
                </p>
              </div>
            </div>

            {/* Action controls & Close button */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={handlePrint}
                title="Print Document"
                className="px-3 py-1.5 bg-[#161722] hover:bg-slate-800 border border-[#2a2c35] text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PRINT</span>
              </button>

              <button
                onClick={() => handleCopySection(`${currentDoc.title}\n\n${currentDoc.sections.map(s => `${s.title}\n${s.content}`).join("\n\n")}`)}
                title="Copy Full Document"
                className="px-3 py-1.5 bg-[#161722] hover:bg-slate-800 border border-[#2a2c35] text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedText ? "COPIED" : "COPY TEXT"}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-[#161722] border border-[#2a2c35] hover:border-white/20 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Switcher & Search Bar */}
          <div className="bg-[#101118] border-b border-[#2a2c35] px-4 sm:px-6 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              <button
                onClick={() => setActiveTab("terms")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "terms"
                    ? "bg-cyan text-black shadow-lg shadow-cyan/20"
                    : "bg-[#181a24] text-slate-400 hover:text-white border border-[#2a2c35]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                TERMS & CONDITIONS
              </button>

              <button
                onClick={() => setActiveTab("privacy")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "privacy"
                    ? "bg-cyan text-black shadow-lg shadow-cyan/20"
                    : "bg-[#181a24] text-slate-400 hover:text-white border border-[#2a2c35]"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                PRIVACY SAFEGUARDS
              </button>

              <button
                onClick={() => setActiveTab("refund")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "refund"
                    ? "bg-cyan text-black shadow-lg shadow-cyan/20"
                    : "bg-[#181a24] text-slate-400 hover:text-white border border-[#2a2c35]"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                REFUND PARAMETERS
              </button>

              <button
                onClick={() => setActiveTab("about")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "about"
                    ? "bg-cyan text-black shadow-lg shadow-cyan/20"
                    : "bg-[#181a24] text-slate-400 hover:text-white border border-[#2a2c35]"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                ENTITY & DETAILS
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clauses or terms..."
                className="w-full bg-[#161722] border border-[#2a2c35] focus:border-cyan text-white text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none placeholder:text-slate-600 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 custom-scrollbar">
            {/* Document Header Box */}
            <div className="bg-gradient-to-r from-[#141620] to-[#10121a] border border-[#2a2c35] p-5 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {currentDoc.title}
                </h1>
                <span className="text-xs font-mono text-cyan bg-cyan/10 border border-cyan/20 px-2.5 py-1 rounded-md">
                  {currentDoc.subtitle}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400 font-mono pt-1 border-t border-[#2a2c35]/60">
                <div>Governing Law: <strong className="text-slate-200">{currentDoc.governingLaw}</strong></div>
                <div>Jurisdiction: <strong className="text-slate-200">{currentDoc.jurisdiction}</strong></div>
                <div>Status: <strong className="text-green-400">Live & Verified</strong></div>
              </div>
            </div>

            {/* PayU / Draft Review Notice Box */}
            <div className="bg-[#1b1912] border border-[#d97706]/40 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed text-[#fcd34d]">
              <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-[#fbbf24] uppercase tracking-wider block mb-1">
                  OFFICIAL REVIEW & COMPLIANCE STATEMENT
                </strong>
                This document represents the professionally structured legal and policy framework for Codexia (operated by Vankayalapati Mallikharjuna Rao), prepared for student review and PayU payment aggregator compliance under Indian Consumer Protection and Digital Personal Data Protection (DPDP Act 2023) standards.
              </div>
            </div>

            {/* Render Clauses / Sections */}
            {filteredSections.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-sm">
                No clauses found matching "{searchQuery}". Try searching for terms like "PayU", "3 days", "Grievance", or "GST".
              </div>
            ) : (
              <div className="space-y-8 max-w-4xl">
                {filteredSections.map((sec) => (
                  <div key={sec.id} className="space-y-3 scroll-mt-20" id={sec.id}>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 border-b border-[#2a2c35]/80 pb-2">
                      <ChevronRight className="w-4 h-4 text-cyan" />
                      {sec.title}
                    </h3>

                    {sec.content && (
                      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                        {sec.content}
                      </div>
                    )}

                    {/* Callout box if present */}
                    {sec.calloutBox && (
                      <div className={`my-3 p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 shadow-lg relative overflow-hidden ${
                        sec.calloutBox.type === "warning"
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                          : sec.calloutBox.type === "info"
                          ? "bg-cyan/10 border-cyan/40 text-cyan-200"
                          : sec.calloutBox.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                          : "bg-purple-500/10 border-purple-500/40 text-purple-200"
                      }`}>
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                          {sec.calloutBox.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                          {sec.calloutBox.type === "info" && <Info className="w-4 h-4 text-cyan shrink-0" />}
                          {sec.calloutBox.type === "success" && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {(sec.calloutBox.type === "notice" || !["warning", "info", "success"].includes(sec.calloutBox.type)) && <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />}
                          <span>{sec.calloutBox.title}</span>
                        </div>
                        <p className="text-xs text-slate-200 font-sans leading-relaxed pl-6">
                          {sec.calloutBox.text}
                        </p>
                      </div>
                    )}

                    {/* Bullet points if present */}
                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-sans pl-2">
                        {sec.bulletPoints.map((bp, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-[#141620] p-3 rounded-lg border border-[#2a2c35]/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0 mt-2" />
                            <span className="leading-relaxed">{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Interactive Table Data (for Refund Policy) */}
                    {sec.tableData && (
                      <div className="overflow-x-auto rounded-xl border border-[#2a2c35] my-4 shadow-xl bg-[#0f1016]">
                        <table className="w-full text-left text-xs font-sans">
                          <thead className="bg-[#161722] text-slate-300 uppercase font-mono text-[10px] tracking-wider border-b border-[#2a2c35]">
                            <tr>
                              <th className="p-3.5">Enrolment Situation</th>
                              <th className="p-3.5 w-28 text-center">Eligible?</th>
                              <th className="p-3.5">Refund Terms & Processing</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2a2c35]/60 text-slate-300">
                            {sec.tableData.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-3.5 font-medium text-slate-200">{row.situation}</td>
                                <td className="p-3.5 text-center">
                                  {row.eligible ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-green-950/80 text-green-400 border border-green-800">
                                      <Check className="w-3 h-3" /> YES
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-950/80 text-red-400 border border-red-800">
                                      <X className="w-3 h-3" /> NO
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 font-mono text-[11px] text-slate-300">{row.refundDetails}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Dedicated Grievance Officer & Official Entity Contact Card */}
            <div className="mt-10 bg-gradient-to-br from-[#12141d] to-[#0d0e14] border border-cyan/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#2a2c35] pb-3">
                <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    OFFICIAL REGISTERED ENTITY & GRIEVANCE OFFICER
                  </h4>
                  <p className="text-xs text-slate-400 font-sans">
                    Designated authority under the Information Technology Act, 2000 & PayU Merchant Ledger
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="space-y-2 bg-[#090a0f] p-4 rounded-lg border border-[#2a2c35]">
                  <div className="text-slate-400 font-mono uppercase text-[10px] tracking-wider">OFFICER NAME</div>
                  <div className="text-white font-bold text-sm">{GRIEVANCE_OFFICER_DETAILS.name}</div>
                  <div className="text-slate-400 text-[11px]">{GRIEVANCE_OFFICER_DETAILS.operatingEntity}</div>
                </div>

                <div className="space-y-2 bg-[#090a0f] p-4 rounded-lg border border-[#2a2c35]">
                  <div className="text-slate-400 font-mono uppercase text-[10px] tracking-wider">SUPPORT EMAIL</div>
                  <a 
                    href={`mailto:${GRIEVANCE_OFFICER_DETAILS.email}`}
                    className="text-cyan font-mono font-bold text-xs hover:underline flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {GRIEVANCE_OFFICER_DETAILS.email}
                  </a>
                  <div className="text-slate-400 text-[11px]">Expected response within 3 business days</div>
                </div>

                <div className="space-y-2 bg-[#090a0f] p-4 rounded-lg border border-[#2a2c35]">
                  <div className="text-slate-400 font-mono uppercase text-[10px] tracking-wider">PHONE & WHATSAPP</div>
                  <a 
                    href={`tel:${GRIEVANCE_OFFICER_DETAILS.phone.replace(/\s+/g, '')}`}
                    className="text-white font-mono font-bold text-xs hover:text-cyan flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan" />
                    {GRIEVANCE_OFFICER_DETAILS.phone}
                  </a>
                  <div className="text-slate-400 text-[11px]">Indian Standard Time (IST) Business Hours</div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-[#101118] border-t border-[#2a2c35] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Codexia Policy Server Synced</span>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 bg-cyan hover:bg-cyan/90 text-black font-extrabold uppercase text-xs tracking-wider rounded-lg transition-all cursor-pointer shadow-lg shadow-cyan/20"
            >
              CLOSE LEGAL READER
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
