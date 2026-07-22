import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ArrowRight, 
  Users, 
  Layers, 
  BookOpen, 
  MessageSquare, 
  Lock, 
  ExternalLink, 
  ChevronRight, 
  Archive, 
  TrendingUp, 
  Clock, 
  Video,
  FileText,
  Sparkles
} from "lucide-react";
import { Cohort, StudentProfile } from "../../types";
import { googleSignIn, createMeetSpace, getAccessToken } from "../../lib/googleMeet";

interface AdminCurriculumCalendarProps {
  sessionToken?: string | null;
  showNotification: (msg: string) => void;
}

const MONTHS = [
  { value: 1, name: "January" },
  { value: 2, name: "February" },
  { value: 3, name: "March" },
  { value: 4, name: "April" },
  { value: 5, name: "May" },
  { value: 6, name: "June" },
  { value: 7, name: "July" },
  { value: 8, name: "August" },
  { value: 9, name: "September" },
  { value: 10, name: "October" },
  { value: 11, name: "November" },
  { value: 12, name: "December" }
];

const bSyllabusDays = [
  { id: "day-1", title: "AI Basics & the Micro-Bot Idea", dayNumber: 1 },
  { id: "day-2", title: "Building Your First Micro-Bot", dayNumber: 2 },
  { id: "day-3", title: "Micro-Bots for Your Profession", dayNumber: 3 },
  { id: "day-4", title: "Connecting Your Bot to Real Tools", dayNumber: 4 },
  { id: "day-5", title: "Making It Visual: Quick Video & Image Content", dayNumber: 5 },
  { id: "day-6", title: "Capstone: Ship Your Micro-Bot", dayNumber: 6 }
];

const pSyllabusDays = [
  { id: "pday-1", title: "Systems Thinking: Mapping a Workflow to Bots", dayNumber: 1 },
  { id: "pday-2", title: "Designing Multiple Bots That Work Together", dayNumber: 2 },
  { id: "pday-3", title: "Voice & Conversational Bots", dayNumber: 3 },
  { id: "pday-4", title: "Web Scraping & Data Gathering Bots", dayNumber: 4 },
  { id: "pday-5", title: "Writing Assistants that Adapt to Your Style", dayNumber: 5 },
  { id: "pday-6", title: "AI-Powered Customer Support & Email Auto-Replies", dayNumber: 6 },
  { id: "pday-7", title: "Research & Analysis Bots", dayNumber: 7 },
  { id: "pday-8", title: "Dynamic Marketing Image Generation", dayNumber: 8 },
  { id: "pday-9", title: "Automation: Handling File Uploads", dayNumber: 9 },
  { id: "pday-10", title: "Complex Workflows with Webhook Triggers", dayNumber: 10 },
  { id: "pday-11", title: "AI Voiceovers & Audio Editing on Autopilot", dayNumber: 11 },
  { id: "pday-12", title: "Creating Stitched AI Video Walkthroughs", dayNumber: 12 },
  { id: "pday-13", title: "Graduate Presentation & Professional Roadmap", dayNumber: 13 }
];

export default function AdminCurriculumCalendar({
  sessionToken,
  showNotification
}: AdminCurriculumCalendarProps) {
  const [years, setYears] = useState<number[]>([2026]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // Default July
  const [cohortsList, setCohortsList] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cohort Workspace details modal / subpanel
  const [activeCohortDetails, setActiveCohortDetails] = useState<Cohort | null>(null);
  const [cohortRoster, setCohortRoster] = useState<StudentProfile[]>([]);
  const [cohortPosts, setCohortPosts] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // New Year input state
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");

  // Create Cohort Form state
  const [isCreatingCohort, setIsCreatingCohort] = useState(false);
  const [newCohortTrack, setNewCohortTrack] = useState<"base" | "premium">("base");
  const [newCohortStartDate, setNewCohortStartDate] = useState("");
  const [newCohortEndDate, setNewCohortEndDate] = useState("");
  const [newCohortCapacity, setNewCohortCapacity] = useState("150");
  const [isSavingCohort, setIsSavingCohort] = useState(false);

  // Sync capacity with track type defaults
  useEffect(() => {
    setNewCohortCapacity(newCohortTrack === "premium" ? "35" : "150");
  }, [newCohortTrack]);

  // Status Change conflict resolution state
  const [conflictCohort, setConflictCohort] = useState<Cohort | null>(null);
  const [pendingStatusChangeCohortId, setPendingStatusChangeCohortId] = useState<string | null>(null);

  const getHeaders = () => {
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = getHeaders();
      
      // 1. Fetch Years
      const yearsRes = await fetch("/api/admin/cohorts/years", { headers });
      if (yearsRes.ok) {
        const yearsData = await yearsRes.json();
        setYears(yearsData);
      }

      // 2. Fetch Cohorts
      const cohortsRes = await fetch("/api/cohorts", { headers });
      if (cohortsRes.ok) {
        const cohortsData = await cohortsRes.json();
        setCohortsList(cohortsData);
      }
    } catch (err) {
      console.error(err);
      showNotification("ERROR // Failed to load curriculum sync data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sessionToken]);

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    const yr = parseInt(newYearInput, 10);
    if (!yr || isNaN(yr) || yr < 2020 || yr > 2050) {
      showNotification("ERROR // Year coordinate must be between 2020 and 2050");
      return;
    }
    if (years.includes(yr)) {
      showNotification("ERROR // Year coordinate already exists in ledger");
      return;
    }

    try {
      const headers = getHeaders();
      const res = await fetch("/api/admin/cohorts/years", {
        method: "POST",
        headers,
        body: JSON.stringify({ year: yr })
      });
      if (res.ok) {
        const data = await res.json();
        setYears(data.years);
        setSelectedYear(yr);
        setNewYearInput("");
        setIsAddingYear(false);
        showNotification(`SUCCESS // Year ${yr} initialized into curriculum ledger!`);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Failed to add year: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection error: ${err.message || err}`);
    }
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohortStartDate || !newCohortEndDate) {
      showNotification("ERROR // Start and End dates are both required");
      return;
    }

    setIsSavingCohort(true);
    try {
      const headers = getHeaders();
      const res = await fetch("/api/admin/cohorts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth,
          track: newCohortTrack,
          start_date: newCohortStartDate,
          end_date: newCohortEndDate,
          capacity: Number(newCohortCapacity) || (newCohortTrack === "premium" ? 35 : 150)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCohortsList(prev => [...prev, data.cohort]);
        setIsCreatingCohort(false);
        setNewCohortStartDate("");
        setNewCohortEndDate("");
        showNotification(`SUCCESS // Cohort ${data.cohort.id} successfully compiled!`);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Compile failed: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection error: ${err.message || err}`);
    } finally {
      setIsSavingCohort(false);
    }
  };

  const updateCohortStatus = async (cohortId: string, status: string, resolvePrevious?: "active" | "completed") => {
    try {
      const headers = getHeaders();
      const res = await fetch(`/api/admin/cohorts/${cohortId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, resolvePrevious })
      });

      if (res.ok) {
        const data = await res.json();
        setCohortsList(prev => prev.map(c => c.id === data.cohort.id ? data.cohort : c));
        setConflictCohort(null);
        setPendingStatusChangeCohortId(null);
        showNotification(`SUCCESS // Cohort ${cohortId} transitioned to status [${status.toUpperCase()}]`);
        
        // Refresh detail view if open
        if (activeCohortDetails && activeCohortDetails.id === cohortId) {
          setActiveCohortDetails(data.cohort);
        }

        // Auto-generate Google Meet if transitioned to "active"
        if (status === "active") {
          try {
            let token = await getAccessToken();
            if (!token) {
              const result = await googleSignIn();
              token = result?.accessToken || null;
            }
            if (token) {
              showNotification("PROVISIONING // Creating Google Meet space...");
              const space = await createMeetSpace(token);
              if (space.meetingUri) {
                // Update cohort live meet URL
                const meetRes = await fetch(`/api/admin/cohorts/${cohortId}/meet`, {
                  method: "PATCH",
                  headers: {
                    ...headers,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ live_meet_url: space.meetingUri })
                });
                if (meetRes.ok) {
                  const updatedCohortData = await meetRes.json();
                  setCohortsList(prev => prev.map(c => c.id === cohortId ? updatedCohortData.cohort : c));
                  if (activeCohortDetails && activeCohortDetails.id === cohortId) {
                    setActiveCohortDetails(updatedCohortData.cohort);
                  }
                  showNotification(`SUCCESS // Google Meet space auto-generated for Active cohort: ${space.meetingUri}`);
                }
              }
            }
          } catch (meetErr: any) {
            console.error("Auto-meet generation failed:", meetErr);
            showNotification(`MEET INFO // Cohort set to Active. To connect a live Google Meet, use the manual generate action in the detail pane.`);
          }
        }
        
        // Re-sync all cohorts list to pull updated status values of other resolved cohorts
        const syncRes = await fetch("/api/cohorts", { headers });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          setCohortsList(syncData);
        }
      } else if (res.status === 409) {
        const err = await res.json();
        if (err.error === "conflict") {
          setConflictCohort(err.conflictingCohort);
          setPendingStatusChangeCohortId(cohortId);
        } else {
          showNotification(`ERROR // Transition failed: ${err.error || "Unknown"}`);
        }
      } else {
        const err = await res.json();
        showNotification(`ERROR // Transition failed: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection error: ${err.message || err}`);
    }
  };

  const handleUpdateSyllabusStatus = async (
    cohortId: string,
    dayId: string,
    status: "upcoming" | "active" | "completed"
  ) => {
    try {
      const headers = getHeaders();
      const res = await fetch(`/api/cohorts/${cohortId}/syllabus_status`, {
        method: "POST",
        headers,
        body: JSON.stringify({ dayId, status })
      });

      if (res.ok) {
        const data = await res.json();
        setCohortsList(prev => prev.map(c => c.id === cohortId ? { ...c, syllabus_status: data.syllabus_status } : c));
        if (activeCohortDetails && activeCohortDetails.id === cohortId) {
          setActiveCohortDetails(prev => prev ? { ...prev, syllabus_status: data.syllabus_status } : null);
        }
        showNotification(`SUCCESS // DAY [${dayId.toUpperCase()}] updated to status [${status.toUpperCase()}]`);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Failed to update syllabus day status: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection error: ${err.message || err}`);
    }
  };

  const handleResolveConflict = async (resolveAs: "active" | "completed") => {
    if (!pendingStatusChangeCohortId) return;
    await updateCohortStatus(pendingStatusChangeCohortId, "enrolling", resolveAs);
  };

  const fetchCohortWorkspaceDetails = async (cohort: Cohort) => {
    setActiveCohortDetails(cohort);
    setIsLoadingDetails(true);
    setCohortRoster([]);
    setCohortPosts([]);
    try {
      const headers = getHeaders();

      // 1. Fetch Roster
      const rosterRes = await fetch(`/api/admin/cohorts/${cohort.id}/roster`, { headers });
      if (rosterRes.ok) {
        const rosterData = await rosterRes.json();
        setCohortRoster(rosterData);
      }

      // 2. Fetch Community Posts
      const postsRes = await fetch(`/api/community/${cohort.id}`, { headers });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setCohortPosts(postsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const monthlyCohorts = cohortsList.filter(c => c.year === selectedYear && c.month === selectedMonth);

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Curriculum Hub Header Card */}
      <div className="bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 flex gap-2">
          <span className="text-[8px] bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Curriculum Node V4.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan">
            <CalendarIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              ACADEMIC CURRICULUM CALENDAR &amp; COHORT CONTROLLER
            </h2>
            <p className="text-[9px] text-[#A0A2B0] uppercase mt-1 leading-relaxed">
              Design annual tracks, schedule rolling enrollment slots, assign starting milestones, and archive graduated cohorts permanently.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Year Selector and Month Grid (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Year selector rail */}
          <div className="bg-black/40 border border-[#2a2c35] p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] text-slate-400 uppercase font-bold mr-2 tracking-wider">
                CHOOSE YEAR LEDGER:
              </span>
              {years.map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    selectedYear === yr
                      ? "bg-cyan text-black font-extrabold"
                      : "bg-[#16171D] hover:bg-slate-800 border border-[#2a2c35] text-slate-300"
                  }`}
                >
                  {yr}
                </button>
              ))}

              {isAddingYear ? (
                <form onSubmit={handleAddYear} className="flex items-center gap-1 ml-2">
                  <input
                    type="number"
                    min="2020"
                    max="2050"
                    required
                    placeholder="YYYY"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    className="w-16 bg-black border border-cyan/40 focus:border-cyan text-white px-2 py-1 rounded text-[10px] outline-none font-bold"
                  />
                  <button
                    type="submit"
                    className="p-1 bg-cyan text-black rounded hover:opacity-90 cursor-pointer text-[9px] font-bold"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingYear(false)}
                    className="p-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded cursor-pointer text-[9px]"
                  >
                    CANCEL
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingYear(true)}
                  className="px-2.5 py-1.5 rounded text-[10px] bg-cyan/10 border border-cyan/20 hover:border-cyan hover:bg-cyan/20 text-cyan cursor-pointer flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  ADD YEAR
                </button>
              )}
            </div>

            <div className="text-[8.5px] text-slate-500 uppercase tracking-widest font-mono">
              YEAR: {selectedYear} GRID ACTIVE
            </div>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {MONTHS.map(m => {
              const count = cohortsList.filter(c => c.year === selectedYear && c.month === m.value).length;
              const hasEnrolling = cohortsList.some(c => c.year === selectedYear && c.month === m.value && c.status === "enrolling");
              const isSelected = selectedMonth === m.value;
              
              return (
                <button
                  key={m.value}
                  onClick={() => {
                    setSelectedMonth(m.value);
                    setActiveCohortDetails(null);
                  }}
                  className={`p-4 border rounded-xl text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 cursor-pointer group ${
                    isSelected
                      ? "bg-[#142929]/20 border-cyan shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                      : "bg-[#16171D]/40 border-[#2a2c35] hover:border-slate-700"
                  }`}
                >
                  {hasEnrolling && (
                    <span className="absolute top-0 right-0 bg-cyan text-black font-bold text-[6px] px-1.5 py-0.5 rounded-bl uppercase tracking-widest animate-pulse">
                      ENROLLING
                    </span>
                  )}
                  
                  <div>
                    <span className={`text-[11px] font-bold block uppercase tracking-wider ${isSelected ? "text-cyan" : "text-white group-hover:text-cyan"}`}>
                      {m.name}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                      {selectedYear}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[8px] text-slate-400 font-mono uppercase">
                      {count === 0 ? "EMPTY" : `${count} COHORT${count > 1 ? "S" : ""}`}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-cyan translate-x-1" : "text-slate-500 group-hover:text-white"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scheduled Cohorts List in selected Month */}
          <div className="bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#2a2c35]/60 pb-3">
              <div>
                <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[10px]">
                  <Layers className="w-4 h-4 text-cyan" />
                  COHORTS IN {MONTHS.find(m => m.value === selectedMonth)?.name.toUpperCase()} {selectedYear}
                </span>
                <p className="text-[8px] text-[#A0A2B0] uppercase mt-1">
                  Draft, customize specifications, configure active status, or access community records.
                </p>
              </div>

              {!isCreatingCohort && (
                <button
                  onClick={() => setIsCreatingCohort(true)}
                  className="px-3.5 py-2 bg-cyan text-black font-bold text-[9px] uppercase tracking-wider hover:opacity-90 rounded cursor-pointer flex items-center gap-1 self-start sm:self-center transition-all"
                >
                  <Plus className="w-4 h-4" />
                  CREATE COHORT
                </button>
              )}
            </div>

            {isCreatingCohort && (
              <form onSubmit={handleCreateCohort} className="p-4 bg-black/60 border border-cyan/20 rounded-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#2a2c35] pb-2">
                  <span className="text-[9px] text-cyan font-bold uppercase tracking-wider flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    COMPILE NEW COHORT RECORD
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCohort(false)}
                    className="text-[8px] text-slate-500 hover:text-white uppercase font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-[9px]">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase tracking-wider block">COHORT TRACK TYPE</label>
                    <div className="flex bg-[#16171D] border border-[#2a2c35] rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => setNewCohortTrack("base")}
                        className={`flex-1 py-1.5 rounded uppercase text-[8.5px] font-bold ${
                          newCohortTrack === "base"
                            ? "bg-cyan text-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Base Cohort
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCohortTrack("premium")}
                        className={`flex-1 py-1.5 rounded uppercase text-[8.5px] font-bold ${
                          newCohortTrack === "premium"
                            ? "bg-cyan text-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Premium Alpha
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-slate-400 uppercase tracking-wider block">START DATE</label>
                    <input
                      type="date"
                      required
                      value={newCohortStartDate}
                      onChange={(e) => setNewCohortStartDate(e.target.value)}
                      className="w-full bg-[#16171D] border border-[#2a2c35] focus:border-cyan text-white p-2 rounded outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-slate-400 uppercase tracking-wider block">END DATE</label>
                    <input
                      type="date"
                      required
                      value={newCohortEndDate}
                      onChange={(e) => setNewCohortEndDate(e.target.value)}
                      className="w-full bg-[#16171D] border border-[#2a2c35] focus:border-cyan text-white p-2 rounded outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-slate-400 uppercase tracking-wider block">MAX SEATS</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="1000"
                      value={newCohortCapacity}
                      onChange={(e) => setNewCohortCapacity(e.target.value)}
                      className="w-full bg-[#16171D] border border-[#2a2c35] focus:border-cyan text-white p-2 rounded outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingCohort}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan to-blue-500 hover:from-cyan hover:to-cyan text-black font-extrabold uppercase text-[9px] tracking-widest rounded transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingCohort ? "COMPILING SYSTEM RECORD..." : "COMPILE & SAVE COHORT"}
                </button>
              </form>
            )}

            {/* Prompt conflict modal overlay if status is enrolling and conflict happens */}
            {conflictCohort && (
              <div className="p-4 bg-red-950/20 border-2 border-red-500/40 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-red-400 uppercase block tracking-wider animate-pulse">
                  ⚠ CONFLICTING ENROLLMENT STATE DETECTED
                </span>
                <p className="text-[8.5px] text-slate-300 leading-relaxed uppercase">
                  Another cohort of the same track is currently marked <strong className="text-cyan">Enrolling</strong>: <code className="bg-black px-1.5 py-0.5 text-white">{conflictCohort.id}</code>.
                  Only one cohort per track should be enrolling. Please specify how to resolve the previous cohort:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleResolveConflict("active")}
                    className="px-3.5 py-1.5 bg-cyan text-black font-extrabold uppercase text-[8.5px] rounded hover:opacity-90 transition-all cursor-pointer"
                  >
                    TRANSITION OLD COHORT TO [ACTIVE]
                  </button>
                  <button
                    onClick={() => handleResolveConflict("completed")}
                    className="px-3.5 py-1.5 bg-[#16171D] hover:bg-slate-800 text-white font-bold uppercase border border-red-500/30 text-[8.5px] rounded transition-all cursor-pointer"
                  >
                    TRANSITION OLD COHORT TO [COMPLETED]
                  </button>
                  <button
                    onClick={() => {
                      setConflictCohort(null);
                      setPendingStatusChangeCohortId(null);
                    }}
                    className="px-3 py-1.5 bg-transparent hover:underline text-slate-400 uppercase text-[8px] cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {monthlyCohorts.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#2a2c35] rounded-xl text-slate-500 uppercase tracking-widest text-[9px]">
                No cohorts scheduled in this month ledger. Click "Create Cohort" above to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monthlyCohorts.map(cohort => {
                  const isWorkspaceOpen = activeCohortDetails?.id === cohort.id;
                  
                  return (
                    <div
                      key={cohort.id}
                      className={`p-4 border rounded-xl flex flex-col justify-between gap-4 transition-all ${
                        isWorkspaceOpen 
                          ? "bg-[#142929]/10 border-cyan/40" 
                          : "bg-black/40 border-[#2a2c35] hover:border-slate-800"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-black/60 border border-slate-700 font-mono font-bold text-white px-2 py-0.5 rounded text-[8.5px] tracking-wider block truncate max-w-[150px]">
                              {cohort.id}
                            </span>
                            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider block mt-1.5">
                              {cohort.track === "premium" ? "👑 Premium Alpha" : "💻 Base Cohort"}
                            </span>
                          </div>

                          <span className={`text-[7px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${
                            cohort.status === "draft" ? "bg-slate-950 text-slate-400 border-slate-800" :
                            cohort.status === "enrolling" ? "bg-cyan/10 text-cyan border-cyan/30 animate-pulse" :
                            cohort.status === "active" ? "bg-green-950 text-green-400 border-green-800" :
                            cohort.status === "completed" ? "bg-purple-950 text-purple-400 border-purple-800" :
                            "bg-[#221c16] text-[#ff9900] border-[#995c00]"
                          }`}>
                            {cohort.status}
                          </span>
                        </div>

                        <div className="space-y-1 font-mono text-[8.5px] text-[#A0A2B0] uppercase border-t border-[#2a2c35]/40 pt-2.5">
                          <div>Start: <strong className="text-slate-300">{cohort.start_date}</strong></div>
                          <div>End: <strong className="text-slate-300">{cohort.end_date}</strong></div>
                          {cohort.repo_url && (
                            <div className="truncate text-[7.5px] tracking-tight">Repo: <strong className="text-cyan underline select-all">{cohort.repo_url}</strong></div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#2a2c35]/40 space-y-2">
                        <div className="space-y-1">
                          <span className="text-[7.5px] text-slate-500 uppercase font-bold block mb-1">
                            TRANSITION STATUS LEDGER:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {["draft", "enrolling", "active", "completed", "archived"].map(st => {
                              const isCurrent = cohort.status === st;
                              return (
                                <button
                                  key={st}
                                  onClick={() => updateCohortStatus(cohort.id, st)}
                                  disabled={isCurrent}
                                  className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                    isCurrent
                                      ? "bg-[#16171D] text-white border border-slate-700 cursor-default"
                                      : "bg-black hover:bg-slate-900 border border-[#2a2c35] text-[#A0A2B0] hover:text-white"
                                  }`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={() => fetchCohortWorkspaceDetails(cohort)}
                          className="w-full mt-1.5 py-1.5 bg-[#16171D]/60 hover:bg-slate-800 border border-[#2a2c35] text-white hover:text-cyan hover:border-cyan/40 font-bold uppercase text-[8px] rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {isWorkspaceOpen ? "REFRESH WORKSPACE" : "OPEN COHORT WORKSPACE"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Cohort Workspace Details (4 cols) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl space-y-5 sticky top-6">
            <div className="flex justify-between items-center border-b border-[#2a2c35]/60 pb-2">
              <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[9.5px]">
                <Layers className="w-4 h-4 text-cyan" />
                COHORT WORKSPACE
              </span>
              {activeCohortDetails && (
                <button
                  onClick={() => setActiveCohortDetails(null)}
                  className="text-[8px] text-slate-500 hover:text-white uppercase font-bold"
                >
                  Close
                </button>
              )}
            </div>

            {!activeCohortDetails ? (
              <div className="py-24 text-center border border-dashed border-[#2a2c35] rounded-xl text-slate-500 uppercase tracking-widest text-[9px] px-4 space-y-2">
                <Lock className="w-5 h-5 mx-auto text-slate-600" />
                <span>SELECT A COHORT IN THE GRID TO DECRYPT DETAILED METRICS &amp; STUDENT ROSTERS</span>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Cohort Spec Header */}
                <div className="bg-black/60 p-4 border border-[#2a2c35] rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">
                      {activeCohortDetails.id}
                    </span>
                    <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      activeCohortDetails.status === "archived" ? "bg-[#221c16] text-[#ff9900] border-[#995c00]" : "bg-cyan/10 text-cyan border-cyan/30"
                    }`}>
                      {activeCohortDetails.status}
                    </span>
                  </div>
                  <h3 className="text-[11px] font-bold text-white uppercase leading-snug">
                    {activeCohortDetails.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-slate-400 uppercase pt-2 border-t border-[#2a2c35]/40">
                    <div>Start: <strong className="text-white">{activeCohortDetails.start_date}</strong></div>
                    <div>End: <strong className="text-white">{activeCohortDetails.end_date}</strong></div>
                    <div className="col-span-2">Seq: <strong className="text-white">0{activeCohortDetails.sequence}</strong></div>
                  </div>
                </div>

                {/* Curriculum Syllabus Controller Section */}
                <div className="space-y-3 bg-[#142929]/10 border border-cyan/20 p-3.5 rounded-lg">
                  <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[8.5px]">
                    <Layers className="w-4 h-4 text-cyan" />
                    CURRICULUM SYLLABUS STATUS CONTROLLER
                  </span>
                  <p className="text-[7.5px] text-slate-400 uppercase leading-relaxed font-mono">
                    Select a status for each curriculum day to sync instantly with student dashboards. Only completed days contribute to student progress bars.
                  </p>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-[#2a2c35] rounded bg-black/40 p-2">
                    {(activeCohortDetails.track === "premium" ? pSyllabusDays : bSyllabusDays).map((day) => {
                      const currentStatus = (activeCohortDetails.syllabus_status && activeCohortDetails.syllabus_status[day.id]) || "upcoming";
                      return (
                        <div key={day.id} className="p-2 bg-black/60 border border-[#2a2c35]/40 rounded space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-bold text-slate-300 font-mono">
                              DAY {day.dayNumber}: {day.title.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex gap-1.5 font-mono">
                            {["upcoming", "active", "completed"].map((st) => {
                              const isSelected = currentStatus === st;
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleUpdateSyllabusStatus(activeCohortDetails.id, day.id, st as "upcoming" | "active" | "completed")}
                                  className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                                    isSelected
                                      ? "bg-cyan text-black border-cyan"
                                      : "bg-black/60 text-slate-400 border-[#2a2c35] hover:text-white"
                                  }`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cohort Student Roster Section */}
                <div className="space-y-2">
                  <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[8px]">
                    <Users className="w-3.5 h-3.5 text-cyan" />
                    ENROLLED STUDENT ROSTER
                  </span>
                  
                  {isLoadingDetails ? (
                    <div className="text-[8px] font-mono text-slate-500 uppercase animate-pulse">
                      LOADING STUDENT RECORDS...
                    </div>
                  ) : cohortRoster.length === 0 ? (
                    <div className="p-3 border border-dashed border-[#2a2c35] bg-black/20 rounded text-center text-slate-500 text-[8px] uppercase font-mono">
                      No student accounts registered under this cohort ID.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-[#2a2c35] rounded bg-black/40 p-2 space-y-1.5">
                      {cohortRoster.map((st, idx) => (
                        <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-black/60 border border-[#2a2c35]/40">
                          <span className="text-[8px] text-white font-mono block truncate max-w-[130px] uppercase">
                            {st.username || st.email.split("@")[0]}
                          </span>
                          <span className="text-[7.5px] text-slate-400 font-mono block truncate max-w-[130px]">
                            {st.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cohort Documents Section */}
                <div className="space-y-2">
                  <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[8px]">
                    <FileText className="w-3.5 h-3.5 text-cyan" />
                    COHORT RESOURCES
                  </span>
                  
                  {activeCohortDetails.documents && activeCohortDetails.documents.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeCohortDetails.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-[#2a2c35]/40 text-[8px] text-slate-300 hover:text-white transition-all"
                        >
                          <span className="truncate max-w-[170px] uppercase font-mono">
                            {doc.name}
                          </span>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 text-slate-500 hover:text-cyan transition-colors" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 border border-dashed border-[#2a2c35] rounded text-center text-slate-500 text-[8px] uppercase">
                      No custom resources uploaded yet.
                    </div>
                  )}
                </div>

                {/* Prompt & Template Vault Section (Premium only) */}
                {activeCohortDetails.track === "premium" && (
                  <div className="space-y-2 bg-[#1e2e2e]/20 border border-cyan/20 p-3 rounded-lg">
                    <span className="font-bold text-cyan uppercase tracking-widest flex items-center gap-1.5 text-[8.5px]">
                      <Sparkles className="w-3.5 h-3.5 text-cyan animate-pulse" />
                      TEMPLATE & PROMPT VAULT
                    </span>
                    <p className="text-[7.5px] text-slate-400 uppercase leading-relaxed font-mono">
                      Central library of downloadable bot templates and prompt files shared across premium cohorts. Access the Student Portal view to manage or download entries.
                    </p>
                  </div>
                )}

                {/* Cohort Community History Section */}
                <div className="space-y-2">
                  <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[8px]">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan" />
                    COHORT COMMUNITY HISTORY
                  </span>
                  
                  {isLoadingDetails ? (
                    <div className="text-[8px] font-mono text-slate-500 uppercase animate-pulse">
                      LOADING COHORT POSTS...
                    </div>
                  ) : cohortPosts.length === 0 ? (
                    <div className="p-3 border border-dashed border-[#2a2c35] bg-black/20 rounded text-center text-slate-500 text-[8px] uppercase font-mono">
                      No community discussions or announcements logged yet.
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto border border-[#2a2c35] rounded bg-black/40 p-2 space-y-3.5">
                      {cohortPosts.map((post) => (
                        <div key={post.id} className="space-y-1 border-b border-[#2a2c35]/30 pb-2 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold text-slate-300">
                              {post.author_name}
                            </span>
                            <span className="text-[7px] text-slate-500 uppercase font-mono">
                              {post.created_at}
                            </span>
                          </div>
                          <p className="text-[8px] text-slate-400 uppercase leading-relaxed font-mono">
                            {post.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Read only summary notice if Archived */}
                {activeCohortDetails.status === "archived" && (
                  <div className="p-3 border border-dashed border-[#ff9900]/30 bg-[#221c16]/20 rounded text-center space-y-1 text-[#ff9900]">
                    <Archive className="w-4 h-4 mx-auto animate-pulse" />
                    <span className="text-[8px] font-bold font-mono uppercase block">
                      ARCHIVED WORKSPACE // READ_ONLY
                    </span>
                    <p className="text-[7.5px] text-slate-400 uppercase font-mono leading-relaxed">
                      All student rosters, discussion threads, and resources have been locked in the Codexia permanent archive ledger.
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
