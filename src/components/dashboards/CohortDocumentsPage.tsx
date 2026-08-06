import React, { useState, useEffect } from "react";
import { ArrowLeft, FileText, Plus, ExternalLink, Lock, Check, Trash2, Upload, FileCode, Image as ImageIcon, FileCheck, Download } from "lucide-react";
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
  const [viewingDoc, setViewingDoc] = useState<CohortDocument | null>(null);
  const [textContent, setTextContent] = useState<string>("");

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
        
        const fileInput = document.getElementById("file-picker-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        showNotification(`SUCCESS // Persisted & registered binary resource in original format: [${newDocName.toUpperCase()}]`);
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

  const handleDeleteDocument = async (doc: CohortDocument) => {
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

  const handleDownloadDocument = (doc: CohortDocument) => {
    const downloadName = doc.fileName || doc.name;
    showNotification(`DOWNLOAD // Streamed native artifact [${downloadName}]`);

    if (doc.file_url && doc.file_url.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = doc.file_url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (doc.file_url) {
      const a = document.createElement("a");
      a.href = doc.file_url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getDocFormatInfo = (doc: CohortDocument) => {
    const fileName = doc.fileName || doc.name || "";
    const fileUrl = doc.file_url || "";
    const mimeType = doc.mimeType || "";

    const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/) || fileUrl.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "";

    let type: "pdf" | "image" | "text" | "office" | "other" = "other";
    
    if (mimeType.includes("pdf") || ext === "pdf") {
      type = "pdf";
    } else if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(ext)) {
      type = "image";
    } else if (
      mimeType.startsWith("text/") || 
      mimeType.includes("json") || 
      ["txt", "md", "json", "js", "ts", "py", "csv", "log", "html", "css", "yaml", "yml"].includes(ext)
    ) {
      type = "text";
    } else if (
      mimeType.includes("officedocument") || 
      mimeType.includes("msword") || 
      mimeType.includes("excel") || 
      mimeType.includes("powerpoint") ||
      ["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)
    ) {
      type = "office";
    }

    return { ext: ext ? `.${ext.toUpperCase()}` : "RAW", type, extLower: ext };
  };

  const getInlineUrl = (doc: CohortDocument) => {
    if (!doc.file_url) return "";
    if (doc.file_url.startsWith("/api/documents/download/")) {
      return `${doc.file_url}?inline=true`;
    }
    return doc.file_url;
  };

  useEffect(() => {
    if (viewingDoc) {
      const info = getDocFormatInfo(viewingDoc);
      if (info.type === "text") {
        const url = getInlineUrl(viewingDoc);
        if (url.startsWith("data:")) {
          try {
            const commaIdx = url.indexOf(",");
            const decoded = atob(url.substring(commaIdx + 1));
            setTextContent(decoded);
          } catch {
            setTextContent("Raw byte payload loaded.");
          }
        } else {
          fetch(url)
            .then(res => res.text())
            .then(text => setTextContent(text))
            .catch(() => setTextContent("Unable to load raw text payload."));
        }
      } else {
        setTextContent("");
      }
    }
  }, [viewingDoc]);

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
        {/* Left column - Documents list */}
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
                {documents.map((doc, idx) => {
                  const info = getDocFormatInfo(doc);
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-black/40 border border-[#2a2c35] hover:border-slate-700 rounded-xl flex flex-col justify-between gap-4 hover:shadow-[0_0_15px_rgba(34,211,238,0.03)] transition-all relative group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-cyan" />
                            <span className="text-[8px] bg-cyan/10 text-cyan border border-cyan/20 px-1.5 py-0.2 rounded font-mono font-bold">
                              {info.ext}
                            </span>
                            <span className="text-[7.5px] text-slate-500 font-mono">{doc.uploaded_at}</span>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteDocument(doc)}
                              className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded transition-all cursor-pointer opacity-80 hover:opacity-100"
                              title="Delete document"
                              id={`delete-doc-btn-${idx}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <h3 className="text-[11px] font-bold text-white uppercase tracking-wide leading-tight">
                          {doc.name}
                        </h3>
                        {doc.fileName && doc.fileName !== doc.name && (
                          <p className="text-[8px] text-slate-500 truncate font-mono">
                            File: {doc.fileName}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="w-full py-2 bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-cyan font-bold uppercase text-[8.5px] rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          id={`server-view-doc-btn-${idx}`}
                        >
                          <FileText className="w-3 h-3" />
                          VIEW IN SERVER VIEWER
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="w-full py-2 bg-[#16171D]/80 hover:bg-slate-800 border border-[#2a2c35] text-white hover:text-cyan hover:border-cyan/40 font-bold uppercase text-[8.5px] rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          id={`view-doc-btn-${idx}`}
                        >
                          <Download className="w-3 h-3 text-cyan" />
                          DOWNLOAD RESOURCE ARTIFACT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Admin upload */}
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
                      <span className="truncate max-w-[200px] text-center">
                        {selectedFile ? selectedFile.name : "BROWSE DEVICE FILE..."}
                      </span>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="text-[7.5px] text-cyan flex justify-between items-center font-mono mt-1 uppercase">
                      <span>TYPE: {selectedFile.type || "BINARY"}</span>
                      <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
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

      {/* IN-SERVER DOCUMENT VIEWER MODAL */}
      {viewingDoc && (() => {
        const info = getDocFormatInfo(viewingDoc);
        const inlineUrl = getInlineUrl(viewingDoc);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-[#0D0E12] border-2 border-cyan/60 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 bg-[#16171D] border-b border-[#2a2c35] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan" />
                  <span className="font-bold text-white uppercase text-xs font-mono tracking-wider">
                    SERVER DOCUMENT VIEWER // {viewingDoc.name}
                  </span>
                  <span className="bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded text-[8px] font-bold">
                    {info.ext}
                  </span>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="text-slate-400 hover:text-white cursor-pointer text-xs font-mono bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded transition-colors"
                >
                  CLOSE [✕]
                </button>
              </div>

              {/* Document Content View */}
              <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-slate-300">
                <div className="p-3 bg-black/60 border border-cyan/20 rounded-lg flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <div className="text-[8px] text-cyan uppercase font-bold">ARTIFACT SPECIFICATION</div>
                    <div className="text-[11px] text-white font-bold">{viewingDoc.name}</div>
                    {viewingDoc.fileName && (
                      <div className="text-[9px] text-slate-400">File: {viewingDoc.fileName}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-slate-500 uppercase">COHORT ID</div>
                    <div className="text-[10px] text-cyan">{cohortId}</div>
                    <div className="text-[8px] text-slate-500">{viewingDoc.uploaded_at}</div>
                  </div>
                </div>

                {/* Native Format Viewer Engine */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase">
                    <span>NATIVE FORMAT PREVIEW CONTAINER</span>
                    <span className="text-cyan font-bold flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      FORMAT INTEGRITY VERIFIED
                    </span>
                  </div>

                  {info.type === "pdf" && (
                    <div className="w-full h-[520px] bg-slate-900 rounded-lg overflow-hidden border border-[#2a2c35]">
                      <iframe
                        src={inlineUrl}
                        className="w-full h-full border-0"
                        title={viewingDoc.name}
                      />
                    </div>
                  )}

                  {info.type === "image" && (
                    <div className="w-full h-[480px] bg-black/90 rounded-lg p-4 flex items-center justify-center border border-[#2a2c35] overflow-auto">
                      <img
                        src={inlineUrl}
                        alt={viewingDoc.name}
                        className="max-w-full max-h-full object-contain rounded shadow-2xl"
                      />
                    </div>
                  )}

                  {info.type === "text" && (
                    <div className="w-full h-[480px] bg-[#090A0F] rounded-lg p-4 border border-[#2a2c35] overflow-auto">
                      <pre className="font-mono text-xs text-cyan leading-relaxed whitespace-pre-wrap">
                        {textContent || "Loading document payload..."}
                      </pre>
                    </div>
                  )}

                  {(info.type === "office" || info.type === "other") && (
                    <div className="space-y-4">
                      {inlineUrl.startsWith("http") ? (
                        <div className="w-full h-[450px] bg-slate-900 rounded-lg overflow-hidden border border-[#2a2c35]">
                          <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(inlineUrl)}&embedded=true`}
                            className="w-full h-full border-0"
                            title={viewingDoc.name}
                          />
                        </div>
                      ) : (
                        <div className="p-8 bg-black/60 border border-[#2a2c35] rounded-lg text-center space-y-4">
                          <FileText className="w-12 h-12 text-cyan mx-auto animate-pulse" />
                          <div>
                            <h4 className="text-white font-bold text-sm uppercase">
                              NATIVE {info.ext} DOCUMENT ARTIFACT
                            </h4>
                            <p className="text-slate-400 text-[10px] mt-1 max-w-md mx-auto">
                              This file is stored in its exact original format without conversion. Click below to stream or download the exact original file to view in your native local application.
                            </p>
                          </div>
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleDownloadDocument(viewingDoc)}
                              className="px-5 py-2.5 bg-cyan text-black font-bold uppercase text-[10px] rounded hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              DOWNLOAD {info.ext} FILE
                            </button>
                            <a
                              href={inlineUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 bg-white/10 text-white font-bold uppercase text-[10px] rounded hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              OPEN IN BROWSER
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-[#16171D] border-t border-[#2a2c35] flex justify-between items-center">
                <span className="text-[8px] text-slate-500 font-mono uppercase">
                  VERIFIED SERVER ARTIFACT LEDGER
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadDocument(viewingDoc)}
                    className="px-4 py-2 bg-cyan text-black font-bold uppercase text-[9px] rounded hover:bg-cyan/90 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    DOWNLOAD RESOURCE ARTIFACT
                  </button>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="px-4 py-2 bg-white/10 text-white font-bold uppercase text-[9px] rounded hover:bg-white/20 transition-all cursor-pointer"
                  >
                    DONE
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
