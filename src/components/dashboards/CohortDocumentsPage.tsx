import React, { useState, useEffect } from "react";
import { ArrowLeft, FileText, Plus, ExternalLink, Lock, Check, Trash2, Upload } from "lucide-react";
import { Cohort, CohortDocument } from "../../types";

interface CohortDocumentsPageProps {
  cohortId: string;
  cohortData: Cohort | null;
  isAdmin: boolean;
  sessionToken?: string | null;
  onBack: () => void;
  showNotification: (msg: string) => void;
}

export default function CohortDocumentsPage({
  cohortId,
  cohortData: initialCohortData,
  isAdmin,
  sessionToken,
  onBack,
  showNotification
}: CohortDocumentsPageProps) {
  const [cohortData, setCohortData] = useState<Cohort | null>(initialCohortData);
  const [isUploading, setIsUploading] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getHeaders = () => {
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchCohortData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cohorts/${cohortId}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCohortData(data);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortData();
  }, [cohortId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) {
      showNotification("ERROR // Document specification name is required");
      return;
    }
    if (!selectedFile || !fileBase64) {
      showNotification("ERROR // Real binary file must be selected for server payload");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch(`/api/cohorts/${cohortId}/documents`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: newDocName,
          fileName: selectedFile.name,
          fileData: fileBase64
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCohortData(data.cohort);
        setNewDocName("");
        setSelectedFile(null);
        setFileBase64(null);
        // Reset file input
        const fileInput = document.getElementById("file-picker-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        showNotification(`SUCCESS // Persisted & registered binary resource: [${newDocName.toUpperCase()}]`);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Failed to add document: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection error: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    const docId = doc.id || doc.file_url.split("/").pop();
    if (!docId) {
      showNotification("ERROR // Unable to identify document resource metadata ID");
      return;
    }

    if (!window.confirm(`SECURED LEDGER DELETION REQUEST // ARE YOU ABSOLUTELY SURE YOU WANT TO DESTROY THE FILE: "${doc.name.toUpperCase()}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cohorts/${cohortId}/documents/${docId}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        setCohortData(data.cohort);
        showNotification(`SUCCESS // Decrypted and removed artifact: [${doc.name.toUpperCase()}]`);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Server rejected deletion: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection error: ${err.message || err}`);
    }
  };

  const documents = cohortData?.documents || [];

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl mx-auto py-4 px-2">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-black border border-[#2a2c35] hover:border-cyan text-white hover:text-cyan rounded-lg transition-all cursor-pointer"
            title="Back to Dashboard"
            id="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {cohortData?.track === "premium" ? "👑 Premium Alpha" : "💻 Base Track"}
              </span>
              <span className="text-[9px] text-slate-500">{cohortId}</span>
            </div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider mt-1">
              COHORT RESOURCE DOCUMENTS STORAGE
            </h1>
          </div>
        </div>

        <div className="text-[9px] text-slate-400 uppercase tracking-widest bg-black/40 border border-[#2a2c35]/40 px-3 py-1.5 rounded">
          {documents.length} SECURED ARTIFACT{documents.length !== 1 ? "S" : ""} LISTED
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Documents list (8 cols if admin, 12 cols if student) */}
        <div className={`${isAdmin ? "col-span-12 lg:col-span-8" : "col-span-12"} space-y-4`}>
          <div className="bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-[#2a2c35]/60 pb-3">
              <FileText className="w-4 h-4 text-cyan" />
              AVAILABLE RESOURCES
            </h2>

            {isLoading && documents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 uppercase animate-pulse">
                Decrypting cohort storage ledger...
              </div>
            ) : documents.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[#2a2c35] rounded-xl text-slate-500 uppercase tracking-widest px-4 space-y-2">
                <Lock className="w-5 h-5 mx-auto text-slate-600" />
                <span>No secured resource documents have been compiled for this cohort track.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-black/40 border border-[#2a2c35] hover:border-slate-700 rounded-xl flex flex-col justify-between gap-4 hover:shadow-[0_0_15px_rgba(34,211,238,0.03)] transition-all relative group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-cyan" />
                          <span className="text-[7.5px] text-slate-500 font-mono">{doc.uploaded_at}</span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded transition-all cursor-pointer opacity-80 hover:opacity-100"
                            title="Delete specification ledger entry"
                            id={`delete-doc-btn-${idx}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-wide leading-tight">
                        {doc.name}
                      </h3>
                    </div>

                    <a
                      href={doc.file_url}
                      download
                      className="w-full py-2 bg-[#16171D]/80 hover:bg-slate-800 border border-[#2a2c35] text-white hover:text-cyan hover:border-cyan/40 font-bold uppercase text-[8.5px] rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                      id={`view-doc-btn-${idx}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      DOWNLOAD RESOURCE ARTIFACT
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Admin upload (4 cols) */}
        {isAdmin && (
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl space-y-4 sticky top-6">
              <h2 className="text-xs font-bold text-cyan uppercase tracking-widest flex items-center gap-2 border-b border-[#2a2c35]/60 pb-3">
                <Plus className="w-4 h-4" />
                ADD NEW SPECIFICATION
              </h2>

              <form onSubmit={handleAddDocument} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase tracking-wider block text-[8.5px]">RESOURCE / NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G., ENTERPRISE SYLLABUS ROADMAP"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full bg-black border border-[#2a2c35] focus:border-cyan text-white p-2 rounded outline-none uppercase text-[9px]"
                    id="new-doc-name-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase tracking-wider block text-[8.5px]">NATIVE FILE SELECT</label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-picker-input"
                    />
                    <label
                      htmlFor="file-picker-input"
                      className="w-full bg-black hover:bg-slate-900 border border-dashed border-[#2a2c35] hover:border-cyan/50 text-slate-400 hover:text-white p-4 rounded outline-none text-[9px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all uppercase"
                    >
                      <Upload className="w-5 h-5 text-cyan animate-pulse" />
                      <span>{selectedFile ? selectedFile.name : "BROWSE DEVICE CODES / FILE..."}</span>
                    </label>
                  </div>
                  {selectedFile && (
                    <span className="text-[7.5px] text-cyan block text-right font-mono mt-1 uppercase">
                      READY // {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="w-full py-2.5 bg-cyan text-black font-extrabold uppercase text-[9px] tracking-widest rounded hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  id="submit-doc-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isUploading ? "TRANSMITTING TO CLOUD..." : "PERSIST DOCUMENT"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
