import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Check, 
  X, 
  Copy, 
  Printer, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  ArrowUp, 
  Scale,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Info,
  Sparkles,
  Bell
} from "lucide-react";
import { LEGAL_DOCUMENTS, GRIEVANCE_OFFICER_DETAILS, LegalDocument } from "../data/legalDocuments";

interface LegalPageViewProps {
  pageKey: "about" | "terms" | "privacy" | "refund" | "refund-policy";
  onNavigateHome: () => void;
}

export default function LegalPageView({ pageKey, onNavigateHome }: LegalPageViewProps) {
  const normalizedKey = (pageKey === "refund-policy" ? "refund" : pageKey) as "about" | "terms" | "privacy" | "refund";
  const [doc, setDoc] = useState<LegalDocument | null>(LEGAL_DOCUMENTS[normalizedKey] || null);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Dynamic Server Loading from backend endpoint
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/legal-pages/${normalizedKey}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server fetch error");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && data.sections) {
          setDoc(data);
        }
      })
      .catch((err) => {
        console.warn("Dynamic legal page loading falling back to local dataset:", err);
        if (isMounted) {
          setDoc(LEGAL_DOCUMENTS[normalizedKey] || LEGAL_DOCUMENTS.terms);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedKey]);

  // Scroll listener for Back To Top Floating Control (>250px)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentDoc = doc || LEGAL_DOCUMENTS[normalizedKey] || LEGAL_DOCUMENTS.terms;

  const handleCopyText = () => {
    const fullText = `${currentDoc.title}\n${currentDoc.subtitle}\nLast updated: 25 July 2026\n\n${currentDoc.sections
      .map((s) => `${s.title}\n${s.content}`)
      .join("\n\n")}`;
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Title translation for breadcrumbs
  const pageTitles: Record<string, string> = {
    about: "About Us",
    terms: "Terms and Conditions",
    privacy: "Privacy Policy",
    refund: "Refund Policy",
    "refund-policy": "Refund Policy"
  };

  const breadcrumbTitle = pageTitles[pageKey] || currentDoc.title;

  const renderCalloutBox = (box: NonNullable<LegalDocument["sections"][number]["calloutBox"]>) => {
    switch (box.type) {
      case "warning":
        return (
          <div className="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-1.5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{box.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/90 font-sans leading-relaxed pl-6">
              {box.text}
            </p>
          </div>
        );
      case "info":
        return (
          <div className="my-4 p-4 rounded-xl bg-cyan/10 border border-cyan/40 text-cyan-200 space-y-1.5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-cyan font-mono text-xs font-bold uppercase tracking-wider">
              <Info className="w-4 h-4 text-cyan shrink-0" />
              <span>{box.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-cyan-100/90 font-sans leading-relaxed pl-6">
              {box.text}
            </p>
          </div>
        );
      case "success":
        return (
          <div className="my-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 space-y-1.5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{box.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-sans leading-relaxed pl-6">
              {box.text}
            </p>
          </div>
        );
      case "notice":
      default:
        return (
          <div className="my-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-200 space-y-1.5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{box.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-purple-100/90 font-sans leading-relaxed pl-6">
              {box.text}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#d1d5db] py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-cyan selection:text-black">
      {/* Background Subtle Radial Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.03),transparent_50%)]" />

      {/* Main Reading Container constrained to ~720px for optimal typography rhythm */}
      <div className="max-w-[720px] mx-auto relative z-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-2 text-xs font-mono text-[#8e919e] mb-8 pb-4 border-b border-[#2a2c35]/50">
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="hover:text-cyan transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              Home
            </button>
            <span className="text-[#3a3d4a]">›</span>
            <span className="text-cyan font-bold">{breadcrumbTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Document"
              className="px-2.5 py-1 bg-[#161722] hover:bg-slate-800 border border-[#2a2c35] text-[#a0a2b0] hover:text-white rounded text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span className="hidden sm:inline">PRINT</span>
            </button>
            <button
              onClick={handleCopyText}
              title="Copy Full Document Text"
              className="px-2.5 py-1 bg-[#161722] hover:bg-slate-800 border border-[#2a2c35] text-[#a0a2b0] hover:text-white rounded text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
            >
              {copiedText ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              <span className="hidden sm:inline">{copiedText ? "COPIED" : "COPY"}</span>
            </button>
          </div>
        </nav>

        {/* Document Headings & Metadata */}
        <header className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan/10 text-cyan border border-cyan/30 inline-flex items-center gap-1.5">
              <Scale className="w-3 h-3" />
              {currentDoc.badge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight uppercase font-sans">
            {currentDoc.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#a0a2b0] font-sans">
            {currentDoc.subtitle}
          </p>

          <div className="bg-[#12131b] border border-[#2a2c35] p-4 rounded-xl space-y-1.5 font-mono text-xs text-[#8e919e]">
            <div className="text-white font-semibold">
              Operating Publisher: <span className="text-cyan font-normal">operated by Vankayalapati Mallikharjuna Rao, Bengaluru</span>
            </div>
            <div className="text-xs text-slate-400">
              Mandated compliance ledger • <strong className="text-white">Last updated: 25 July 2026</strong>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-[#2a2c35]/60 flex flex-wrap gap-4">
              <span>Governing Law: <strong className="text-slate-300">{currentDoc.governingLaw}</strong></span>
              <span>Jurisdiction: <strong className="text-slate-300">{currentDoc.jurisdiction}</strong></span>
            </div>
          </div>
        </header>

        {/* Document Sections Body */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-cyan animate-pulse">
            LOADING LIVE DOCUMENT DATA FROM SERVER NODE...
          </div>
        ) : (
          <main className="space-y-10 leading-[1.8] text-sm text-[#d1d5db]">
            {currentDoc.sections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-4 scroll-mt-20">
                
                {/* Section Title with Cyan Accent Pillar */}
                <div className="flex items-center gap-3 border-b border-[#2a2c35]/80 pb-2.5">
                  <div className="w-1.5 h-5 bg-cyan rounded-full shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                    {section.title}
                  </h2>
                </div>

                {/* Section Main Text */}
                {section.content && (
                  <p className="text-xs sm:text-sm text-[#c3c6d1] leading-[1.8] whitespace-pre-line font-sans">
                    {section.content}
                  </p>
                )}

                {/* Highlight / Callout Notice Box */}
                {section.calloutBox && renderCalloutBox(section.calloutBox)}

                {/* Bullet Points */}
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2.5 my-3">
                    {section.bulletPoints.map((bp, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-[#12131b] p-3.5 rounded-xl border border-[#2a2c35]/70 text-xs sm:text-sm text-[#d1d5db]">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0 mt-2" />
                        <span className="leading-relaxed">{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Formatted Data Grid / Refund Table & Badge Styling */}
                {section.tableData && section.tableData.length > 0 && (
                  <div className="my-6 overflow-x-auto rounded-xl border border-[#2a2c35] shadow-2xl bg-[#0e0f16]">
                    <table className="w-full text-left text-xs font-sans min-w-[520px]">
                      <thead className="bg-[#1a1c24] text-slate-200 font-mono text-[10px] uppercase tracking-wider border-b border-[#2a2c35]">
                        <tr>
                          <th className="p-3.5 font-bold">Situation</th>
                          <th className="p-3.5 w-28 text-center font-bold">Eligible?</th>
                          <th className="p-3.5 font-bold">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2c35] text-[#d1d5db]">
                        {section.tableData.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-[#0e0f16]" : "bg-[#12131b]"}>
                            <td className="p-3.5 font-medium text-white">{row.situation}</td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              {row.eligible ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <Check className="w-3 h-3 text-emerald-400" /> Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                  <X className="w-3 h-3 text-rose-400" /> No
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-[#a0a2b0]">{row.refundDetails}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            {/* Grievance & Operating Contact Card */}
            <div className="mt-12 bg-gradient-to-br from-[#12141b] to-[#0a0b0f] border border-cyan/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#2a2c35] pb-3">
                <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
                    REGISTERED ENTITY & GRIEVANCE OFFICER
                  </h3>
                  <p className="text-[11px] text-[#8e919e] font-sans">
                    Information Technology Act, 2000 & PayU Merchant Guidelines
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                <div className="bg-[#08090d] p-3.5 rounded-xl border border-[#2a2c35] space-y-1">
                  <div className="text-[10px] font-mono text-[#8e919e] uppercase">OPERATED BY</div>
                  <div className="text-white font-bold">{GRIEVANCE_OFFICER_DETAILS.name}</div>
                  <div className="text-[11px] text-slate-400">{GRIEVANCE_OFFICER_DETAILS.operatingEntity}</div>
                </div>

                <div className="bg-[#08090d] p-3.5 rounded-xl border border-[#2a2c35] space-y-1">
                  <div className="text-[10px] font-mono text-[#8e919e] uppercase">SUPPORT EMAIL</div>
                  <a href={`mailto:${GRIEVANCE_OFFICER_DETAILS.email}`} className="text-cyan font-mono font-bold hover:underline flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {GRIEVANCE_OFFICER_DETAILS.email}
                  </a>
                </div>

                <div className="bg-[#08090d] p-3.5 rounded-xl border border-[#2a2c35] space-y-1">
                  <div className="text-[10px] font-mono text-[#8e919e] uppercase">OFFICIAL PHONE</div>
                  <a href={`tel:${GRIEVANCE_OFFICER_DETAILS.phone.replace(/\s+/g, '')}`} className="text-white font-mono font-bold hover:text-cyan flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan" />
                    {GRIEVANCE_OFFICER_DETAILS.phone}
                  </a>
                </div>

                <div className="bg-[#08090d] p-3.5 rounded-xl border border-[#2a2c35] space-y-1">
                  <div className="text-[10px] font-mono text-[#8e919e] uppercase">POSTAL ADDRESS</div>
                  <div className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
                    <span>{GRIEVANCE_OFFICER_DETAILS.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Floating Back to Top Control (>250px scroll) */}
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 p-3 bg-black/90 hover:bg-cyan hover:text-black border border-cyan/50 text-cyan rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center group"
            title="Return to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
