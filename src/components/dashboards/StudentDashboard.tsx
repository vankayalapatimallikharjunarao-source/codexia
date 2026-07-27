import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Github, 
  ExternalLink, 
  Calendar,
  Layers,
  Award,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  MessageSquare,
  Users,
  Send,
  Sparkles,
  UserCheck,
  FileText,
  Download,
  Lock,
  Plus
} from "lucide-react";
import { SyllabusDay } from "../../types";
import { initialSyllabus, premiumSyllabus } from "../../data";
import StudentTestimonials from "../StudentTestimonials";
import CohortCommunityHub from "../CohortCommunityHub";
import CohortDocumentsPage from "./CohortDocumentsPage";
import CohortCommunityMeshPage from "./CohortCommunityMeshPage";
import PromptVaultPage from "./PromptVaultPage";
import { googleSignIn, createMeetSpace, auth } from "../../lib/googleMeet";
import { onAuthStateChanged } from "firebase/auth";

interface StudentDashboardProps {
  syllabus: SyllabusDay[];
  onNewLog: (desc: string, severity: "HIGH" | "MEDIUM" | "LOW") => void;
  showNotification: (msg: string) => void;
  userTier: "standard" | "premium";
  userRole?: "admin" | "student" | null;
  userTrack?: "base" | "premium" | "admin" | null;
  userCohortId?: string | null;
  sessionToken?: string | null;
  currentUserEmail?: string | null;
}

export default function StudentDashboard({
  syllabus,
  onNewLog,
  showNotification,
  userTier,
  userRole = "student",
  userTrack = "base",
  userCohortId = null,
  sessionToken = null,
  currentUserEmail = null
}: StudentDashboardProps) {
  const isAdmin = userRole === "admin";
  const isPremium = userTrack === "premium" || isAdmin;

  // Active Cohort Selection (Admin-controlled, defaults to user track for students)
  const [activeCohortId, setActiveCohortId] = useState<string>(() => {
    if (userRole === "admin") {
      return "CODX-2026-07-BASE-01";
    }
    return userCohortId || "CODX-2026-07-BASE-01";
  });

  // Resource section tab states
  const [activeResourceTab, setActiveResourceTab] = useState<"links" | "docs" | "community">("links");
  const [documentName, setDocumentName] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [manualMeetUrl, setManualMeetUrl] = useState("");
  const [isUpdatingMeetUrl, setIsUpdatingMeetUrl] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Premium Suite Scheduling states
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  const handleBookSlot = () => {
    if (!selectedSlot) return;
    setBookedSlot(selectedSlot);
    showNotification(`SUCCESS // 1:1 Architecture Review scheduled for ${selectedSlot}!`);
  };

  // Cohort details synced from backend
  const [cohortData, setCohortData] = useState<any>(null);
  const realMeetUrl = cohortData?.live_meet_url || "";

  const handleSaveManualMeet = async () => {
    if (!manualMeetUrl.trim()) {
      showNotification("ERROR // Meet URL cannot be empty");
      return;
    }
    setIsUpdatingMeetUrl(true);
    try {
      const token = sessionToken || sessionStorage.getItem("codexia_session_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/cohorts/${activeCohortId}/next_session`, {
        method: "POST",
        headers,
        body: JSON.stringify({ live_meet_url: manualMeetUrl })
      });
      if (res.ok) {
        showNotification("SUCCESS // Google Meet space successfully updated!");
        onNewLog(`MANUAL GOOGLE MEET UPDATED // URL: ${manualMeetUrl}`, "HIGH");
        // Refetch immediately
        const updatedCohort = await res.json();
        if (updatedCohort.cohort) {
          setCohortData(updatedCohort.cohort);
        }
      } else {
        const err = await res.json();
        showNotification(`ERROR // Failed to update Meet URL: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`ERROR // Failed to save Meet URL: ${err.message || err}`);
    } finally {
      setIsUpdatingMeetUrl(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim() || !documentUrl.trim()) {
      showNotification("ERROR // Document name and URL are both required");
      return;
    }
    
    setIsAddingDocument(true);
    try {
      const token = sessionToken || sessionStorage.getItem("codexia_session_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`/api/cohorts/${activeCohortId}/documents`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: documentName,
          file_url: documentUrl
        })
      });
      
      if (res.ok) {
        showNotification("SUCCESS // Document uploaded and synced to cohort archive!");
        onNewLog(`DOCUMENT UPLOADED // Name: ${documentName}`, "HIGH");
        setDocumentName("");
        setDocumentUrl("");
        // Refetch cohort data to show the document immediately
        const refetchRes = await fetch("/api/cohorts", { headers });
        if (refetchRes.ok) {
          const data = await refetchRes.json();
          if (Array.isArray(data)) {
            const found = data.find((c: any) => c.id === activeCohortId);
            setCohortData(found || data[0]);
          } else {
            setCohortData(data);
          }
        }
      } else {
        const err = await res.json();
        showNotification(`ERROR // Failed to upload document: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`ERROR // Failed to upload document: ${err.message || err}`);
    } finally {
      setIsAddingDocument(false);
    }
  };

  const handleToggleSyllabusDay = async (dayId: string, currentStatus: string) => {
    if (!isAdmin) return;
    
    // Cycle status: upcoming -> active -> completed -> upcoming
    let nextStatus: "upcoming" | "active" | "completed" = "active";
    if (currentStatus === "active") nextStatus = "completed";
    else if (currentStatus === "completed") nextStatus = "upcoming";

    try {
      const token = sessionToken || sessionStorage.getItem("codexia_session_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/cohorts/${activeCohortId}/syllabus_status`, {
        method: "POST",
        headers,
        body: JSON.stringify({ day_id: dayId, status: nextStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setCohortData(data.cohort);
        showNotification(`SUCCESS // Decrypting update: DAY [${dayId.toUpperCase()}] status: [${nextStatus.toUpperCase()}]`);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Failed to update syllabus day: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`ERROR // Connection error: ${err.message || err}`);
    }
  };

  useEffect(() => {
    const fetchCohortData = async () => {
      try {
        const token = sessionToken || sessionStorage.getItem("codexia_session_token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        const res = await fetch("/api/cohorts", { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const found = data.find((c: any) => c.id === activeCohortId);
            setCohortData(found || data[0]);
          } else {
            setCohortData(data);
          }
        }
      } catch (err) {
        console.warn("Error fetching cohort data (will retry):", err);
      }
    };
    fetchCohortData();
    const interval = setInterval(fetchCohortData, 5000);
    return () => clearInterval(interval);
  }, [sessionToken, activeCohortId]);

  // Pre-populate manualMeetUrl state on cohortData change
  useEffect(() => {
    if (cohortData?.live_meet_url) {
      setManualMeetUrl(cohortData.live_meet_url);
    } else {
      setManualMeetUrl("");
    }
  }, [cohortData]);

  // Active page state: "dashboard" | "documents" | "community"
  const [activePage, setActivePage] = useState<"dashboard" | "documents" | "community">("dashboard");

  // Dynamic countdown state
  const [timeLeft, setTimeLeft] = useState<{ hours: string, minutes: string, seconds: string } | null>(null);

  const parseTimingToTime = (timing?: string) => {
    if (!timing) return { hour: 10, minute: 0 };
    const startPart = timing.split("-")[0].trim(); // e.g., "10:00 AM"
    const match = startPart.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && hour < 12) {
        hour += 12;
      } else if (ampm === "AM" && hour === 12) {
        hour = 0;
      }
      return { hour, minute };
    }
    return { hour: 10, minute: 0 };
  };

  const getScheduledDateForDay = (startDateStr: string, dayIndex: number, timing?: string) => {
    const baseDate = new Date(startDateStr + "T00:00:00");
    baseDate.setDate(baseDate.getDate() + dayIndex);
    const { hour, minute } = parseTimingToTime(timing);
    baseDate.setHours(hour, minute, 0, 0);
    return baseDate;
  };

  const activeSyllabus = activeCohortId === "CODX-2026-07-PREMIUM-01" ? premiumSyllabus : initialSyllabus;
  const syllabusStatus = cohortData?.syllabus_status || {};

  // Find active day: "active" day or first "upcoming" day
  const activeDay = activeSyllabus.find(day => syllabusStatus[day.id] === "active")
                 || activeSyllabus.find(day => syllabusStatus[day.id] === "upcoming")
                 || null;

  // Compute completedDays from syllabusStatus dynamically
  const completedDays = activeSyllabus.reduce((acc, day) => {
    acc[day.id] = syllabusStatus[day.id] === "completed";
    return acc;
  }, {} as Record<string, boolean>);

  useEffect(() => {
    if (!cohortData || !cohortData.start_date || !activeDay) {
      setTimeLeft(null);
      return;
    }

    const dayIndex = activeSyllabus.findIndex(d => d.id === activeDay.id);
    const targetDate = getScheduledDateForDay(cohortData.start_date, dayIndex >= 0 ? dayIndex : 0, activeDay.timing);

    const updateCountdown = () => {
      const targetTime = targetDate.getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: hours < 10 ? `0${hours}` : `${hours}`,
        minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
        seconds: seconds < 10 ? `0${seconds}` : `${seconds}`
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [cohortData, activeDay]);

  // Google Meet Simulation States
  const [isMeetOpen, setIsMeetOpen] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [meetMessages, setMeetMessages] = useState([
    { sender: "System", text: "Mallikharjuna Rao joined the meeting.", time: "12:00" },
    { sender: "Mallikharjuna Rao", text: "Welcome to today's active briefing on load balancing distributed swarms. Let me know if you can hear me.", time: "12:01" }
  ]);
  const [currentMessageText, setCurrentMessageText] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("Establishing live connection node with Mallikharjuna Rao...");
  const [transcriptIndex, setTranscriptIndex] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Real Google Meet API States
  const [isGoogleOAuthActive, setIsGoogleOAuthActive] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string>("");
  const [isGeneratingMeet, setIsGeneratingMeet] = useState<boolean>(false);

  // Handle Firebase Google Auth changes reactive binding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setGoogleUserEmail(user.email || "");
        setIsGoogleOAuthActive(true);
      } else {
        setIsGoogleOAuthActive(false);
        setGoogleUserEmail("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGenerateMeet = async () => {
    setIsGeneratingMeet(true);
    try {
      const result = await googleSignIn();
      if (result?.accessToken) {
        showNotification("PROVISIONING // Authenticating with Google Meet API...");
        const space = await createMeetSpace(result.accessToken);
        if (space.meetingUri) {
          // Persist to server per-cohort
          const token = sessionToken || sessionStorage.getItem("codexia_session_token");
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;
          
          const res = await fetch(`/api/cohorts/${activeCohortId}/next_session`, {
            method: "POST",
            headers,
            body: JSON.stringify({ live_meet_url: space.meetingUri })
          });
          
          if (res.ok) {
            showNotification("SUCCESS // Live Google Meet room established!");
            onNewLog(`DYNAMIC GOOGLE MEET CREATED // Space URI: ${space.meetingUri}`, "HIGH");
            
            // Immediately refetch cohort data
            const refetchRes = await fetch("/api/cohorts", { headers });
            if (refetchRes.ok) {
              const data = await refetchRes.json();
              if (Array.isArray(data)) {
                const found = data.find((c: any) => c.id === activeCohortId);
                setCohortData(found || data[0]);
              } else {
                setCohortData(data);
              }
            }
          }
          
          setMeetMessages(prev => [
            ...prev,
            { 
              sender: "System", 
              text: `REAL GOOGLE MEET ROOM PROVISIONED! Access Code: ${space.meetingCode}. Link: ${space.meetingUri}`, 
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }
          ]);
        }
      }
    } catch (err: any) {
      if (err.message?.includes("Sign-In Blocked/Closed") || err.message?.includes("popup-closed") || err.message?.includes("popup-blocked")) {
        console.warn(err.message || err);
      } else {
        console.error(err);
      }
      showNotification(`ERROR // Failed to generate Google Meet: ${err.message || err}`);
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  const totalDays = activeSyllabus.length;
  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / totalDays) * 100);

  // Handle Google Meet Simulation Camera stream
  useEffect(() => {
    if (isMeetOpen && cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localStreamRef.current = stream;
          }
        })
        .catch((err) => {
          console.warn("Camera permission not granted or webcam busy. Using secure stream graphics fallback.", err);
        });
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isMeetOpen, cameraActive]);

  // Automated Transcript Player simulation
  const transcripts = [
    "Mallikharjuna Rao: Today, we are deep-diving into SRE and low-latency network gateways.",
    "Mallikharjuna Rao: Remember, we want zero overhead on our proxy routing. Codexia's custom router executes in under 8 milliseconds.",
    "Mallikharjuna Rao: I have uploaded the self-healing scripts. Make sure to review the Frameworks tab to compare consensus mechanisms.",
    "Mallikharjuna Rao: If you have configured Razorpay, the keys should be stored in the gateway parameters. Let's make sure our payments trigger perfectly.",
    "Mallikharjuna Rao: I will open the sandbox simulation in 5 minutes. Feel free to send questions in the chat right now!"
  ];

  useEffect(() => {
    if (!isMeetOpen) return;
    const interval = setInterval(() => {
      setLiveTranscript(transcripts[transcriptIndex % transcripts.length]);
      // Occasionally push a chat message from Mallikharjuna Rao
      if (Math.random() > 0.4) {
        const texts = [
          "Be sure to checkout our telemetry tables in the Services Dashboard.",
          "We have optimized the state persistent layers for low cache footprints.",
          "Are there any questions about clustering or Gossip sync?",
          "Check out the Case Studies tab. There is a quiz there that gates premium graduation!"
        ];
        const selectedText = texts[Math.floor(Math.random() * texts.length)];
        setMeetMessages(prev => [
          ...prev,
          { sender: "Mallikharjuna Rao", text: selectedText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
      setTranscriptIndex(prev => prev + 1);
    }, 9000);

    return () => clearInterval(interval);
  }, [isMeetOpen, transcriptIndex]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessageText.trim()) return;

    const userMsg = {
      sender: "You (Student)",
      text: currentMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMeetMessages(prev => [...prev, userMsg]);
    const studentQuery = currentMessageText;
    setCurrentMessageText("");

    onNewLog(`STUDENT CHAT PROTOCOL // Inquired in live track: "${studentQuery}"`, "LOW");

    // Simulate instant responsive feedback from Instructor
    setTimeout(() => {
      let replyText = "Excellent inquiry. We address this explicitly in the Codexia core consensus engine, which utilizes a zero-overhead model swap.";
      if (studentQuery.toLowerCase().includes("payment") || studentQuery.toLowerCase().includes("razorpay")) {
        replyText = "Great point. Razorpay payments are routed through our secure server.ts API proxy so that your API key is hidden from the client browser. Check our Pricing & Billing portal!";
      } else if (studentQuery.toLowerCase().includes("case") || studentQuery.toLowerCase().includes("quiz")) {
        replyText = "The case study quizzes require standard or premium subscriptions to unlock full verification. Let's make sure you pass all Day 5 modules!";
      } else if (studentQuery.toLowerCase().includes("meet") || studentQuery.toLowerCase().includes("google")) {
        replyText = "This Google Meet portal connects you directly to my live office hours. I am here to review your distributed system files.";
      }

      setMeetMessages(prev => [
        ...prev,
        { sender: "Mallikharjuna Rao", text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1500);
  };

  if (activePage === "documents") {
    return (
      <div className="min-h-screen bg-[#0d0e12] py-6 px-4">
        <CohortDocumentsPage
          cohortId={activeCohortId}
          cohortData={cohortData}
          isAdmin={isAdmin}
          sessionToken={sessionToken}
          onBack={() => setActivePage("dashboard")}
          showNotification={showNotification}
        />
      </div>
    );
  }

  if (activePage === "community") {
    return (
      <div className="min-h-screen bg-[#0d0e12] py-6 px-4">
        <CohortCommunityMeshPage
          cohortId={activeCohortId}
          cohortData={cohortData}
          isAdmin={isAdmin}
          sessionToken={sessionToken}
          currentUserEmail={currentUserEmail}
          onBack={() => setActivePage("dashboard")}
          showNotification={showNotification}
        />
      </div>
    );
  }

  if (activePage === "vault") {
    return (
      <div className="min-h-screen bg-[#0d0e12] py-6 px-4">
        <PromptVaultPage
          isAdmin={isAdmin}
          sessionToken={sessionToken}
          onBack={() => setActivePage("dashboard")}
          showNotification={showNotification}
        />
      </div>
    );
  }

  return (
    <div className="font-mono text-xs text-[#A0A2B0]">
      {/* Admin Viewport Selector */}
      {isAdmin && (
        <div className="mb-6 bg-cyan/5 border border-cyan/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-[8px] font-mono font-bold text-cyan uppercase tracking-widest block mb-0.5">ADMIN SECURE GATEWAY // COHORT SWITCHER</span>
            <h3 className="font-serif text-xs font-medium text-white uppercase">
              ACTIVE COHORT WORKSPACE: <span className="text-cyan font-bold font-mono">{activeCohortId === "CODX-2026-07-BASE-01" ? "JULY 2026 BASE COHORT" : "JULY 2026 PREMIUM ALPHA COHORT"}</span>
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveCohortId("CODX-2026-07-BASE-01");
                showNotification("SWITCHED // Context updated: JULY 2026 BASE COHORT");
              }}
              className={`px-3 py-1.5 rounded uppercase font-bold text-[8px] transition-all cursor-pointer border ${
                activeCohortId === "CODX-2026-07-BASE-01"
                  ? "bg-cyan text-black border-cyan"
                  : "bg-black/40 text-slate-400 border-[#2a2c35] hover:text-white"
              }`}
            >
              BASE COHORT
            </button>
            <button
              onClick={() => {
                setActiveCohortId("CODX-2026-07-PREMIUM-01");
                showNotification("SWITCHED // Context updated: JULY 2026 PREMIUM ALPHA COHORT");
              }}
              className={`px-3 py-1.5 rounded uppercase font-bold text-[8px] transition-all cursor-pointer border ${
                activeCohortId === "CODX-2026-07-PREMIUM-01"
                  ? "bg-cyan text-black border-cyan"
                  : "bg-black/40 text-slate-400 border-[#2a2c35] hover:text-white"
              }`}
            >
              PREMIUM ALPHA
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 border-l-4 border-cyan pl-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-serif text-xl md:text-2xl font-medium text-white flex items-center gap-2 leading-normal">
            <GraduationCap className="w-6 h-6 text-cyan" />
            Student cohort desk
          </h1>
          <p className="text-[9px] uppercase tracking-widest mt-0.5">
            Cohort learning progress &amp; dynamic curriculum checkpoints
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[8px] uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded text-purple-400 font-bold font-mono">
            COHORT: {activeCohortId}
          </span>
          <span className="text-[8px] uppercase tracking-widest bg-cyan/10 border border-cyan/20 px-2.5 py-0.5 rounded text-cyan font-bold animate-pulse">
            COHORT ACTIVE
          </span>
          <span className="text-[8px] uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-white font-bold">
            TIER: {cohortData?.track === "premium" ? "PREMIUM ALPHA" : "BASE COHORT"}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        
        {/* Progress & Checklist block */}
        <div className="col-span-12 lg:col-span-8 bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl space-y-6">
          <div className="border-b border-[#2a2c35]/60 pb-3 flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase text-white tracking-widest flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan" />
              Interactive Syllabus Checklist
            </h3>
            <span className="text-[10px] text-cyan font-bold tabular-nums">
              {progressPercentage}% COMPLETED ({completedCount}/{totalDays})
            </span>
          </div>

          {/* Progress Bar */}
          <div className="p-4 bg-[#0d0e14]/60 border border-[#2a2c35] rounded-lg">
            <div className="w-full bg-black h-2 border border-[#2a2c35]/60 rounded-full overflow-hidden">
              <div 
                className="bg-cyan h-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] mt-1.5 uppercase text-slate-400 font-mono">
              <span>DAY 01</span>
              <span>DAY {String(totalDays).padStart(2, '0')} GRADUATION</span>
            </div>
          </div>

          {/* Syllabus day checklist items */}
          <div className="space-y-3">
            {activeSyllabus.map((day) => {
              const status = syllabusStatus[day.id] || "upcoming";
              const isCompleted = status === "completed";
              const isActive = status === "active";
              const isUpcoming = status === "upcoming";

              let cardStyles = "border-[#2a2c35] bg-black/20 hover:bg-black/40";
              let checkboxStyles = "border-slate-500";
              let badgeStyles = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
              let badgeText = "IN_PROGRESS";

              if (isCompleted) {
                cardStyles = "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10";
                checkboxStyles = "border-emerald-500 bg-emerald-500 text-black";
                badgeStyles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                badgeText = "COMPLETED";
              } else if (isActive) {
                cardStyles = "border-cyan bg-cyan/5 hover:bg-cyan/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
                checkboxStyles = "border-cyan";
                badgeStyles = "bg-cyan/10 text-cyan border-cyan/30 animate-pulse";
                badgeText = "ACTIVE";
              } else if (isUpcoming) {
                cardStyles = "border-slate-800/40 bg-black/5 opacity-40 hover:opacity-60";
                checkboxStyles = "border-slate-800";
                badgeStyles = "bg-slate-800/40 text-slate-500 border-slate-800/30";
                badgeText = "UPCOMING";
              }

              return (
                <div 
                  key={day.id}
                  onClick={() => isAdmin && handleToggleSyllabusDay(day.id, status)}
                  className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                    isAdmin ? "cursor-pointer hover:border-cyan/50 hover:bg-black/40" : ""
                  } ${cardStyles}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 border flex items-center justify-center rounded-sm transition-all ${checkboxStyles}`}>
                      {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[8px] font-bold block ${isUpcoming ? "text-slate-500" : "text-cyan"}`}>
                          DAY {day.dayNumber}
                        </span>
                        {day.durationHours && (
                          <span className="text-[7.5px] text-slate-400 font-mono">({day.durationHours} HOURS)</span>
                        )}
                        {day.timing && (
                          <span className="text-[7.5px] text-slate-500 font-mono">// {day.timing}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase block leading-tight mt-0.5 ${isUpcoming ? "text-slate-500" : "text-white"}`}>
                        {day.title}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded ${badgeStyles}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resources & Classroom session info */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Live webinar class countdown */}
          <section className="bg-black border border-[#2a2c35] p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#2a2c35]/60">
              <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[9.5px]">
                <Clock className="w-4 h-4 text-cyan" />
                NEXT LIVE BRIEFING
              </span>
              <span className={`w-2 h-2 rounded-full ${cohortData?.live_meet_url ? "bg-cyan animate-pulse" : "bg-slate-700"}`} />
            </div>

            {timeLeft ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-[8px] text-slate-400 uppercase">ACTIVE LESSON TOPIC:</div>
                  <div className="text-[10px] font-bold text-white uppercase leading-tight">
                    {activeDay ? activeDay.title : "GRADUATED // COHORT COMPLETE!"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-[#16171D] border border-[#2a2c35] rounded">
                    <div className="font-bold text-white text-sm font-mono">{timeLeft.hours}</div>
                    <div className="text-[7px] text-slate-400 uppercase font-mono">HOURS</div>
                  </div>
                  <div className="p-2 bg-[#16171D] border border-[#2a2c35] rounded">
                    <div className="font-bold text-white text-sm font-mono">{timeLeft.minutes}</div>
                    <div className="text-[7px] text-slate-400 uppercase font-mono">MINUTES</div>
                  </div>
                  <div className="p-2 bg-[#16171D] border border-[#2a2c35] rounded">
                    <div className="font-bold text-white text-sm font-mono">{timeLeft.seconds}</div>
                    <div className="text-[7px] text-slate-400 uppercase font-mono">SECONDS</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[8.5px] text-slate-500 uppercase font-mono text-center py-2">
                NO SCHEDULING INFORMATION DETECTED
              </div>
            )}

            {cohortData?.live_meet_url ? (
              <div className="space-y-2">
                {isAdmin ? (
                  <button
                    onClick={() => setIsMeetOpen(true)}
                    className="w-full py-2 bg-cyan text-black font-bold uppercase text-[9px] hover:opacity-90 rounded cursor-pointer text-center block transition-all flex items-center justify-center gap-1.5"
                    id="join-briefing-admin-sim-btn"
                  >
                    <Video className="w-3.5 h-3.5" />
                    LAUNCH SIMULATED MEETING ROOM
                  </button>
                ) : (
                  <a
                    href={cohortData.live_meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-cyan text-black font-bold uppercase text-[9px] hover:opacity-90 rounded cursor-pointer text-center block transition-all flex items-center justify-center gap-1.5"
                    id="join-briefing-student-real-btn"
                  >
                    <Video className="w-3.5 h-3.5" />
                    JOIN LIVE BRIEFING (NEW WINDOW)
                  </a>
                )}
                
                <div className="p-2 bg-[#16171D]/40 border border-[#2a2c35]/40 rounded text-center">
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase select-all block truncate">
                    MEET URL: {cohortData.live_meet_url}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <button
                  disabled
                  className="w-full py-2 bg-white/5 text-slate-500 border border-dashed border-white/10 rounded font-bold uppercase text-[9px] text-center block transition-all flex items-center justify-center gap-1.5"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  WAITING FOR MENTOR TO START SESSION
                </button>
              </div>
            )}

            {/* Admin-only Meet Management Tools */}
            {isAdmin && (
              <div className="mt-4 p-3 bg-cyan/5 border border-cyan/20 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 border-b border-cyan/10 pb-1.5">
                  <span className="text-[8px] font-bold text-cyan font-mono uppercase tracking-widest block">
                    ADMIN CLASSROOM CONTROLS
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleGenerateMeet}
                    disabled={isGeneratingMeet}
                    className="w-full py-1.5 bg-black hover:bg-slate-900 border border-cyan/30 text-cyan hover:text-cyan hover:border-cyan disabled:opacity-50 font-bold uppercase text-[8px] rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Video className="w-3 h-3 animate-pulse" />
                    {isGeneratingMeet ? "PROVISIONING SPACE..." : "GENERATE MEET VIA OAUTH"}
                  </button>

                  <div className="space-y-1 text-[8.5px] font-mono">
                    <label className="text-slate-400 uppercase block">CUSTOM / RECREATED MEET URL</label>
                    <div className="flex gap-1">
                      <input
                        type="url"
                        value={manualMeetUrl}
                        onChange={(e) => setManualMeetUrl(e.target.value)}
                        placeholder="HTTPS://MEET.GOOGLE.COM/ABC-DEFG-HIJ"
                        className="flex-1 bg-black border border-[#2a2c35] focus:border-cyan rounded px-2 py-1 text-white outline-none text-[8.5px]"
                      />
                      <button
                        onClick={handleSaveManualMeet}
                        disabled={isUpdatingMeetUrl}
                        className="px-2 bg-cyan hover:bg-cyan/90 disabled:opacity-50 text-black font-bold uppercase text-[8px] rounded transition-all cursor-pointer"
                      >
                        {isUpdatingMeetUrl ? "SAVING..." : "SAVE"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Restructured Quick links to course resources */}
          <section className="bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#2a2c35]/60">
              <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[9.5px]">
                <Layers className="w-4 h-4 text-cyan" />
                COHORT SECURED RESOURCES MESH
              </span>
            </div>

            <div className="space-y-2 text-[9px] uppercase font-bold text-white">
              {/* 1. Github Repositories */}
              <a 
                href={cohortData?.repo_url || "https://github.com/codexia-academy"} 
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => showNotification("Navigating to dynamic GitHub repository...")}
                className="p-2.5 bg-black/40 border border-[#2a2c35] hover:border-cyan rounded flex items-center justify-between group transition-all"
                id="github-repo-link"
              >
                <span className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 text-cyan" />
                  GITHUB REPOSITORIES
                </span>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan transition-colors" />
              </a>

              {/* 2. Cohort Documents (opens dedicated full-page) */}
              <button 
                onClick={() => setActivePage("documents")}
                className="w-full text-left p-2.5 bg-black/40 border border-[#2a2c35] hover:border-cyan rounded flex items-center justify-between group transition-all cursor-pointer"
                id="open-documents-btn"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-cyan" />
                  COHORT DOCUMENTS
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="bg-cyan/10 text-cyan border border-cyan/20 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold">
                    DEDICATED VIEW
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan transition-colors" />
                </div>
              </button>

              {/* 3. Cohort Community Mesh (opens dedicated full-page) */}
              <button 
                onClick={() => setActivePage("community")}
                className="w-full text-left p-2.5 bg-black/40 border border-[#2a2c35] hover:border-cyan rounded flex items-center justify-between group transition-all cursor-pointer"
                id="open-community-btn"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan" />
                  COHORT COMMUNITY MESH
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="bg-cyan/10 text-cyan border border-cyan/20 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold">
                    SECURED NODE
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan transition-colors" />
                </div>
              </button>

              {/* 4. Template & Prompt Vault (Premium only) */}
              {cohortData?.track === "premium" && (
                <button 
                  onClick={() => setActivePage("vault")}
                  className="w-full text-left p-2.5 bg-[#1e2e2e]/20 border border-[#2a2c35] hover:border-cyan rounded flex items-center justify-between group transition-all cursor-pointer"
                  id="open-vault-btn"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan animate-pulse" />
                    TEMPLATE & PROMPT VAULT
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-cyan/10 text-cyan border border-cyan/20 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold animate-pulse">
                      👑 PREMIUM
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan transition-colors" />
                  </div>
                </button>
              )}
            </div>
          </section>

        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8">
        <StudentTestimonials />
      </div>

      {/* Google Meet Immersive Simulator Modal */}
      <AnimatePresence>
        {isMeetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0d0e12]/95 z-50 flex flex-col justify-between p-4 md:p-6 font-mono text-xs select-none"
          >
            {/* Meet Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white font-bold px-2.5 py-0.5 rounded text-[9px] uppercase animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  LIVE MEET
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs md:text-sm uppercase tracking-tight">
                    CODEXIA-SRE-CLASSROOM // active_sync
                  </h3>
                  <p className="text-[8px] text-[#A0A2B0] uppercase mt-0.5">
                    Lead SRE: Mallikharjuna Rao (Codexia Core Developer)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] uppercase">
                  <Users className="w-3.5 h-3.5 text-cyan" />
                  <span>Participants: 2</span>
                </div>
                <button
                  onClick={() => {
                    setIsMeetOpen(false);
                    showNotification("Exited secure Classroom Meet session.");
                    onNewLog("STUDENT DISCONNECTED FROM GOOGLE MEET SIMULATOR", "LOW");
                  }}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 font-bold uppercase rounded text-[9px] cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  LEAVE MEETING
                </button>
              </div>
            </div>

            {/* Meet Body - Camera Grid & Chat Side Panel */}
            <div className="flex-grow grid grid-cols-12 gap-4 my-4 overflow-hidden h-[calc(100vh-140px)]">
              
              {/* Cameras Column (8 cols desktop) */}
              <div className="col-span-12 lg:col-span-8 grid grid-rows-2 gap-4 overflow-y-auto">
                
                {/* Frame 1: Instructor Mallikharjuna Rao */}
                <div className="bg-[#16171D] border border-[#2a2c35] rounded-xl overflow-hidden relative flex items-center justify-center">
                  {/* Glowing Node network as animated instructor graphic */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-25 overflow-hidden">
                    <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow" style={{ animationDuration: "40s" }}>
                      <circle cx="100" cy="100" r="80" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="5 5" fill="none" />
                      <circle cx="100" cy="100" r="50" stroke="#06b6d4" strokeWidth="0.25" fill="none" />
                      <line x1="100" y1="20" x2="100" y2="180" stroke="#06b6d4" strokeWidth="0.25" />
                      <line x1="20" y1="100" x2="180" y2="100" stroke="#06b6d4" strokeWidth="0.25" />
                    </svg>
                  </div>

                  {/* Avatar Overlay */}
                  <div className="relative text-center z-10 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-cyan/10 border-2 border-cyan flex items-center justify-center shadow-lg shadow-cyan/20">
                      <GraduationCap className="w-8 h-8 text-cyan" />
                    </div>
                    <div>
                      <span className="text-white font-bold text-xs uppercase block">MALLIKHARJUNA RAO</span>
                      <span className="text-[8px] text-cyan uppercase bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20 inline-block mt-1 font-bold">
                        LEAD DEVELOPER
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator overlays */}
                  <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-md text-[8px] font-bold text-white border border-white/5 uppercase">
                    Mallikharjuna Rao (Instructor)
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[7px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      AUDIO TRANSMITTING
                    </span>
                  </div>
                </div>

                {/* Frame 2: Student Camera Feed */}
                <div className="bg-[#16171D] border border-[#2a2c35] rounded-xl overflow-hidden relative flex items-center justify-center">
                  
                  {cameraActive ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1] absolute inset-0"
                    />
                  ) : null}

                  {/* Camera Offline Placeholder */}
                  {(!cameraActive || !localStreamRef.current) && (
                    <div className="relative text-center z-10 flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                        <VideoOff className="w-6 h-6" />
                      </div>
                      <span className="text-slate-400 font-bold text-[10px] uppercase">
                        {cameraActive ? "STREAM BOOTING..." : "CAMERA MUTED"}
                      </span>
                    </div>
                  )}

                  {/* Status Indicators overlay */}
                  <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-md text-[8px] font-bold text-white border border-white/5 uppercase flex items-center gap-1.5">
                    <span>You (Student)</span>
                    {userTier === "premium" && (
                      <span className="text-[7px] text-cyan font-bold">PREMIUM</span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex gap-2">
                    {micActive ? (
                      <span className="text-[7px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        MIC ACTIVE
                      </span>
                    ) : (
                      <span className="text-[7px] text-red-400 font-bold uppercase bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        MIC MUTED
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Chat Column (4 cols desktop) */}
              <div className="col-span-12 lg:col-span-4 bg-black border border-[#2a2c35] rounded-xl overflow-hidden flex flex-col justify-between">
                {/* Chat Panel Header */}
                <div className="p-4 border-b border-[#2a2c35] bg-[#0d0e14] flex justify-between items-center">
                  <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5 text-[9px]">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan" />
                    MEET_CHAT_PORTAL
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase font-bold">SECURE PIPELINE</span>
                </div>

                {/* Messages Ledger */}
                <div className="flex-grow p-4 overflow-y-auto space-y-3">
                  {meetMessages.map((msg, idx) => {
                    const isInstructor = msg.sender === "Mallikharjuna Rao";
                    const isSystem = msg.sender === "System";
                    return (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-lg border uppercase text-[9px] ${
                          isSystem 
                            ? "bg-white/5 border-white/10 text-center text-slate-500 italic"
                            : isInstructor 
                            ? "bg-cyan/5 border-cyan/20 text-cyan text-left" 
                            : "bg-white/5 border-[#2a2c35] text-white text-left"
                        }`}
                      >
                        {!isSystem && (
                          <div className="flex justify-between items-center mb-1 text-[7px] opacity-75">
                            <span className="font-bold">{msg.sender}</span>
                            <span>{msg.time}</span>
                          </div>
                        )}
                        <p className="leading-relaxed select-text font-mono">{msg.text}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Prompts Helper */}
                <div className="px-4 py-2 border-t border-[#2a2c35]/50 bg-black/40 flex flex-wrap gap-1">
                  <button
                    onClick={() => setCurrentMessageText("How do we optimize Razorpay key proxying?")}
                    className="text-[7px] font-bold uppercase border border-cyan/20 hover:border-cyan text-[#A0A2B0] hover:text-cyan bg-cyan/5 px-2 py-1 rounded cursor-pointer truncate max-w-full"
                  >
                    Optimizing Razorpay Key?
                  </button>
                  <button
                    onClick={() => setCurrentMessageText("Tell me about the SRE final quiz graduation.")}
                    className="text-[7px] font-bold uppercase border border-cyan/20 hover:border-cyan text-[#A0A2B0] hover:text-cyan bg-cyan/5 px-2 py-1 rounded cursor-pointer truncate max-w-full"
                  >
                    SRE Quiz &amp; Graduation?
                  </button>
                </div>

                {/* Send input form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2a2c35] bg-[#0d0e14] flex gap-2">
                  <input
                    type="text"
                    value={currentMessageText}
                    onChange={(e) => setCurrentMessageText(e.target.value)}
                    placeholder="TYPE SYSTEM STATEMENT..."
                    className="flex-grow bg-black border border-[#2a2c35] focus:border-cyan px-3 py-2 rounded text-[9px] uppercase font-mono text-cyan placeholder-slate-700 outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-cyan text-black hover:opacity-90 rounded transition-all flex items-center justify-center cursor-pointer font-bold shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

            {/* Meet Footer Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-t border-white/10 bg-[#0d0e12]">
              
              {/* Transcript overlay */}
              <div className="flex items-start gap-2 max-w-xl p-3 bg-cyan/5 border border-cyan/20 rounded-lg text-[9px] text-cyan leading-normal font-mono w-full uppercase">
                <Sparkles className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-grow">
                  <span className="font-bold block text-white mb-0.5">LIVE TRANSCRIPT MONITOR:</span>
                  <span>{liveTranscript}</span>
                </div>
              </div>

              {/* Hardware buttons row */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMicActive(!micActive)}
                  className={`p-3 rounded-full border transition-all cursor-pointer ${
                    micActive 
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                      : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                  }`}
                  title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`p-3 rounded-full border transition-all cursor-pointer ${
                    cameraActive 
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                      : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                  }`}
                  title={cameraActive ? "Mute Camera" : "Unmute Camera"}
                >
                  {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsScreenSharing(!isScreenSharing);
                    showNotification(isScreenSharing ? "Stopped presenting screen." : "Presenting screen proxy active.");
                  }}
                  className={`p-3 rounded-full border transition-all cursor-pointer ${
                    isScreenSharing 
                      ? "bg-cyan/10 border-cyan/40 text-cyan hover:bg-cyan/20" 
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                  title="Present screen proxy"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <a
                  href={realMeetUrl || "https://meet.google.com/abc-defg-hij"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 bg-white hover:bg-cyan text-black hover:text-black font-bold uppercase tracking-wider text-[9px] rounded-lg cursor-pointer transition-all flex items-center gap-1.5 border border-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {realMeetUrl ? "LAUNCH LIVE GOOGLE MEET" : "LAUNCH GOOGLE MEET LOBBY"}
                </a>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
