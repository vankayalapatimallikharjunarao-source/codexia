import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Plus, Copy, Check, Download, Search, Tag, Filter, FileText, Lock } from "lucide-react";
import { VaultEntry } from "../../types";

interface PromptVaultPageProps {
  isAdmin: boolean;
  sessionToken?: string | null;
  onBack: () => void;
  showNotification: (msg: string) => void;
}

export default function PromptVaultPage({
  isAdmin,
  sessionToken,
  onBack,
  showNotification
}: PromptVaultPageProps) {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Form states for Admin Add
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Marketing");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"prompt" | "template">("prompt");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHeaders = () => {
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchVaultEntries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/prompt-vault", {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Failed to load prompt vault: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch vault", err);
      showNotification(`ERROR // Connection failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultEntries();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification("SUCCESS // PROMPT CONTENT COPIED TO CLIPBOARD");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (entry: VaultEntry) => {
    showNotification(`DOWNLOADING // Transfer initiated for [${entry.title.toUpperCase()}]`);
    
    // Create actual download anchor
    const element = document.createElement("a");
    const file = new Blob([entry.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = entry.title.replace(/\s+/g, "_").toLowerCase() + (entry.type === "prompt" ? ".txt" : ".json");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newContent.trim()) {
      showNotification("ERROR // All metadata and content fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/prompt-vault", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          description: newDescription.trim(),
          type: newType,
          content: newContent.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEntries(prev => [data, ...prev]);
        setNewTitle("");
        setNewDescription("");
        setNewContent("");
        setShowAddForm(false);
        showNotification(`SUCCESS // Vault artifact [${newTitle.toUpperCase()}] published`);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Failed to add entry: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Submission failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["ALL", "Marketing", "Operations", "Support", "Analyst"];
  const types = ["ALL", "prompt", "template"];

  // Filter entries
  const filteredEntries = entries.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesType = selectedType === "ALL" || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

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
              <span className="text-[9px] bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan animate-pulse" />
                Premium Alpha Vault
              </span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold">SHARED KNOWLEDGE ENGINE</span>
            </div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider mt-1">
              Template & Prompt Vault
            </h1>
          </div>
        </div>

        <div className="text-[9px] text-slate-400 uppercase tracking-widest bg-black/40 border border-[#2a2c35]/40 px-3 py-1.5 rounded">
          {entries.length} COMPILED SCHEMAS LISTED
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Filtering & Admin Form Panel (col-span-4 if admin form open, otherwise sidebar style) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          {/* Filtering Card */}
          <div className="bg-[#16171D]/40 border border-[#2a2c35] p-4 rounded-xl space-y-3.5">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-[#2a2c35]/60 pb-2">
              <Filter className="w-3.5 h-3.5 text-cyan" />
              VAULT FILTERS
            </h3>

            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-[8px] text-slate-400 uppercase font-bold">Search Vault</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="FILTER BY SCHEMAS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-[#2a2c35] focus:border-cyan rounded px-2.5 py-1.5 text-white outline-none pl-8 uppercase placeholder-slate-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              </div>
            </div>

            {/* Profession Category Filters */}
            <div className="space-y-1.5">
              <label className="text-[8px] text-slate-400 uppercase font-bold">Category Sector</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded text-[7.5px] font-bold uppercase transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-cyan text-black"
                        : "bg-black/60 text-slate-400 border border-[#2a2c35] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filters */}
            <div className="space-y-1.5">
              <label className="text-[8px] text-slate-400 uppercase font-bold">Artifact Type</label>
              <div className="flex gap-1.5">
                {types.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`flex-1 py-1 rounded text-[7.5px] font-bold uppercase transition-all cursor-pointer ${
                      selectedType === t
                        ? "bg-cyan text-black"
                        : "bg-black/60 text-slate-400 border border-[#2a2c35] hover:text-white"
                    }`}
                  >
                    {t === "prompt" ? "PROMPTS" : t === "template" ? "TEMPLATES" : "ALL TYPES"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Add Control Action Card */}
          {isAdmin && (
            <div className="bg-[#16171D]/40 border border-[#2a2c35] p-4 rounded-xl space-y-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full py-2.5 bg-cyan text-black font-bold uppercase text-[9px] hover:opacity-90 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                id="toggle-vault-form-btn"
              >
                <Plus className="w-4 h-4" />
                {showAddForm ? "CLOSE PUBLISHING PORTAL" : "PUBLISH NEW VAULT RESOURCE"}
              </button>

              {showAddForm && (
                <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-[#2a2c35]/60">
                  <div className="text-[8.5px] text-cyan font-bold tracking-wider uppercase border-b border-cyan/20 pb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan" />
                    CREATE NEW CORE RESOURCE
                  </div>

                  <div className="space-y-2 text-[8px]">
                    <div>
                      <label className="text-slate-400 block mb-1">RESOURCE TITLE</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="E.G., TWITTER THREAD BOT WORKFLOW"
                        className="w-full bg-black border border-[#2a2c35] focus:border-cyan rounded px-2 py-1.5 text-white uppercase outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">PROFESSION SECTOR</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full bg-black border border-[#2a2c35] focus:border-cyan rounded px-2 py-1.5 text-white outline-none"
                        >
                          <option value="Marketing">MARKETING</option>
                          <option value="Operations">OPERATIONS</option>
                          <option value="Support">SUPPORT</option>
                          <option value="Analyst">ANALYST</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">ARTIFACT TYPE</label>
                        <select
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as "prompt" | "template")}
                          className="w-full bg-black border border-[#2a2c35] focus:border-cyan rounded px-2 py-1.5 text-white outline-none"
                        >
                          <option value="prompt">PROMPT (COPYABLE)</option>
                          <option value="template">TEMPLATE (DOWNLOADABLE)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">SHORT DESCRIPTION</label>
                      <input
                        type="text"
                        required
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="E.G., SYSTEM PROMPT OR METADATA STRUCTURE SUMMARY..."
                        className="w-full bg-black border border-[#2a2c35] focus:border-cyan rounded px-2 py-1.5 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">
                        {newType === "prompt" ? "PROMPT TEXT CONTENT" : "TEMPLATE SPECIFICATION JSON/TEXT"}
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder={
                          newType === "prompt"
                            ? "PASTE OR WRITE THE FULL SYSTEM PROMPT COMMAND..."
                            : "PASTE THE N8N SCHEMA, WORKFLOW JSON, OR DOWNLOADABLE TEXT..."
                        }
                        className="w-full bg-black border border-[#2a2c35] focus:border-cyan rounded px-2 py-1.5 text-white outline-none font-mono text-[8px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-cyan text-black font-bold uppercase text-[9px] hover:opacity-95 disabled:opacity-50 rounded transition-all cursor-pointer"
                  >
                    {isSubmitting ? "PUBLISHING ARTIFACT..." : "PUBLISH TO PREMIUM SYSTEM"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area - Filtered entries list */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2a2c35]/60 pb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan" />
                SECURED RESOURCE LIST
              </h2>
              <span className="text-[8px] text-slate-500 font-bold tracking-wider font-mono">
                {filteredEntries.length} SHOWN
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-500 uppercase animate-pulse">
                Establishing handshake with centralized premium vault database...
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[#2a2c35] rounded-xl text-slate-500 uppercase tracking-widest px-4 space-y-2">
                <Lock className="w-5 h-5 mx-auto text-slate-600 animate-pulse" />
                <span>No matching templates or prompt schemas found in your compartment sector.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-black/40 border border-[#2a2c35] hover:border-cyan/30 rounded-lg flex flex-col justify-between gap-4 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.015)]"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {item.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="bg-cyan/10 text-cyan border border-cyan/20 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase">
                            {item.category}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase border ${
                            item.type === "prompt"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {item.type === "prompt" ? "PROMPT" : "TEMPLATE"}
                          </span>
                        </div>
                      </div>

                      <p className="text-[8px] text-slate-400 leading-relaxed uppercase">
                        {item.description}
                      </p>

                      <div className="bg-black/60 border border-[#2a2c35]/40 p-2.5 rounded text-[7.5px] font-mono text-slate-300 max-h-24 overflow-y-auto select-all break-all whitespace-pre-wrap">
                        {item.content}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#2a2c35]/40 pt-2.5 mt-1">
                      <span className="text-[7px] text-slate-500 uppercase tracking-widest">
                        DEC REGISTRATION // {item.created_at}
                      </span>

                      <div className="flex gap-2">
                        {item.type === "prompt" ? (
                          <button
                            onClick={() => handleCopy(item.id, item.content)}
                            className="px-2.5 py-1.5 bg-cyan text-black hover:bg-cyan/90 font-bold uppercase text-[7.5px] rounded flex items-center gap-1 transition-all cursor-pointer"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                COPIED
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                COPY PROMPT
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownload(item)}
                            className="px-2.5 py-1.5 bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase text-[7.5px] rounded flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            DOWNLOAD TEMPLATE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
