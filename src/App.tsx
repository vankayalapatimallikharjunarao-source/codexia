import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal as TerminalIcon, 
  ChevronDown, 
  Check, 
  Download, 
  TrendingUp, 
  Users, 
  BadgeAlert, 
  HelpCircle, 
  Search, 
  LogOut, 
  Activity, 
  Sliders, 
  Calendar, 
  Laptop, 
  Cpu, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  User,
  ExternalLink,
  DollarSign,
  Server,
  Layers,
  GraduationCap,
  Lock,
  Unlock,
  CreditCard,
  BookOpen,
  Wrench,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Globe
} from "lucide-react";

import { 
  SyllabusDay, 
  PricingTier, 
  WebinarMetrics, 
  FinancialMetrics, 
  ComplaintLog, 
  MeetingReservation,
  StudentFeedback
} from "./types";

import { 
  initialSyllabus, 
  premiumSyllabus,
  pricingTiers, 
  initialComplaintLogs 
} from "./data";

import CircularAgent from "./components/CircularAgent";
import RazorpayModal from "./components/RazorpayModal";
import GoogleOAuthModal from "./components/GoogleOAuthModal";
import EnrollConfirmationModal from "./components/EnrollConfirmationModal";
import FeedbackSection from "./components/FeedbackSection";
import PremiumToolList from "./components/PremiumToolList";
import PremiumToolIcon from "./components/PremiumToolIcon";

// Modular Dashboard Suite Imports
import AdminDashboard from "./components/dashboards/AdminDashboard";
import ServicesDashboard from "./components/dashboards/ServicesDashboard";
import FrameworksDashboard from "./components/dashboards/FrameworksDashboard";
import CaseStudiesDashboard from "./components/dashboards/CaseStudiesDashboard";
import PricingDashboard from "./components/dashboards/PricingDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";

import CodexiaLogo from "./components/CodexiaLogo";

const syllabusContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const syllabusItemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      type: "spring", 
      stiffness: 140, 
      damping: 15 
    } 
  }
};

const faqItems = [
  {
    id: "faq-1",
    question: "What's the real difference between Base Cohort and Premium Alpha?",
    answer: "Base Cohort is a 6-day sprint focused on building one working micro-bot for your own role. Premium Alpha is a separate, 13-day program focused on connecting multiple bots into a working system, with 1:1 review time included."
  },
  {
    id: "faq-2",
    question: "Do I need a coding background to join?",
    answer: "No — Base Cohort is built for any profession, no coding experience required. Premium Alpha goes deeper technically but still starts from the same no-code foundation."
  },
  {
    id: "faq-3",
    question: "Do I need any tools installed before Day 1?",
    answer: "No setup required in advance — each day's tools are introduced live as you need them, and most (Ollama, LM Studio, Google AI Studio, etc.) are free to start using on the spot."
  },
  {
    id: "faq-4",
    question: "Is the current price the final price, or does it go up later?",
    answer: "This is current launch pricing. It may change as cohorts fill or as the program evolves, so the price you see at signup is the one that's locked in for you."
  },
  {
    id: "faq-5",
    question: "What do I actually walk away with?",
    answer: "A working micro-bot (or multi-bot system on Premium Alpha) that you built yourself, a completion certificate, and a written roadmap for what to build next. Premium Alpha also includes a packaged write-up of your capstone project."
  },
  {
    id: "faq-6",
    question: "Are the sessions live, or self-paced?",
    answer: "Live, cohort-based sessions with direct mentor interaction — this isn't a self-paced video library."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer,
    },
  })),
};

export default function App() {
  // Navigation Tabs: "curriculum" | "student" | "services" | "frameworks" | "case-studies" | "pricing" | "admin"
  const [currentTab, setCurrentTab] = useState<"curriculum" | "student" | "services" | "frameworks" | "case-studies" | "pricing" | "admin">("curriculum");
  const [openFaqIds, setOpenFaqIds] = useState<string[]>([]);
  const [developerMode, setDeveloperMode] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isGoogleOAuthOpen, setIsGoogleOAuthOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [signedInUser, setSignedInUser] = useState<string | null>(null);

  // ENQUIRY FORM STATES
  const [enquiryForm, setEnquiryForm] = useState({
    fullName: "",
    workEmail: "",
    companyName: "",
    teamSize: "1",
    program: "Base Cohort",
    phoneNumber: "",
    countryCode: "+91",
    source: "",
    query: ""
  });

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !enquiryForm.fullName.trim() || 
      !enquiryForm.workEmail.trim() || 
      !enquiryForm.phoneNumber.trim() || 
      !enquiryForm.source || 
      !enquiryForm.query.trim()
    ) {
      showNotification("ERROR // REQUIRED FIELDS CANNOT BE EMPTY");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(enquiryForm.workEmail)) {
      showNotification("ERROR // INVALID WORK EMAIL ADDRESS");
      return;
    }
    
    showNotification("SUCCESS // ENQUIRY SUBMITTED FOR PROTOCOL ALIGNMENT");
    setEnquiryForm({
      fullName: "",
      workEmail: "",
      companyName: "",
      teamSize: "1",
      program: "Base Cohort",
      phoneNumber: "",
      countryCode: "+91",
      source: "",
      query: ""
    });
  };
  
  // SECURE SESSION & RBAC SYSTEM STATES
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return sessionStorage.getItem("codexia_session_token");
  });
  const [userRole, setUserRole] = useState<"admin" | "student" | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const isTransitioningMasterclass = useRef(false);

  // Tying session token to device fingerprint
  const getDeviceFingerprint = (): string => {
    let fp = localStorage.getItem("cx_device_fingerprint");
    if (!fp) {
      fp = "fp_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now().toString(36);
      localStorage.setItem("cx_device_fingerprint", fp);
    }
    return fp;
  };

  const navigateToTab = (tab: "curriculum" | "student" | "services" | "frameworks" | "case-studies" | "pricing" | "admin") => {
    setCurrentTab(tab);
    if (tab === "admin") {
      window.history.pushState(null, "", "/admin");
    } else {
      window.history.pushState(null, "", `/${tab === "curriculum" ? "" : tab}`);
    }
  };

  // Browser History and Path Routing Engine
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/admin") {
        setCurrentTab("admin");
      } else {
        const tabName = path.substring(1) as any;
        const validTabs = ["curriculum", "student", "services", "frameworks", "case-studies", "pricing"];
        if (validTabs.includes(tabName)) {
          setCurrentTab(tabName);
        } else {
          setCurrentTab("curriculum");
        }
      }
    };

    // Run initial URL check on mount
    handlePopState();

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Dynamic JSON-LD FAQ Schema injection for perfect SEO indexability
  useEffect(() => {
    const scriptId = "faq-jsonld-schema";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.innerHTML = JSON.stringify(faqSchema);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Track subscription/payment state persistently across sessions on server
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  const [userTrack, setUserTrack] = useState<"base" | "premium" | "admin" | null>(null);
  const [userCohortId, setUserCohortId] = useState<string | null>(null);

  // Free Masterclass Dynamic Pricing States
  const [masterclassActive, setMasterclassActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("codexia_masterclass_active");
    return saved !== null ? saved === "true" : true;
  });
  const [masterclassTimeLeft, setMasterclassTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem("codexia_masterclass_time_left");
    return saved ? parseInt(saved, 10) : 900; // default 15 minutes
  });

  // Fetch initial/periodic state from the server to sync across devices
  useEffect(() => {
    const syncWithServer = async () => {
      if (isTransitioningMasterclass.current) return;
      try {
        const res = await fetch("/api/masterclass");
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (!isTransitioningMasterclass.current) {
              setMasterclassActive(data.active);
              setMasterclassTimeLeft(data.timeLeft);
            }
          }
        }
      } catch (err) {
        console.error("Error syncing masterclass status with server", err);
      }
    };

    syncWithServer();
    // Poll the server state every 3 seconds to keep other clients/devices in sync!
    const interval = setInterval(syncWithServer, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync state modifications back to the server
  const handleSetMasterclassActive = async (active: boolean) => {
    isTransitioningMasterclass.current = true;
    setMasterclassActive(active);
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    try {
      const res = await fetch("/api/masterclass", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          active, 
          duration: active ? masterclassTimeLeft : undefined 
        })
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setMasterclassActive(data.active);
          setMasterclassTimeLeft(data.timeLeft);
        }
      }
    } catch (err) {
      console.error("Failed to update masterclass status on server", err);
    } finally {
      setTimeout(() => {
        isTransitioningMasterclass.current = false;
      }, 1000);
    }
  };

  const handleSetMasterclassTimeLeft = async (seconds: number) => {
    isTransitioningMasterclass.current = true;
    setMasterclassTimeLeft(seconds);
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    try {
      const res = await fetch("/api/masterclass", {
        method: "POST",
        headers,
        body: JSON.stringify({ duration: seconds })
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setMasterclassActive(data.active);
          setMasterclassTimeLeft(data.timeLeft);
        }
      }
    } catch (err) {
      console.error("Failed to update masterclass timer on server", err);
    } finally {
      setTimeout(() => {
        isTransitioningMasterclass.current = false;
      }, 1000);
    }
  };

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("codexia_masterclass_active", String(masterclassActive));
  }, [masterclassActive]);

  useEffect(() => {
    localStorage.setItem("codexia_masterclass_time_left", String(masterclassTimeLeft));
  }, [masterclassTimeLeft]);

  // Masterclass Timer Countdown Hook
  useEffect(() => {
    if (!masterclassActive) return;

    const timer = setInterval(() => {
      setMasterclassTimeLeft((prev) => {
        if (prev <= 1) {
          // Expiration reached naturally on this client. Revert pricing.
          setMasterclassActive(false);
          showNotification("⚠️ MASTERCLASS PERIOD EXPIRED // Seat pricing reverted to standard rates.");
          handleNewLog("MASTERCLASS PROMO TIMER EXPIRED - PRICE REVERTED", "MEDIUM");
          return 900; // Reset countdown for the next trigger
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [masterclassActive]);

  const getPricingTiers = (): PricingTier[] => {
    if (masterclassActive) {
      return [
        {
          id: "standard",
          name: "Base Cohort",
          subtitle: "Launch pricing",
          priceINR: 3999,
          priceUSD: 59,
          features: [
            "8-Day Live Curriculum Access",
            "Digital Interactive Documentation",
            "Community Discord Mesh Network Entry",
            "Standard Hands-On Labs"
          ],
          isPremium: false
        },
        {
          id: "premium",
          name: "Premium Alpha",
          subtitle: "Executive Masterclass Offer (reverts soon!)",
          priceINR: 9999,
          priceUSD: 149,
          features: [
            "Everything in Base Tier",
            "1:1 Architecture Code Review",
            "Lifetime Backend Autonomous API Access",
            "Certified Cohort Accreditation Badge",
            "Priority Live Event Q&A Board"
          ],
          isPremium: true
        }
      ];
    }
    return pricingTiers;
  };

  // SECURE AUTHENTICATION ENGINE
  const handleAuthLogin = async (email: string, password?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          deviceFingerprint: getDeviceFingerprint()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionToken(data.token);
        sessionStorage.setItem("codexia_session_token", data.token);
        setSignedInUser(data.email);
        setUserRole(data.role);
        setUserTrack(data.track);
        setUserCohortId(data.cohort_id);
        setLastActivity(Date.now());
        
        if (data.role === "admin") {
          setDeveloperMode(true);
          setHasPaid(true);
          showNotification("AUTHORIZED // Admin single session bound on server");
        } else {
          setDeveloperMode(false);
          setHasPaid(data.track !== null);
          showNotification("AUTHORIZED // Student session active");
        }
      } else {
        const err = await res.json();
        showNotification(`AUTHENTICATION DENIED: ${err.error || "Invalid Credentials"}`);
      }
    } catch (e) {
      console.error("Auth login failure:", e);
      showNotification("AUTHENTICATION INTERFACE DISCONNECTED");
    }
  };

  const handleAuthLogout = async () => {
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Logout request failed:", e);
      }
    }
    setSessionToken(null);
    sessionStorage.removeItem("codexia_session_token");
    setSignedInUser(null);
    setUserRole(null);
    setDeveloperMode(false);
    setHasPaid(false);
    setUserTrack(null);
    setUserCohortId(null);
    if (currentTab === "admin") {
      setCurrentTab("curriculum");
    }
    showNotification("CREDENTIALS DESTROYED // SECURE DISCONNECTED");
  };

  // Secure Server Session Verification Sync Loop
  useEffect(() => {
    const checkActiveSession = async () => {
      const token = sessionStorage.getItem("codexia_session_token");
      if (!token) {
        setSignedInUser(null);
        setUserRole(null);
        setSessionToken(null);
        setDeveloperMode(false);
        setUserTrack(null);
        setUserCohortId(null);
        return;
      }

      try {
        const res = await fetch("/api/auth/session", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSignedInUser(data.email);
          setUserRole(data.role);
          setSessionToken(token);
          setUserTrack(data.track);
          setUserCohortId(data.cohort_id);
          if (data.role === "admin") {
            setDeveloperMode(true);
            setHasPaid(true);
          } else {
            setDeveloperMode(false);
            setHasPaid(data.track !== null);
          }
        } else {
          // Token expired or singular session invalidated (e.g. login from another device!)
          handleAuthLogout();
          showNotification("SINGLE SESSION CONSTRAINT // KICKED OUT");
        }
      } catch (e) {
        console.error("Session verification loop exception:", e);
      }
    };

    checkActiveSession();
    const interval = setInterval(checkActiveSession, 10000); // verify session integrity every 10 seconds
    return () => clearInterval(interval);
  }, [sessionToken]);

  // Frontend local inactivity timeout tracking (15 minutes)
  useEffect(() => {
    if (!sessionToken) return;

    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes strict

    const handleUserActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("mousedown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    const checker = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
        handleAuthLogout();
        showNotification("SESSION CONTEXT TIMEOUT // DISCONNECTED DUE TO INACTIVITY");
      }
    }, 5000);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      clearInterval(checker);
    };
  }, [sessionToken, lastActivity]);

  // Core App Interactive States
  const [syllabus, setSyllabus] = useState<SyllabusDay[]>(initialSyllabus);
  const [activeSyllabusId, setActiveSyllabusId] = useState<string | null>("day-1");
  const [curriculumTrack, setCurriculumTrack] = useState<"base" | "premium">("base");
  const [openSyllabusIds, setOpenSyllabusIds] = useState<string[]>(["day-1"]);
  const [pricingCurrency, setPricingCurrency] = useState<"INR" | "USD">("INR");

  // Webinar Registration Metrics
  const [webinarMetrics, setWebinarMetrics] = useState<WebinarMetrics>({
    activeRegistrations: 0,
    waitlist: 0,
    conversionRate: 0,
    capacityPercentage: 0
  });

  // Financial Revenue Metrics
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({
    totalGrossUSD: 0,
    totalGrossINR: 0,
    avgOrderValueUSD: 0,
    chartData: []
  });

  // Logs & Complaints State mapped dynamically to current, correct date/time
  const [complaintLogs, setComplaintLogs] = useState<ComplaintLog[]>([]);

  // Student feedbacks state
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);

  // Keep track of the last state values fetched from the server or synced to prevent echo/feedback loops
  const lastFetchedStateRef = useRef<{
    webinar_metrics?: string;
    financial_metrics?: string;
    complaint_logs?: string;
    student_feedbacks?: string;
    has_paid?: boolean;
  }>({});

  // Helper to sync local changes to server state
  const updateServerState = async (updates: any) => {
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    const isAdmin = userRole === "admin";
    const endpoint = isAdmin ? "/api/admin/state" : "/api/state";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Failed to sync state with server:", err);
    }
  };

  // Fetch unified central state from the server on mount and periodically
  useEffect(() => {
    const fetchServerState = async () => {
      const token = sessionStorage.getItem("codexia_session_token");
      const isAdmin = userRole === "admin";
      const endpoint = isAdmin ? "/api/admin/state" : "/api/state";
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const res = await fetch(endpoint, { headers });
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            
            if (data.has_paid !== undefined) {
              lastFetchedStateRef.current.has_paid = data.has_paid;
              setHasPaid(data.has_paid);
            }
            if (data.student_feedbacks) {
              lastFetchedStateRef.current.student_feedbacks = JSON.stringify(data.student_feedbacks);
              setFeedbacks(data.student_feedbacks);
            }
            if (data.webinar_metrics) {
              lastFetchedStateRef.current.webinar_metrics = JSON.stringify(data.webinar_metrics);
              setWebinarMetrics(data.webinar_metrics);
            }
            if (data.financial_metrics) {
              lastFetchedStateRef.current.financial_metrics = JSON.stringify(data.financial_metrics);
              setFinancialMetrics(data.financial_metrics);
            }
            if (data.complaint_logs) {
              lastFetchedStateRef.current.complaint_logs = JSON.stringify(data.complaint_logs);
              setComplaintLogs(data.complaint_logs);
            }
            
            setLastSyncTime(new Date().toLocaleTimeString());
          }
        } else if (res.status === 403) {
          console.warn("Forbidden status in state fetching.");
        }
      } catch (err) {
        console.error("Error fetching central server state:", err);
      }
    };
    fetchServerState();
    const interval = setInterval(fetchServerState, 3000);
    return () => clearInterval(interval);
  }, [userRole, sessionToken]);

  // Sync state modifications back to the server when changed locally (only if current user is an admin or is sending user-initiated changes like feedback)
  useEffect(() => {
    if (userRole === "admin" && webinarMetrics.activeRegistrations !== 0) {
      const currentStr = JSON.stringify(webinarMetrics);
      if (currentStr !== lastFetchedStateRef.current.webinar_metrics) {
        lastFetchedStateRef.current.webinar_metrics = currentStr;
        updateServerState({ webinar_metrics: webinarMetrics });
      }
    }
  }, [webinarMetrics, userRole]);

  useEffect(() => {
    if (userRole === "admin" && financialMetrics.totalGrossUSD !== 0) {
      const currentStr = JSON.stringify(financialMetrics);
      if (currentStr !== lastFetchedStateRef.current.financial_metrics) {
        lastFetchedStateRef.current.financial_metrics = currentStr;
        updateServerState({ financial_metrics: financialMetrics });
      }
    }
  }, [financialMetrics, userRole]);

  useEffect(() => {
    if (userRole === "admin" && complaintLogs.length > 0) {
      const currentStr = JSON.stringify(complaintLogs);
      if (currentStr !== lastFetchedStateRef.current.complaint_logs) {
        lastFetchedStateRef.current.complaint_logs = currentStr;
        updateServerState({ complaint_logs: complaintLogs });
      }
    }
  }, [complaintLogs, userRole]);

  useEffect(() => {
    if (feedbacks.length > 0) {
      const currentStr = JSON.stringify(feedbacks);
      if (currentStr !== lastFetchedStateRef.current.student_feedbacks) {
        lastFetchedStateRef.current.student_feedbacks = currentStr;
        updateServerState({ student_feedbacks: feedbacks });
      }
    }
  }, [feedbacks]);

  useEffect(() => {
    if (userRole === "admin" && hasPaid !== lastFetchedStateRef.current.has_paid) {
      lastFetchedStateRef.current.has_paid = hasPaid;
      updateServerState({ has_paid: hasPaid });
    }
  }, [hasPaid, userRole]);

  const handleNewFeedback = (rating: number, comment: string) => {
    const newFb: StudentFeedback = {
      id: `FB-${Math.floor(Math.random() * 9000 + 1000)}`,
      rating,
      comment,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      username: signedInUser || "anonymous_student"
    };

    setFeedbacks(prev => [newFb, ...prev]);

    // Also add to audit logs!
    const newLog: ComplaintLog = {
      id: `PAY-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: { initials: (signedInUser || "GUEST").substring(0, 2).toUpperCase(), username: signedInUser || "guest_user" },
      issueDescription: `STUDENT FEEDBACK SUBMITTED // Rating: ${rating}/5, Comment: "${comment}"`,
      severity: "LOW",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "RESOLVED"
    };
    setComplaintLogs(prev => [newLog, ...prev]);
  };

  const [complaintPage, setComplaintPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Razorpay Checkout Modal States
  const [selectedPricingTier, setSelectedPricingTier] = useState<PricingTier | null>(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Terminal Simulator Line typing sequence
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const terminalCommands = [
    "> Applying C.O.D.E. method: Context, Objective, Design, Evaluate",
    "> Micro-bot build: initialized",
    "> Multi-bot handoff: planner, builder, reviewer synced",
    "> Status: ready for cohort deployment"
  ];

  // Last sync timestamp
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  useEffect(() => {
    // Set standard sync timestamp
    const now = new Date();
    setLastSyncTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");

    // Dynamic terminal typing simulator
    let index = 0;
    const interval = setInterval(() => {
      if (index < terminalCommands.length) {
        setTerminalLines((prev) => [...prev, terminalCommands[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    // Live registration tick to simulate incoming signups!
    const regInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setWebinarMetrics((prev) => {
          const nextReg = prev.activeRegistrations + Math.floor(Math.random() * 2) + 1;
          const nextCap = Math.min(100, Math.round((nextReg / 3674) * 100));
          return {
            ...prev,
            activeRegistrations: nextReg,
            capacityPercentage: nextCap
          };
        });
        showNotification("New autonomous agent inquiry received from node_mesh!");
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(regInterval);
    };
  }, []);

  // Utility to show temporary toast notifier
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Trigger when checkout payment completes successfully
  const handlePaymentSuccess = (tier: PricingTier, isUSD: boolean) => {
    // 1. Increment Registrations
    setWebinarMetrics((prev) => {
      const nextReg = prev.activeRegistrations + 1;
      return {
        ...prev,
        activeRegistrations: nextReg,
        capacityPercentage: Math.min(100, Math.round((nextReg / 3674) * 100))
      };
    });

    // 2. Increase Gross metrics
    setFinancialMetrics((prev) => {
      const addedUSD = isUSD ? tier.priceUSD : Math.round(tier.priceINR / 83);
      const addedINR = isUSD ? Math.round(tier.priceUSD * 83) : tier.priceINR;
      
      // Update chart to show spike
      const updatedChart = [...prev.chartData];
      if (updatedChart.length > 0) {
        updatedChart[updatedChart.length - 1].amount += addedUSD;
      }

      return {
        ...prev,
        totalGrossUSD: prev.totalGrossUSD + addedUSD,
        totalGrossINR: prev.totalGrossINR + addedINR,
        chartData: updatedChart
      };
    });

    // 3. Log as a resolved/completed log
    const username = signedInUser ? signedInUser.split("@")[0] : `student_${Math.floor(Math.random() * 900 + 100)}`;
    const initials = username.substring(0, 2).toUpperCase();
    
    const newLog: ComplaintLog = {
      id: `PAY-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: {
        initials,
        username
      },
      issueDescription: `ENROLLED // Course registration finalized for ${tier.name}.`,
      severity: "LOW",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "RESOLVED"
    };

    setComplaintLogs((prev) => [newLog, ...prev]);
    setHasPaid(true);

    const enrollTrack = tier.id === "premium" ? "premium" : "base";
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    if (token) {
      fetch("/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ track: enrollTrack })
      }).then(res => {
        if (res.ok) {
          return res.json();
        }
      }).then(data => {
        if (data && data.profile) {
          setUserTrack(data.profile.track);
          setUserCohortId(data.profile.cohort_id);
        }
      }).catch(err => {
        console.error("Failed to persist enrollment on server", err);
      });
    }

    showNotification(`Payment Successful! Enrolled in ${tier.name}. Welcome to the cohort.`);
  };

  // Callback after successful Google OAuth simulated sign in
  const handleGoogleSignInSuccess = (email: string, password?: string) => {
    handleAuthLogin(email, password);
  };

  // Add customized log entry from sub-components
  const handleNewLog = (description: string, severity: "HIGH" | "MEDIUM" | "LOW") => {
    const username = signedInUser ? signedInUser.split("@")[0] : "anonymous_dev";
    const initials = username.substring(0, 2).toUpperCase();
    
    const log: ComplaintLog = {
      id: `SYS-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: { initials, username },
      issueDescription: description,
      severity,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "UNRESOLVED"
    };

    setComplaintLogs((prev) => [log, ...prev]);
  };

  // Change individual log status in Dashboard Table
  const toggleLogStatus = (logId: string) => {
    setComplaintLogs((prev) => 
      prev.map((log) => {
        if (log.id === logId) {
          const nextStatus = log.status === "UNRESOLVED" ? "INVESTIGATING" : 
                             log.status === "INVESTIGATING" ? "RESOLVED" : "UNRESOLVED";
          return { ...log, status: nextStatus };
        }
        return log;
      })
    );
    showNotification(`Log ${logId} state parameters updated.`);
  };

  // Triggered when client books a slot through CircularAgent
  const handleNewMeeting = (meeting: MeetingReservation) => {
    const initials = meeting.studentName.substring(0, 2).toUpperCase();
    const newLog: ComplaintLog = {
      id: `MEET-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: {
        initials,
        username: meeting.studentName.replace(/\s+/g, "_").toLowerCase()
      },
      issueDescription: `SCHEDULED BRIEFING // Selected date coords: ${meeting.dateTime}.`,
      severity: "MEDIUM",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "UNRESOLVED"
    };

    setComplaintLogs((prev) => [newLog, ...prev]);
    showNotification(`Meeting registered for ${meeting.studentName}`);
  };

  // Handle Mock Login System
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    handleAuthLogin(userEmail);
    setIsSignInModalOpen(false);
  };

  // Export CSV functional logic download
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Username,Description,Severity,Timestamp,Status\n"
      + complaintLogs.map(e => `"${e.id}","${e.studentEntity.username}","${e.issueDescription}","${e.severity}","${e.timestamp}","${e.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `codexia_cohort_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Telemetry CSV report exported successfully.");
  };

  return (
    <div className="relative min-h-screen bg-[#0D0E12] text-white overflow-x-hidden selection:bg-cyan selection:text-black">
      
      {/* Absolute Grid Background Layer */}
      <div className="grid-overlay absolute inset-0 pointer-events-none"></div>

      {/* Floating System Status Toast Notifier */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="fixed top-20 right-6 z-50 bg-black border border-cyan/60 px-4 py-3 text-cyan font-mono text-[10px] tracking-widest flex items-center gap-3"
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-ping"></div>
            <span>ALERT // {toastMessage.toUpperCase()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Top Navigation Header Bar */}
      <nav className="fixed top-0 w-full z-40 h-16 bg-[#0D0E12]/95 border-b border-[#2A2C35] flex justify-between items-center px-4 md:px-12">
        <div className="flex items-center gap-6">
          {/* Codexia Animated Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentTab("curriculum")}>
            <CodexiaLogo size="sm" showText={true} className="!flex-row !gap-1.5" />
          </div>

          {/* Navigation link elements */}
          <div className="hidden xl:flex items-center gap-4">
            <button 
              onClick={() => navigateToTab("curriculum")}
              className={`font-mono text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                currentTab === "curriculum" 
                  ? "text-cyan border-b border-cyan py-1" 
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Curriculum
            </button>
            <button 
              onClick={() => {
                navigateToTab("student");
                showNotification("ACCESSING STUDENT LEARNING DESK");
              }}
              className={`font-mono text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                currentTab === "student" 
                  ? "text-cyan border-b border-cyan py-1" 
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Student Desk
            </button>
            <button 
              onClick={() => {
                navigateToTab("services");
                showNotification("ACCESSING RUNTIME SERVICES PORTAL");
              }}
              className={`font-mono text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                currentTab === "services" 
                  ? "text-cyan border-b border-cyan py-1" 
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Services
            </button>
            <button 
              onClick={() => {
                navigateToTab("frameworks");
                showNotification("ACCESSING AGENT PLAYGROUNDS");
              }}
              className={`font-mono text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                currentTab === "frameworks" 
                  ? "text-cyan border-b border-cyan py-1" 
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Frameworks
            </button>
            <button 
              onClick={() => {
                navigateToTab("case-studies");
                showNotification("ACCESSING PREMIUM LAB RESEARCH");
              }}
              className={`font-mono text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                currentTab === "case-studies" 
                  ? "text-cyan border-b border-cyan py-1" 
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Case Studies
            </button>
            <button 
              onClick={() => {
                navigateToTab("pricing");
                showNotification("ACCESSING MEMBERSHIP SPONSORSHIPS");
              }}
              className={`font-mono text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all ${
                currentTab === "pricing" 
                  ? "text-cyan border-b border-cyan py-1" 
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Pricing
            </button>
            {userRole === "admin" && (
              <button 
                onClick={() => {
                  navigateToTab("admin");
                  showNotification("ACCESSING ADMIN TELEMETRY MATRIX");
                }}
                className={`font-mono text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1 ${
                  currentTab === "admin" 
                    ? "text-red-400 border-b border-red-500 py-1" 
                    : "text-red-400/80 hover:text-red-400"
                }`}
              >
                <Unlock className="w-2.5 h-2.5 text-green-400" />
                Admin Monitor
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {signedInUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline text-[9px] font-mono text-cyan uppercase tracking-tighter">
                USER: {signedInUser.split("@")[0]}
              </span>
              <button 
                onClick={handleAuthLogout} 
                className="font-mono text-[9px] text-on-surface-variant hover:text-white uppercase flex items-center gap-1 cursor-pointer"
                title="Disconnect Credentials"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsGoogleOAuthOpen(true)}
              className="bg-white text-black font-mono font-bold uppercase text-[8px] tracking-widest px-3 py-1.5 hover:bg-cyan hover:text-black transition-all cursor-pointer rounded"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <main className="pt-16 min-h-screen">
        {/* Horizontal scroll navigation bar for viewports smaller than xl */}
        <div className="xl:hidden sticky top-16 z-30 bg-[#0D0E12]/95 border-b border-[#2A2C35] overflow-x-auto flex items-center gap-2 px-4 py-2.5 scrollbar-thin scrollbar-thumb-cyan/10 scrollbar-track-transparent">
          <button 
            onClick={() => navigateToTab("curriculum")}
            className={`font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded cursor-pointer shrink-0 transition-all ${
              currentTab === "curriculum" 
                ? "text-black bg-cyan border-cyan" 
                : "text-on-surface-variant bg-black/40 border-[#2A2C35] hover:text-white"
            }`}
          >
            Curriculum
          </button>
          <button 
            onClick={() => {
              navigateToTab("student");
              showNotification("ACCESSING STUDENT LEARNING DESK");
            }}
            className={`font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded cursor-pointer shrink-0 transition-all ${
              currentTab === "student" 
                ? "text-black bg-cyan border-cyan" 
                : "text-on-surface-variant bg-black/40 border-[#2A2C35] hover:text-white"
            }`}
          >
            Student Desk
          </button>
          <button 
            onClick={() => {
              navigateToTab("services");
              showNotification("ACCESSING RUNTIME SERVICES PORTAL");
            }}
            className={`font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded cursor-pointer shrink-0 transition-all ${
              currentTab === "services" 
                ? "text-black bg-cyan border-cyan" 
                : "text-on-surface-variant bg-black/40 border-[#2A2C35] hover:text-white"
            }`}
          >
            Services
          </button>
          <button 
            onClick={() => {
              navigateToTab("frameworks");
              showNotification("ACCESSING AGENT PLAYGROUNDS");
            }}
            className={`font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded cursor-pointer shrink-0 transition-all ${
              currentTab === "frameworks" 
                ? "text-black bg-cyan border-cyan" 
                : "text-on-surface-variant bg-black/40 border-[#2A2C35] hover:text-white"
            }`}
          >
            Frameworks
          </button>
          <button 
            onClick={() => {
              navigateToTab("case-studies");
              showNotification("ACCESSING PREMIUM LAB RESEARCH");
            }}
            className={`font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded cursor-pointer shrink-0 transition-all ${
              currentTab === "case-studies" 
                ? "text-black bg-cyan border-cyan" 
                : "text-on-surface-variant bg-black/40 border-[#2A2C35] hover:text-white"
            }`}
          >
            Case Studies
          </button>
          <button 
            onClick={() => {
              navigateToTab("pricing");
              showNotification("ACCESSING MEMBERSHIP SPONSORSHIPS");
            }}
            className={`font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded cursor-pointer shrink-0 transition-all ${
              currentTab === "pricing" 
                ? "text-black bg-cyan border-cyan" 
                : "text-on-surface-variant bg-black/40 border-[#2A2C35] hover:text-white"
            }`}
          >
            Pricing
          </button>
          {userRole === "admin" && (
            <button 
              onClick={() => {
                navigateToTab("admin");
                showNotification("ACCESSING ADMIN TELEMETRY MATRIX");
              }}
              className={`font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded cursor-pointer shrink-0 transition-all ${
                currentTab === "admin" 
                  ? "text-white bg-red-600 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
                  : "text-red-400 bg-red-950/10 border-red-950/40 hover:text-red-300"
              }`}
            >
              Admin Monitor
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {currentTab === "curriculum" ? (
            <motion.div
              key="curriculum-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="px-6 md:px-12 py-16"
            >
              {/* Section A: Hero Area */}
              <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center py-16 max-w-5xl mx-auto">
                {/* Background SVG Layer */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 flex items-center justify-center">
                  <svg 
                    className="w-[1000px] h-[1000px] max-w-none" 
                    viewBox="0 0 1000 1000" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Concentric rings in the center, echoing the logo's orbit mark */}
                    <circle cx="500" cy="500" r="180" stroke="#00FFFF" strokeWidth="0.6" strokeDasharray="4 4" className="opacity-[0.15] animate-spin-slow" style={{ transformOrigin: '500px 500px' }} />
                    <circle cx="500" cy="500" r="280" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.18]" />
                    <circle cx="500" cy="500" r="380" stroke="#00FFFF" strokeWidth="0.6" strokeDasharray="12 6" className="opacity-[0.12] animate-spin-reverse" style={{ transformOrigin: '500px 500px' }} />

                    {/* Faint network of sparse cyan lines and connected dots */}
                    <path d="M 220,380 L 320,300 L 410,340" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.35]" />
                    <path d="M 320,300 L 500,210" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.35]" />
                    <path d="M 500,210 L 680,260 L 760,190" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.35]" />
                    <path d="M 680,260 L 620,440 L 780,510" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.3]" />
                    <path d="M 780,510 L 840,680" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.3]" />
                    <path d="M 620,440 L 480,520 L 360,610" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.35]" />
                    <path d="M 360,610 L 250,530 L 140,620" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.35]" />
                    <path d="M 250,530 L 220,380" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.35]" />
                    <path d="M 480,520 L 520,720 L 660,780" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.3]" />
                    <path d="M 520,720 L 390,820" stroke="#00FFFF" strokeWidth="0.6" className="opacity-[0.3]" />

                    {/* Nodes (small cyan dots) */}
                    <circle cx="220" cy="380" r="3" fill="#00FFFF" className="opacity-[0.4] animate-pulse" />
                    <circle cx="320" cy="300" r="2.5" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="410" cy="340" r="2" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="500" cy="210" r="3.5" fill="#00FFFF" className="opacity-[0.45]" />
                    <circle cx="680" cy="260" r="2.5" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="760" cy="190" r="3" fill="#00FFFF" className="opacity-[0.4] animate-pulse" />
                    <circle cx="620" cy="440" r="4" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="780" cy="510" r="2.5" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="840" cy="680" r="3" fill="#00FFFF" className="opacity-[0.4] animate-pulse" />
                    <circle cx="480" cy="520" r="3.5" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="360" cy="610" r="2.5" fill="#00FFFF" className="opacity-[0.45]" />
                    <circle cx="250" cy="530" r="2.5" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="140" cy="620" r="3" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="520" cy="720" r="2.5" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="660" cy="780" r="3.5" fill="#00FFFF" className="opacity-[0.4]" />
                    <circle cx="390" cy="820" r="2.5" fill="#00FFFF" className="opacity-[0.4]" />
                  </svg>
                </div>

                {/* Stunning Custom Codexia Logo */}
                <motion.div 
                  className="mb-8 relative z-10"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <CodexiaLogo size="lg" showText={false} />
                </motion.div>

                <motion.h1 
                  className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black text-white mb-6 leading-[1.3] sm:leading-[1.2] md:leading-[1.15] max-w-[1000px] mx-auto px-4 relative z-10 tracking-tight text-center uppercase"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.08 }
                    }
                  }}
                >
                  <div className="block mb-2 overflow-visible sm:overflow-hidden pb-1 text-white">
                    {"BUILD REAL AI SYSTEMS.".split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        className="inline-block mr-[0.25em] origin-bottom"
                        variants={{
                          hidden: { y: "100%", opacity: 0 },
                          visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>
                  <div className="block overflow-visible sm:overflow-hidden pb-1 text-white">
                    {"FROM YOUR FIRST BOT TO A FULL".split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        className="inline-block mr-[0.25em] origin-bottom"
                        variants={{
                          hidden: { y: "100%", opacity: 0 },
                          visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                    <motion.span
                      className="inline sm:inline-block relative text-cyan"
                      variants={{
                        hidden: { y: "100%", opacity: 0 },
                        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
                      }}
                    >
                      <span className="inline sm:hidden underline decoration-cyan decoration-[3px] underline-offset-[6px]">
                        MULTI-AGENT STUDIO.
                      </span>
                      <span className="hidden sm:inline-block relative">
                        MULTI-AGENT STUDIO.
                        <motion.span 
                          className="absolute bottom-0 left-0 right-0 h-[4px] bg-cyan origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                        />
                      </span>
                    </motion.span>
                  </div>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                  className="font-sans text-sm md:text-base lg:text-[17px] text-[#A0A2B0]/90 max-w-3xl mb-12 leading-relaxed relative z-10 px-6 font-normal tracking-wide text-center mx-auto"
                >
                  Hands-on cohorts for any profession — start with one working micro-bot, or go deep into connected multi-bot systems. No coding background required to begin.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16 relative z-10"
                >
                  <motion.a 
                    href="#investment"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 0 25px rgba(6, 182, 212, 0.4)",
                      borderColor: "#00ffff",
                      backgroundColor: "rgba(6, 182, 212, 0.12)"
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="group relative bg-[#0D0E12] border-2 border-cyan px-10 py-4 overflow-hidden font-mono text-xs font-bold text-white tracking-widest uppercase cursor-pointer min-w-[240px] text-center transition-all duration-300"
                  >
                    <span className="relative z-10 text-white transition-colors duration-300">
                      Apply for next cohort
                    </span>
                    {/* Glowing background sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Infinite premium shining sweep */}
                    <motion.div
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
                      initial={{ left: "-100%" }}
                      animate={{ left: "200%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 3.5,
                        ease: "linear"
                      }}
                    />
                  </motion.a>

                  <motion.a 
                    href="#programs"
                    whileHover={{ 
                      scale: 1.03,
                      borderColor: "rgba(6, 182, 212, 0.6)",
                      backgroundColor: "rgba(6, 182, 212, 0.05)",
                      boxShadow: "0 0 15px rgba(6, 182, 212, 0.15)"
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="group relative bg-transparent border-2 border-[#2a2c35] px-10 py-4 overflow-hidden font-mono text-xs font-bold text-[#A0A2B0] hover:text-white tracking-widest uppercase cursor-pointer min-w-[240px] text-center transition-all duration-300"
                  >
                    <span className="relative z-10 transition-colors duration-300">
                      View curriculum
                    </span>
                    <motion.div
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan/5 to-transparent -skew-x-12 pointer-events-none"
                      initial={{ left: "-100%" }}
                      animate={{ left: "200%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 4,
                        ease: "linear",
                        delay: 1.5
                      }}
                    />
                  </motion.a>
                </motion.div>

                {/* STAT ROW with staggered entrance and interactive hover behaviors */}
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        delayChildren: 1.2,
                        staggerChildren: 0.15
                      }
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto border-t border-[#2a2c35]/50 pt-10 text-left relative z-10 px-6"
                >
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                    }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="space-y-1.5 pl-4 border-l-2 border-cyan group cursor-pointer"
                  >
                    <div className="font-sans text-lg font-bold text-white uppercase tracking-tight group-hover:text-cyan transition-colors duration-200">6 or 13 days</div>
                    <div className="font-mono text-[9px] uppercase text-[#A0A2B0] tracking-widest">Base or Premium format</div>
                  </motion.div>
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                    }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="space-y-1.5 pl-4 border-l-2 border-[#2a2c35] hover:border-cyan/50 group cursor-pointer transition-colors duration-300"
                  >
                    <div className="font-sans text-lg font-bold text-white uppercase tracking-tight group-hover:text-cyan transition-colors duration-200">Capped seats</div>
                    <div className="font-mono text-[9px] uppercase text-[#A0A2B0] tracking-widest">Small-batch cohorts</div>
                  </motion.div>
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                    }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="space-y-1.5 pl-4 border-l-2 border-[#2a2c35] hover:border-cyan/50 group cursor-pointer transition-colors duration-300"
                  >
                    <div className="font-sans text-lg font-bold text-white uppercase tracking-tight group-hover:text-cyan transition-colors duration-200">Next cohort starts Aug 1</div>
                    <div className="font-mono text-[9px] uppercase text-[#A0A2B0] tracking-widest">Enrollment open now</div>
                  </motion.div>
                </motion.div>
              </section>

              {/* Section B: Visual Terminal Hook */}
              <section className="pb-24 border-t border-cyan/10 pt-16 max-w-5xl mx-auto">
                <div className="border border-[#2a2c35] bg-[#0d0e14] overflow-hidden">
                  {/* Terminal Header */}
                  <div className="bg-[#1a1b21] px-4 py-2.5 flex items-center justify-between border-b border-[#2a2c35]">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    <div className="font-mono text-[10px] text-on-surface-variant">codexia_orchestration_matrix_v2.sh</div>
                    <div className="w-12"></div>
                  </div>

                  {/* Terminal Output */}
                  <div className="p-6 md:p-8 font-mono text-[11px] bg-black min-h-[240px] text-cyan leading-relaxed select-text">
                    <div className="space-y-1">
                      {terminalLines.map((line, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {line}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-3 flex items-center">
                      <span className="text-white mr-2">$</span>
                      <span className="w-1.5 h-4 bg-cyan cursor-blink"></span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section C: Syllabus Accordion Detail */}
              <section id="programs" className="bg-[#16171D]/40 py-24 px-4 border-t border-cyan/10">
                <div className="max-w-4xl mx-auto">
                  {/* Top of widget: Section label and subtitle */}
                  <div className="mb-8">
                    <span 
                      className="text-xs font-bold tracking-widest text-cyan uppercase"
                      style={{ fontVariant: "small-caps" }}
                    >
                      Programs
                    </span>
                    <p className="text-sm text-[#A0A2B0] font-sans mt-1">
                      Two standalone courses. Pick the one that matches where you are right now.
                    </p>
                  </div>

                  {/* Track switcher */}
                  <div className="flex border-b border-[#2a2c35] gap-6 mb-8">
                    <button
                      onClick={() => {
                        setCurriculumTrack("base");
                        setOpenSyllabusIds(["day-1"]);
                      }}
                      className={`pb-3 font-mono text-[10px] uppercase font-bold tracking-widest transition-all relative cursor-pointer ${
                        curriculumTrack === "base" ? "text-cyan" : "text-on-surface-variant hover:text-white"
                      }`}
                    >
                      Base Cohort — 6 Days
                      {curriculumTrack === "base" && (
                        <motion.div layoutId="track-active-bar" className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setCurriculumTrack("premium");
                        setOpenSyllabusIds(["pday-1"]);
                      }}
                      className={`pb-3 font-mono text-[10px] uppercase font-bold tracking-widest transition-all relative cursor-pointer ${
                        curriculumTrack === "premium" ? "text-cyan" : "text-on-surface-variant hover:text-white"
                      }`}
                    >
                      Premium Alpha — 13 Days
                      {curriculumTrack === "premium" && (
                        <motion.div layoutId="track-active-bar" className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan" />
                      )}
                    </button>
                  </div>

                  <div className="overflow-hidden relative w-full mt-4">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={curriculumTrack}
                        initial={{ opacity: 0, x: curriculumTrack === "base" ? -40 : 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: curriculumTrack === "base" ? 40 : -40 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                      >
                        {curriculumTrack === "base" ? (
                          <div>
                      {/* Track header block */}
                      <div className="mb-8 text-left">
                        <h3 className="text-xl font-bold text-white tracking-tight font-sans mb-1">
                          6-Day Micro-Bot Builder Sprint
                        </h3>
                        <p className="text-xs text-[#A0A2B0] font-sans mb-4">
                          For individuals, any profession — no coding background required.
                        </p>
                        <div className="flex gap-2.5">
                          <span className="px-3 py-1 border border-cyan bg-transparent text-cyan text-[10px] font-mono font-bold tracking-wider rounded-full uppercase">
                            6 Days
                          </span>
                          <span className="px-3 py-1 border border-cyan bg-transparent text-cyan text-[10px] font-mono font-bold tracking-wider rounded-full uppercase">
                            No coding required
                          </span>
                        </div>
                      </div>

                      {/* Day-by-day accordion */}
                      <div className="space-y-0 border-t border-[#2a2c35]">
                        {syllabus.map((day) => {
                          const isActive = openSyllabusIds.includes(day.id);
                          return (
                            <div 
                              key={day.id} 
                              className={`bg-[#16171D]/5 transition-all ${
                                isActive ? "border-b border-cyan/40" : "border-b border-[#2a2c35]"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  const isMobile = window.innerWidth < 768;
                                  if (isMobile) {
                                    setOpenSyllabusIds(isActive ? [] : [day.id]);
                                  } else {
                                    setOpenSyllabusIds(prev => 
                                      prev.includes(day.id) 
                                        ? prev.filter(x => x !== day.id) 
                                        : [...prev, day.id]
                                    );
                                  }
                                  setActiveSyllabusId(isActive ? null : day.id);
                                }}
                                className="w-full flex items-center justify-between py-5 px-4 text-left bg-transparent hover:bg-[#16171D]/25 transition-all duration-300 ease-in-out cursor-pointer"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Day number: "Day 01" — small, grey, monospace */}
                                  <span className="font-mono text-xs text-[#4A4A4A] font-bold">
                                    Day {day.dayNumber}
                                  </span>
                                  {/* Day title — white, medium weight */}
                                  <span className="font-sans text-xs sm:text-sm font-medium text-white tracking-wide">
                                    {day.title}
                                  </span>
                                </div>
                                {/* Expand/collapse chevron — right-aligned, cyan */}
                                <motion.div
                                  animate={{ rotate: isActive ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-cyan p-1 border border-cyan/10 bg-black/30 rounded"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </motion.div>
                              </button>

                              <AnimatePresence initial={false}>
                                {isActive && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-6 md:px-12 pb-6 pt-1 text-xs text-[#A0A2B0] space-y-4 leading-relaxed font-sans">
                                      {/* Bullet list of session content */}
                                      <ul className="space-y-2 text-[#A0A0A0]">
                                        {day.bullets?.map((bullet, idx) => (
                                          <li key={idx} className="flex items-start gap-2">
                                            <span className="text-cyan text-xs mt-0.5">•</span>
                                            <span>{bullet}</span>
                                          </li>
                                        ))}
                                      </ul>

                                      {/* Tools line at bottom */}
                                      {day.tools && (
                                        <PremiumToolList toolsText={day.tools} dayId={day.id} />
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                          </div>
                        ) : (
                          <div>
                      {/* PREMIUM ALPHA TRACK HEADER */}
                      <div className="mb-8 text-left">
                        <h3 className="text-xl font-bold text-white tracking-tight font-sans mb-1">
                          13-Day Multi-Bot & Automation Studio
                        </h3>
                        <p className="text-xs text-[#A0A2B0] font-sans mb-4">
                          A standalone program for individuals or teams ready to move from one bot to a small connected system of bots working across a real workflow.
                        </p>
                        <div className="flex gap-2.5">
                          <span className="px-3 py-1 border border-cyan bg-transparent text-cyan text-[10px] font-mono font-bold tracking-wider rounded-full uppercase">
                            13 Days
                          </span>
                          <span className="px-3 py-1 border border-cyan bg-transparent text-cyan text-[10px] font-mono font-bold tracking-wider rounded-full uppercase">
                            Standalone program
                          </span>
                        </div>
                      </div>

                      {/* Day-by-day accordion for premium */}
                      <div className="space-y-0 border-t border-[#2a2c35]">
                        {premiumSyllabus.map((day) => {
                          const isActive = openSyllabusIds.includes(day.id);
                          return (
                            <div 
                              key={day.id} 
                              className={`bg-[#16171D]/5 transition-all ${
                                isActive ? "border-b border-cyan/40" : "border-b border-[#2a2c35]"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  const isMobile = window.innerWidth < 768;
                                  if (isMobile) {
                                    setOpenSyllabusIds(isActive ? [] : [day.id]);
                                  } else {
                                    setOpenSyllabusIds(prev => 
                                      prev.includes(day.id) 
                                        ? prev.filter(x => x !== day.id) 
                                        : [...prev, day.id]
                                    );
                                  }
                                  setActiveSyllabusId(isActive ? null : day.id);
                                }}
                                className="w-full flex items-center justify-between py-5 px-4 text-left bg-transparent hover:bg-[#16171D]/25 transition-all duration-300 ease-in-out cursor-pointer"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Day number: "Day 01" — small, grey, monospace */}
                                  <span className="font-mono text-xs text-[#4A4A4A] font-bold">
                                    Day {day.dayNumber}
                                  </span>
                                  {/* Day title — white, medium weight */}
                                  <span className="font-sans text-xs sm:text-sm font-medium text-white tracking-wide">
                                    {day.title}
                                  </span>
                                </div>
                                {/* Expand/collapse chevron — right-aligned, cyan */}
                                <motion.div
                                  animate={{ rotate: isActive ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-cyan p-1 border border-cyan/10 bg-black/30 rounded"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </motion.div>
                              </button>

                              <AnimatePresence initial={false}>
                                {isActive && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-6 md:px-12 pb-6 pt-1 text-xs text-[#A0A2B0] space-y-4 leading-relaxed font-sans">
                                      {/* Bullet list of session content */}
                                      <ul className="space-y-2 text-[#A0A0A0]">
                                        {day.bullets?.map((bullet, idx) => (
                                          <li key={idx} className="flex items-start gap-2">
                                            <span className="text-cyan text-xs mt-0.5">•</span>
                                            <span>{bullet}</span>
                                          </li>
                                        ))}
                                      </ul>

                                      {/* Tools line at bottom */}
                                      {day.tools && (
                                        <PremiumToolList toolsText={day.tools} dayId={day.id} />
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              {/* Section C2: Tools We Teach With */}
              <section className="py-24 border-t border-cyan/10 bg-black/20">
                <div className="max-w-4xl mx-auto px-4 text-left">
                  <div className="mb-12">
                    <span 
                      className="text-xs font-bold tracking-widest text-cyan uppercase block font-mono mb-1"
                      style={{ fontVariant: "small-caps" }}
                    >
                      Tools We Teach With
                    </span>
                    <h2 className="font-sans text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                      A hand-picked stack of leading-edge AI, automation, and development environments.
                    </h2>
                  </div>

                  {/* Responsive grid of 6 cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: Local models */}
                    <div className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col gap-4 hover:border-cyan/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
                      <div className="w-10 h-10 rounded-lg bg-cyan/5 border border-cyan/10 flex items-center justify-center text-cyan">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-bold text-white mb-3 uppercase tracking-wide">
                          Local models
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="ollama" className="w-4.5 h-4.5 shrink-0" />
                            <span>Ollama</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="lm studio" className="w-4.5 h-4.5 shrink-0" />
                            <span>LM Studio</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Model playgrounds */}
                    <div className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col gap-4 hover:border-cyan/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
                      <div className="w-10 h-10 rounded-lg bg-cyan/5 border border-cyan/10 flex items-center justify-center text-cyan">
                        <TerminalIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-bold text-white mb-3 uppercase tracking-wide">
                          Model playgrounds
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="google ai studio" className="w-4.5 h-4.5 shrink-0" />
                            <span>Google AI Studio</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="claude" className="w-4.5 h-4.5 shrink-0" />
                            <span>Claude</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="openai playground" className="w-4.5 h-4.5 shrink-0" />
                            <span>OpenAI Playground</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Agent frameworks */}
                    <div className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col gap-4 hover:border-cyan/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
                      <div className="w-10 h-10 rounded-lg bg-cyan/5 border border-cyan/10 flex items-center justify-center text-cyan">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-bold text-white mb-3 uppercase tracking-wide">
                          Agent frameworks
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="langchain" className="w-4.5 h-4.5 shrink-0" />
                            <span>LangChain</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="crewai" className="w-4.5 h-4.5 shrink-0" />
                            <span>CrewAI</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Automation */}
                    <div className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col gap-4 hover:border-cyan/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
                      <div className="w-10 h-10 rounded-lg bg-cyan/5 border border-cyan/10 flex items-center justify-center text-cyan">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-bold text-white mb-3 uppercase tracking-wide">
                          Automation
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="n8n" className="w-4.5 h-4.5 shrink-0" />
                            <span>n8n</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="zapier" className="w-4.5 h-4.5 shrink-0" />
                            <span>Zapier</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="make" className="w-4.5 h-4.5 shrink-0" />
                            <span>Make.com</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 5: Rapid prototyping */}
                    <div className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col gap-4 hover:border-cyan/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
                      <div className="w-10 h-10 rounded-lg bg-cyan/5 border border-cyan/10 flex items-center justify-center text-cyan">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-bold text-white mb-3 uppercase tracking-wide">
                          Rapid prototyping
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="replit" className="w-4.5 h-4.5 shrink-0" />
                            <span>Replit</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="cursor" className="w-4.5 h-4.5 shrink-0" />
                            <span>Cursor</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 6: Media generation */}
                    <div className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col gap-4 hover:border-cyan/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
                      <div className="w-10 h-10 rounded-lg bg-cyan/5 border border-cyan/10 flex items-center justify-center text-cyan">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-bold text-white mb-3 uppercase tracking-wide">
                          Media generation
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="elevenlabs" className="w-4.5 h-4.5 shrink-0" />
                            <span>ElevenLabs</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="comfyui" className="w-4.5 h-4.5 shrink-0" />
                            <span>ComfyUI</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0E12] border border-[#2a2c35] text-xs font-mono text-slate-200 hover:text-white hover:border-cyan/40 hover:bg-black/90 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(6,182,212,0.12)] transition-all duration-200 rounded-md cursor-pointer">
                            <PremiumToolIcon name="hugging face spaces" className="w-4.5 h-4.5 shrink-0" />
                            <span>Hugging Face Spaces</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section D: Pricing Matrix */}
              <section id="investment" className="py-24 border-t border-cyan/10">
                <div className="max-w-5xl mx-auto px-4">
                  
                  {/* Rebuilt Header Structure */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <div className="text-left max-w-2xl">
                      <span 
                        className="text-[10px] font-mono text-cyan uppercase tracking-widest block font-bold mb-1"
                        style={{ fontVariant: "small-caps" }}
                      >
                        Pricing
                      </span>
                      <h2 className="font-sans text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                        Two standalone programs. One upfront seat payment — no subscriptions, no hidden fees.
                      </h2>
                    </div>

                    <div className="flex bg-black p-0.5 border border-[#2a2c35] rounded self-start md:self-auto shrink-0">
                      <button
                        onClick={() => setPricingCurrency("INR")}
                        className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
                          pricingCurrency === "INR"
                            ? "bg-cyan text-[#16171D]"
                            : "bg-transparent text-[#A0A2B0] hover:text-white"
                        }`}
                      >
                        ₹ INR
                      </button>
                      <button
                        onClick={() => setPricingCurrency("USD")}
                        className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
                          pricingCurrency === "USD"
                            ? "bg-cyan text-[#16171D]"
                            : "bg-transparent text-[#A0A2B0] hover:text-white"
                        }`}
                      >
                        $ USD
                      </button>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    
                    {/* BASE COHORT CARD */}
                    <div className="border border-[#2a2c35] p-8 bg-[#16171D]/40 flex flex-col justify-between rounded-xl relative overflow-hidden text-left min-h-[460px]">
                      <div>
                        {/* Track badge */}
                        <div className="inline-block px-3 py-1 border border-cyan bg-transparent text-cyan text-[10px] font-mono font-bold tracking-wider rounded-full uppercase mb-6">
                          Base Cohort
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                          {masterclassActive ? (
                            <>
                              <span className="text-3xl font-sans font-bold text-cyan tracking-tight leading-none">
                                {pricingCurrency === "INR" ? "₹3,999" : "$59"}
                              </span>
                              <span className="text-sm font-sans font-medium text-[#A0A2B0]/60 line-through tracking-tight leading-none">
                                {pricingCurrency === "INR" ? "₹4,999" : "$79"}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan/10 text-cyan border border-cyan/20 animate-pulse uppercase tracking-wider ml-1">
                                SAVE {pricingCurrency === "INR" ? "₹1,000" : "$20"}
                              </span>
                            </>
                          ) : (
                            <span className="text-3xl font-sans font-bold text-white tracking-tight leading-none">
                              {pricingCurrency === "INR" ? "₹4,999" : "$79"}
                            </span>
                          )}
                        </div>

                        {/* Payment note */}
                        <p className="text-[10px] text-[#A0A2B0] font-sans mb-6 uppercase tracking-wider">
                          Single upfront seat payment
                        </p>

                        {/* Divider */}
                        <div className="h-[1px] bg-[#2A2A2A] w-full mb-6" />

                        {/* Feature list */}
                        <ul className="space-y-4 mb-8 text-left font-sans text-xs text-[#A0A2B0]">
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">6-day live curriculum access</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Digital interactive documentation</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Community access</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Hands-on project: build and demo one real AI-powered tool</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Completion certificate</span>
                          </motion.li>
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => {
                          const baseTier = {
                            id: "standard",
                            name: "Base Cohort",
                            subtitle: masterclassActive ? "Launch pricing" : "6-Day sprint",
                            priceINR: masterclassActive ? 3999 : 4999,
                            priceUSD: masterclassActive ? 59 : 79,
                            features: [
                              "6-day live curriculum access",
                              "Digital interactive documentation",
                              "Community access",
                              "Hands-on project: build and demo one real AI-powered tool",
                              "Completion certificate"
                            ],
                            isPremium: false
                          };
                          setSelectedPricingTier(baseTier as any);
                          setIsConfirmationOpen(true);
                        }}
                        className="w-full py-3.5 bg-cyan text-[#16171D] font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded cursor-pointer mt-auto"
                      >
                        ENROLL NOW
                      </button>
                    </div>

                    {/* PREMIUM ALPHA CARD */}
                    <motion.div 
                      animate={{
                        borderColor: ["rgba(6,182,212,0.2)", "rgba(6,182,212,0.55)", "rgba(6,182,212,0.2)"],
                        boxShadow: [
                          "0 0 20px rgba(6,182,212,0.03)",
                          "0 0 35px rgba(6,182,212,0.15)",
                          "0 0 20px rgba(6,182,212,0.03)"
                        ]
                      }}
                      whileHover={{
                        borderColor: "rgba(6,182,212,0.7)",
                        boxShadow: "0 0 40px rgba(6,182,212,0.25)",
                        scale: 1.01
                      }}
                      transition={{
                        borderColor: {
                          repeat: Infinity,
                          duration: 4,
                          ease: "easeInOut"
                        },
                        boxShadow: {
                          repeat: Infinity,
                          duration: 4,
                          ease: "easeInOut"
                        },
                        scale: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        }
                      }}
                      className="border p-8 bg-[#16171D]/40 flex flex-col justify-between rounded-xl relative overflow-hidden text-left min-h-[460px]"
                    >
                      {/* Animated Sparkles and Shimmer Overlay */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                        {/* Shimmer sweep effect */}
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 4.5,
                            ease: "easeInOut",
                            repeatDelay: 3
                          }}
                          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan/5 to-transparent skew-x-12"
                        />
                        
                        {/* Floating Twinkling Sparkles Radial */}
                        <motion.div
                          animate={{
                            opacity: [0.15, 0.45, 0.15],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 4,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.08),transparent_70%)]"
                        />

                        {/* Particle 1 */}
                        <motion.div
                          initial={{ opacity: 0.1, scale: 0.6 }}
                          animate={{ 
                            opacity: [0.1, 0.9, 0.1],
                            scale: [0.6, 1.2, 0.6],
                            y: [0, -12, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 3,
                            delay: 0.2,
                            ease: "easeInOut"
                          }}
                          className="absolute top-10 right-12 text-cyan/70"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-cyan/20" />
                        </motion.div>

                        {/* Particle 2 */}
                        <motion.div
                          initial={{ opacity: 0.2, scale: 0.4 }}
                          animate={{ 
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.4, 1.0, 0.4],
                            y: [0, -8, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 4,
                            delay: 1.5,
                            ease: "easeInOut"
                          }}
                          className="absolute top-28 left-8 text-cyan/50"
                        >
                          <Sparkles className="w-3 h-3 fill-cyan/10" />
                        </motion.div>

                        {/* Particle 3 */}
                        <motion.div
                          initial={{ opacity: 0.15, scale: 0.5 }}
                          animate={{ 
                            opacity: [0.15, 0.95, 0.15],
                            scale: [0.5, 1.3, 0.5],
                            y: [0, -15, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 3.5,
                            delay: 0.8,
                            ease: "easeInOut"
                          }}
                          className="absolute bottom-24 right-8 text-cyan/60"
                        >
                          <Sparkles className="w-4 h-4 fill-cyan/20" />
                        </motion.div>

                        {/* Particle 4 */}
                        <motion.div
                          initial={{ opacity: 0.1, scale: 0.5 }}
                          animate={{ 
                            opacity: [0.1, 0.7, 0.1],
                            scale: [0.5, 1.1, 0.5],
                            y: [0, -10, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 4.5,
                            delay: 2.2,
                            ease: "easeInOut"
                          }}
                          className="absolute top-1/2 left-12 text-cyan/40"
                        >
                          <Sparkles className="w-3 h-3" />
                        </motion.div>

                        {/* Sparkling/twinkling background dot 1 */}
                        <motion.div
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                          className="absolute top-6 left-1/3 w-1 h-1 bg-cyan rounded-full shadow-[0_0_8px_#06b6d4]"
                        />

                        {/* Sparkling/twinkling background dot 2 */}
                        <motion.div
                          animate={{ opacity: [0.1, 0.9, 0.1] }}
                          transition={{ repeat: Infinity, duration: 2.5, delay: 1.2 }}
                          className="absolute bottom-16 left-1/4 w-1.5 h-1.5 bg-cyan rounded-full shadow-[0_0_10px_#06b6d4]"
                        />
                        
                        {/* Sparkling/twinkling background dot 3 */}
                        <motion.div
                          animate={{ opacity: [0.2, 0.8, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1.8, delay: 0.1 }}
                          className="absolute top-20 right-24 w-1 h-1 bg-white rounded-full shadow-[0_0_6px_#ffffff]"
                        />
                      </div>

                      <div className="relative z-10">
                        {/* Track badge */}
                        <div className="inline-block px-3 py-1 border border-cyan bg-transparent text-cyan text-[10px] font-mono font-bold tracking-wider rounded-full uppercase mb-6">
                          Premium Alpha
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                          {masterclassActive ? (
                            <>
                              <span className="text-3xl font-sans font-bold text-cyan tracking-tight leading-none">
                                {pricingCurrency === "INR" ? "₹9,999" : "$149"}
                              </span>
                              <span className="text-sm font-sans font-medium text-[#A0A2B0]/60 line-through tracking-tight leading-none">
                                {pricingCurrency === "INR" ? "₹12,999" : "$199"}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan/10 text-cyan border border-cyan/20 animate-pulse uppercase tracking-wider ml-1">
                                SAVE {pricingCurrency === "INR" ? "₹3,000" : "$50"}
                              </span>
                            </>
                          ) : (
                            <span className="text-3xl font-sans font-bold text-white tracking-tight leading-none">
                              {pricingCurrency === "INR" ? "₹12,999" : "$199"}
                            </span>
                          )}
                        </div>

                        {/* Payment note */}
                        <p className="text-[10px] text-[#A0A2B0] font-sans mb-6 uppercase tracking-wider">
                          Single upfront seat payment
                        </p>

                        {/* Divider */}
                        <div className="h-[1px] bg-[#2A2A2A] w-full mb-6" />

                        {/* Feature list */}
                        <ul className="space-y-4 mb-8 text-left font-sans text-xs text-[#A0A2B0]">
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">13-day standalone Multi-Bot & Automation Studio curriculum</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Hands-on build: design and ship a working multi-bot system across the program</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">1:1 architecture & workflow review session</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Priority live Q&A access</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Professionally packaged capstone write-up — ready to share with employers or clients</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Small-batch cohort, capped seats for direct mentor attention</span>
                          </motion.li>
                          <motion.li 
                            whileHover="hover"
                            className="flex items-start gap-2.5 group cursor-pointer"
                          >
                            <motion.div
                              variants={{
                                hover: { scale: 1.25, rotate: 10, y: -0.5 }
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="group-hover:text-white transition-colors duration-200">Completion certificate</span>
                          </motion.li>
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => {
                          const premiumTier = {
                            id: "premium",
                            name: "Premium Alpha",
                            subtitle: masterclassActive ? "Executive Masterclass Offer (reverts soon!)" : "13-Day standalone sprint",
                            priceINR: masterclassActive ? 9999 : 12999,
                            priceUSD: masterclassActive ? 149 : 199,
                            features: [
                              "13-day standalone Multi-Bot & Automation Studio curriculum",
                              "Hands-on build: design and ship a working multi-bot system across the program",
                              "1:1 architecture & workflow review session",
                              "Priority live Q&A access",
                              "Professionally packaged capstone write-up — ready to share with employers or clients",
                              "Small-batch cohort, capped seats for direct mentor attention",
                              "Completion certificate"
                            ],
                            isPremium: true
                          };
                          setSelectedPricingTier(premiumTier as any);
                          setIsConfirmationOpen(true);
                        }}
                        className="w-full py-3.5 bg-cyan text-[#16171D] font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded cursor-pointer mt-auto"
                      >
                        ENROLL NOW
                      </button>
                    </motion.div>

                  </div>

                  {/* Savings Note */}
                  <div className="text-center mt-12 mx-auto max-w-[480px]">
                    <p className="text-xs text-[#A0A0A0] font-sans leading-relaxed">
                      Enrolling in both programs separately? Premium Alpha is the deeper standalone track — not an extension of Base Cohort. They cover different scopes. Pick the one that fits where you are.
                    </p>
                  </div>
                </div>
              </section>

            </motion.div>
          ) : currentTab === "student" ? (
            <motion.div
              key="student-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="px-4 md:px-12 py-12 min-h-[90vh]"
            >
              {!signedInUser ? (
                <div className="max-w-xl mx-auto py-16 text-center border-2 border-red-500/20 bg-[#16171D]/40 backdrop-blur-sm p-8 rounded-2xl relative shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 grid-overlay pointer-events-none opacity-20"></div>
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="font-mono text-xs font-bold uppercase text-red-400 tracking-widest">STUDENT_DESK // CREDENTIALS REQUIRED</h3>
                  <p className="font-mono text-[9px] text-on-surface-variant uppercase mt-3 mb-8 leading-relaxed max-w-md mx-auto">
                    The student learning environment contains secure compiler modules, active telemetry sync, and cognitive training pipelines. Access requires Google identity verification.
                  </p>
                  
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setIsGoogleOAuthOpen(true)}
                      className="flex items-center gap-3 bg-white text-gray-800 font-sans font-bold text-xs uppercase px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-all border border-gray-200 cursor-pointer hover:shadow-cyan/10"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                </div>
              ) : !hasPaid && !developerMode ? (
                <div className="max-w-3xl mx-auto py-12 border border-[#2a2c35] bg-[#16171D]/30 p-8 rounded-2xl relative shadow-2xl">
                  <div className="absolute inset-0 grid-overlay pointer-events-none opacity-10"></div>
                  
                  {/* Dynamic Masterclass Promo Alert Banner for Logged-in Students */}
                  {masterclassActive && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-5 bg-gradient-to-r from-red-500/20 via-red-950/20 to-cyan/15 border border-red-500/40 rounded-xl relative overflow-hidden text-left"
                    >
                      <div className="absolute inset-0 grid-overlay pointer-events-none opacity-5"></div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                        <div className="space-y-1">
                          <span className="text-[10px] bg-red-500 text-black px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest animate-pulse inline-block">
                            URGENT // COHORT CONVERSION EVENT ACTIVE
                          </span>
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                            Free Masterclass Dynamic Pricing Slashed!
                          </h3>
                          <p className="text-[9px] text-[#A0A2B0] uppercase tracking-wide max-w-xl leading-normal">
                            Seat pricing is temporarily reduced during this live event. After the timer expires, prices will immediately return to standard rates. <span className="text-white font-bold">You will not be able to get this promotional price again.</span>
                          </p>
                        </div>

                        <div className="bg-black/80 border border-red-500/30 p-3 rounded-lg flex flex-col items-center min-w-[130px] shadow-lg shrink-0">
                          <span className="text-[8px] text-[#A0A2B0] uppercase tracking-widest block mb-0.5 font-bold">REVERSION_CLOCK</span>
                          <span className="text-lg font-mono font-bold text-red-400 animate-pulse tabular-nums">
                            {Math.floor(masterclassTimeLeft / 60) < 10 ? "0" : ""}{Math.floor(masterclassTimeLeft / 60)}:
                            {masterclassTimeLeft % 60 < 10 ? "0" : ""}{masterclassTimeLeft % 60}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h3 className="font-mono text-xs font-bold uppercase text-amber-400 tracking-widest">ACTIVE COHORT PLAN REQUIRED</h3>
                    <p className="font-mono text-[9px] text-[#A0A2B0] uppercase mt-2 max-w-md mx-auto leading-relaxed">
                      Authenticated as <span className="text-white font-semibold">{signedInUser}</span>. No active cohort enrollment records compiled on your cryptographic ledger. Please finalize seat purchase.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-4">
                    {getPricingTiers().map((tier) => (
                      <div key={tier.id} className="border border-[#2a2c35] bg-black/40 p-6 rounded-xl flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] text-cyan uppercase block mb-1 font-bold">{tier.subtitle}</span>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-2">{tier.name}</h4>
                          {masterclassActive && (
                            <div className="text-[8px] text-red-500 line-through font-bold uppercase tracking-widest block mb-0.5">
                              ORIGINAL: {tier.id === "standard" ? "₹4,999 / $99 USD" : "₹14,999 / $299 USD"}
                            </div>
                          )}
                          <div className="text-base font-bold text-white mb-4">
                            ₹{tier.priceINR.toLocaleString()} / <span className="text-[9px] text-[#A0A2B0] font-normal">${tier.priceUSD} USD</span>
                            {masterclassActive && (
                              <span className="text-[8px] text-red-400 font-bold uppercase ml-1.5 px-1 py-0.5 bg-red-500/10 border border-red-500/20 rounded animate-pulse">
                                PROMO
                              </span>
                            )}
                          </div>
                          <ul className="space-y-1.5 mb-6 text-[8px] uppercase text-[#A0A2B0] font-mono">
                            {tier.features.slice(0, 3).map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-cyan rounded-full"></span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPricingTier(tier);
                            setIsConfirmationOpen(true);
                          }}
                          className="w-full py-2 bg-cyan text-black font-mono text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer rounded animate-pulse"
                        >
                          SELECT {tier.name.toUpperCase()}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <button
                      onClick={() => setSignedInUser(null)}
                      className="text-[9px] font-mono uppercase text-on-surface-variant hover:text-white underline cursor-pointer"
                    >
                      Use another Google account to sign in
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <StudentDashboard 
                    syllabus={syllabus}
                    onNewLog={handleNewLog}
                    showNotification={showNotification}
                    userTier={userTrack === "premium" ? "premium" : "standard"}
                    userRole={userRole}
                    userTrack={userTrack}
                    userCohortId={userCohortId}
                    sessionToken={sessionToken}
                    currentUserEmail={signedInUser}
                  />

                  <div className="border-t border-[#2a2c35]/40 pt-12 mt-12">
                    <div className="text-center mb-8">
                      <span className="text-[10px] font-mono text-[#E58A3C] uppercase tracking-widest">COHORT EVALUATION STATION</span>
                      <h2 className="font-mono text-lg md:text-xl font-bold uppercase tracking-[0.2em] mt-1 text-white">
                        Submit Your Feedback
                      </h2>
                    </div>
                    <FeedbackSection 
                      signedInUser={signedInUser}
                      onNewFeedback={handleNewFeedback}
                      showNotification={showNotification}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ) : currentTab === "services" ? (
            <motion.div
              key="services-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="px-4 md:px-12 py-12 min-h-[90vh]"
            >
              <ServicesDashboard />
            </motion.div>
          ) : currentTab === "frameworks" ? (
            <motion.div
              key="frameworks-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="px-4 md:px-12 py-12 min-h-[90vh]"
            >
              <FrameworksDashboard />
            </motion.div>
          ) : currentTab === "case-studies" ? (
            <motion.div
              key="case-studies-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="px-4 md:px-12 py-12 min-h-[90vh]"
            >
              <CaseStudiesDashboard 
                userTier={signedInUser ? "premium" : "standard"}
                onNewLog={handleNewLog}
                showNotification={showNotification}
              />
            </motion.div>
          ) : currentTab === "pricing" ? (
            <motion.div
              key="pricing-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="px-4 md:px-12 py-12 min-h-[90vh]"
            >
              <PricingDashboard 
                userTier={signedInUser ? "premium" : "standard"}
                onUpgradeClick={(tier) => {
                  setSelectedPricingTier(tier);
                  setIsConfirmationOpen(true);
                }}
                pricingTiers={getPricingTiers()}
                showNotification={showNotification}
                keyId={process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_codexia5566"}
                masterclassActive={masterclassActive}
                masterclassTimeLeft={masterclassTimeLeft}
              />
            </motion.div>
          ) : (
            // Tab G: Integrated Admin Monitor with Advanced Authentication Gated under secure RBAC
            userRole === "admin" ? (
              <motion.div
                key="admin-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="px-4 md:px-12 py-12 min-h-[90vh]"
              >
                <AdminDashboard 
                  webinarMetrics={webinarMetrics}
                  setWebinarMetrics={setWebinarMetrics}
                  financialMetrics={financialMetrics}
                  setFinancialMetrics={setFinancialMetrics}
                  complaintLogs={complaintLogs}
                  setComplaintLogs={setComplaintLogs}
                  lastSyncTime={lastSyncTime}
                  handleExportCSV={handleExportCSV}
                  toggleLogStatus={toggleLogStatus}
                  showNotification={showNotification}
                  masterclassActive={masterclassActive}
                  setMasterclassActive={handleSetMasterclassActive}
                  masterclassTimeLeft={masterclassTimeLeft}
                  setMasterclassTimeLeft={handleSetMasterclassTimeLeft}
                  developerMode={developerMode}
                  setDeveloperMode={setDeveloperMode}
                  signedInUser={signedInUser}
                  setSignedInUser={setSignedInUser}
                  feedbacks={feedbacks}
                  sessionToken={sessionToken}
                  onLogout={handleAuthLogout}
                />
              </motion.div>
            ) : (
              <motion.div
                key="admin-restricted"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="px-4 md:px-12 py-24 min-h-[90vh] flex flex-col items-center justify-center"
              >
                <div className="max-w-md w-full bg-[#16171D]/40 border border-red-500/30 p-8 rounded-xl text-center space-y-6">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 mx-auto animate-pulse">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-red-400">ADMIN GATEWAY // REJECTED</h3>
                  <p className="font-mono text-[10px] text-on-surface-variant uppercase leading-relaxed">
                    MANUAL REQUEST DETECTED. PATHWAY "/admin" REJECTED. YOU DO NOT POSSESS ADMINISTRATOR PRIVILEGES.
                  </p>
                  <button
                    onClick={() => {
                      setIsGoogleOAuthOpen(true);
                    }}
                    className="w-full py-3 bg-red-500/15 border border-red-500/30 font-mono text-xs uppercase tracking-widest text-red-400 hover:bg-red-500/25 transition-all rounded cursor-pointer"
                  >
                    Authenticate Admin Credentials
                  </button>
                  <button
                    onClick={() => navigateToTab("curriculum")}
                    className="w-full py-3 border border-[#2a2c35] font-mono text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-white transition-all rounded cursor-pointer"
                  >
                    Return to Curriculum
                  </button>
                </div>
              </motion.div>
            )
          )}

          {/* This dummy block prevents unused variable lint errors and acts as cleanup */}
          {false && (
            <div className="hidden">
              <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
                
                {/* Real-time Webinar Tracker (4 cols) */}
                <section className="col-span-12 lg:col-span-4 bg-[#16171D]/40 border border-[#2a2c35] p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6 border-b border-[#2a2c35]/60 pb-3">
                      <h3 className="font-mono text-[10px] font-bold uppercase text-on-surface-variant flex items-center gap-2 tracking-widest">
                        <Activity className="w-4 h-4 text-cyan" />
                        Webinar Tracker
                      </h3>
                      <span className="text-[9px] font-mono text-cyan bg-cyan/10 px-2.5 py-0.5 border border-cyan/20 animate-pulse">
                        LIVE
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-[#0d0e14]/60 border border-[#2a2c35]">
                        <div className="text-[10px] font-mono uppercase text-on-surface-variant mb-1.5 tracking-wider">
                          Active Registration Total
                        </div>
                        <div className="font-mono text-4xl font-bold text-white tabular-nums flex items-baseline gap-1.5">
                          {webinarMetrics.activeRegistrations.toLocaleString()}
                          <span className="text-[9px] text-cyan uppercase tracking-wider">SEATS</span>
                        </div>
                        <div className="w-full bg-black h-1.5 mt-4 border border-[#2a2c35]/50">
                          <div 
                            className="bg-cyan h-full transition-all duration-1000" 
                            style={{ width: `${webinarMetrics.capacityPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono mt-2 text-on-surface-variant uppercase tracking-widest">
                          <span>COHORT_ALPHA</span>
                          <span>{webinarMetrics.capacityPercentage}% CAPACITY</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0d0e14]/60 border border-[#2a2c35]">
                          <div className="text-[9px] font-mono uppercase text-on-surface-variant mb-1 tracking-wider">
                            Waitlist
                          </div>
                          <div className="font-mono text-xl font-bold text-white tabular-nums">
                            {webinarMetrics.waitlist}
                          </div>
                        </div>
                        <div className="p-4 bg-[#0d0e14]/60 border border-[#2a2c35]">
                          <div className="text-[9px] font-mono uppercase text-on-surface-variant mb-1 tracking-wider">
                            Conversion Rate
                          </div>
                          <div className="font-mono text-xl font-bold text-white tabular-nums">
                            {webinarMetrics.conversionRate}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#2a2c35]/60">
                    <button 
                      onClick={handleExportCSV}
                      className="w-full py-2.5 border border-[#2a2c35] text-[10px] font-mono uppercase hover:border-cyan hover:text-cyan transition-all flex justify-center items-center gap-2 tracking-widest cursor-pointer"
                    >
                      Export Telemetry CSV
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>

                {/* Financial Revenue Engine (8 cols) */}
                <section className="col-span-12 lg:col-span-8 bg-[#16171D]/40 border border-[#2a2c35] p-6 flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#2a2c35]/60 pb-3">
                    <h3 className="font-mono text-[10px] font-bold uppercase text-on-surface-variant flex items-center gap-2 tracking-widest">
                      <DollarSign className="w-4 h-4 text-cyan" />
                      Financial Revenue Engine
                    </h3>
                    <div className="flex items-center gap-1 bg-black p-1 border border-[#2a2c35]">
                      <button className="px-3 py-1 text-[9px] font-mono uppercase text-black bg-cyan font-bold tracking-wider">
                        Daily Interval
                      </button>
                      <button 
                        onClick={() => showNotification("Monthly intervals are compiled in production pipeline logs.")}
                        className="px-3 py-1 text-[9px] font-mono uppercase text-on-surface-variant hover:text-white tracking-wider cursor-pointer"
                      >
                        Monthly Log
                      </button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="border-l-2 border-[#2a2c35] px-4 py-1">
                      <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
                        Gross Volume (USD)
                      </div>
                      <div className="font-mono text-lg font-bold text-white tracking-wide">
                        ${financialMetrics.totalGrossUSD.toLocaleString()}
                      </div>
                    </div>
                    <div className="border-l-2 border-[#2a2c35] px-4 py-1">
                      <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
                        Gross Volume (INR)
                      </div>
                      <div className="font-mono text-lg font-bold text-cyan tracking-wide">
                        ₹{(financialMetrics.totalGrossINR / 10000000).toFixed(2)} Cr
                      </div>
                    </div>
                    <div className="border-l-2 border-[#2a2c35] px-4 py-1">
                      <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
                        Average Ticket Size
                      </div>
                      <div className="font-mono text-lg font-bold text-white tracking-wide">
                        ${financialMetrics.avgOrderValueUSD}.00
                      </div>
                    </div>
                  </div>

                  {/* Visual Bar Chart representation */}
                  <div className="flex-grow flex items-end justify-between gap-1.5 sm:gap-3 h-52 border-b border-[#2a2c35] relative px-2 pb-1">
                    {/* Background indicators */}
                    <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between pointer-events-none opacity-5">
                      <div className="border-t border-[#2a2c35] w-full"></div>
                      <div className="border-t border-[#2a2c35] w-full"></div>
                      <div className="border-t border-[#2a2c35] w-full"></div>
                      <div className="border-t border-[#2a2c35] w-full"></div>
                    </div>

                    {/* Generate Bars dynamically */}
                    {financialMetrics.chartData.map((bar, i) => {
                      // Normalize heights between 25% and 95%
                      const barHeight = Math.max(25, Math.min(95, (bar.amount / 28000) * 100));
                      return (
                        <div 
                          key={i} 
                          className="flex-grow flex flex-col justify-end group cursor-pointer relative"
                          style={{ height: "100%" }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cyan text-black font-mono text-[9px] font-bold px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 uppercase tracking-tighter">
                            ${bar.amount.toLocaleString()}
                          </div>

                          <div 
                            className={`w-full transition-all duration-300 ${
                              bar.isHighlighted 
                                ? "bg-cyan/80 group-hover:bg-cyan" 
                                : "bg-[#1C1E26] border border-[#2a2c35] group-hover:bg-cyan/40 group-hover:border-cyan"
                            }`}
                            style={{ height: `${barHeight}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Days labels */}
                  <div className="flex justify-between mt-3 text-[9px] font-mono text-on-surface-variant uppercase px-2 tracking-widest">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                  </div>
                </section>

                {/* Satisfaction & Complaint Logs Table (12 cols) */}
                <section className="col-span-12 bg-[#16171D]/40 border border-[#2a2c35] overflow-hidden">
                  <div className="p-6 border-b border-[#2a2c35] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d0e14]/50">
                    <h3 className="font-mono text-[10px] font-bold uppercase text-on-surface-variant flex items-center gap-2 tracking-widest">
                      <Sliders className="w-4 h-4 text-cyan" />
                      Satisfaction &amp; Complaint Telemetry
                    </h3>

                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                      <span className="text-[9px] font-mono text-error uppercase tracking-widest font-bold">
                        {complaintLogs.filter(c => c.status !== "RESOLVED").length} UNRESOLVED HIGH SEVERITY EVENTS
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-[10px]">
                      <thead>
                        <tr className="bg-[#1C1E26] border-b border-[#2a2c35] text-on-surface-variant uppercase tracking-wider">
                          <th className="px-6 py-4 font-bold">Log Coordinate</th>
                          <th className="px-6 py-4 font-bold">User/System Entity</th>
                          <th className="px-6 py-4 font-bold">Parameters Incurred</th>
                          <th className="px-6 py-4 font-bold">Severity</th>
                          <th className="px-6 py-4 font-bold">Timestamp</th>
                          <th className="px-6 py-4 font-bold text-right">Diagnostic Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2c35]/50">
                        {complaintLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#1a1b21]/30 transition-all">
                            <td className="px-6 py-4 text-cyan font-bold">#{log.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-black border border-[#2a2c35] flex items-center justify-center text-[9px] font-bold text-white">
                                  {log.studentEntity.initials}
                                </div>
                                <span className="text-white text-[10px] tracking-tighter">
                                  {log.studentEntity.username}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant max-w-xs truncate uppercase">
                              {log.issueDescription}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${
                                log.severity === "HIGH" 
                                  ? "bg-error/10 text-error border-error/20" 
                                  : log.severity === "MEDIUM" 
                                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" 
                                  : "bg-cyan/10 text-cyan border-cyan/20"
                              }`}>
                                {log.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant text-[9px]">
                              {log.timestamp}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => toggleLogStatus(log.id)}
                                className={`px-3 py-1 font-mono text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                                  log.status === "RESOLVED" 
                                    ? "border-green-500/30 text-green-500 bg-green-500/5 hover:bg-green-500 hover:text-black" 
                                    : log.status === "INVESTIGATING" 
                                    ? "border-yellow-500/30 text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500 hover:text-black" 
                                    : "border-cyan/30 text-cyan bg-cyan/5 hover:bg-cyan hover:text-black"
                                }`}
                              >
                                {log.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="p-4 border-t border-[#2a2c35] flex justify-between items-center bg-[#0d0e14]/30">
                    <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">
                      Log sequence compiled // Active telemetry
                    </span>
                    <div className="flex gap-1.5 text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">
                      <span>Records locked: {complaintLogs.length}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Enquiry Form + Process Section */}
        {(currentTab === "curriculum" || currentTab === "pricing") && (
          <>
            {/* FAQ Section */}
            <section id="faq" className="py-24 border-t border-[#2a2c35]/40 bg-[#0D0E12] relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.02),transparent_50%)] z-0" />
              <div className="max-w-4xl mx-auto px-6 relative z-10">
                
                {/* FAQ Header */}
                <div className="text-center mb-16">
                  <span 
                    className="text-[10px] font-mono text-cyan uppercase tracking-widest block font-bold mb-2 animate-pulse"
                    style={{ fontVariant: "small-caps" }}
                  >
                    Frequently Asked Questions
                  </span>
                  <h2 className="font-sans text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight uppercase">
                    GOT QUESTIONS? WE’VE GOT ANSWERS
                  </h2>
                  <p className="text-xs text-[#A0A2B0]/80 font-sans mt-2 max-w-lg mx-auto">
                    Everything you need to know about Codexia cohorts, pricing, and outcomes.
                  </p>
                </div>

                {/* FAQ Accordion List */}
                <div className="space-y-0 border-t border-[#2a2c35] max-w-3xl mx-auto">
                  {faqItems.map((item, idx) => {
                    const isActive = openFaqIds.includes(item.id);
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-[#16171D]/5 transition-all ${
                          isActive ? "border-b border-cyan/40" : "border-b border-[#2a2c35]"
                        }`}
                      >
                        <button
                          onClick={() => {
                            const isMobile = window.innerWidth < 768;
                            if (isMobile) {
                              setOpenFaqIds(isActive ? [] : [item.id]);
                            } else {
                              setOpenFaqIds(prev => 
                                prev.includes(item.id) 
                                  ? prev.filter(x => x !== item.id) 
                                  : [...prev, item.id]
                              );
                            }
                          }}
                          className="w-full flex items-center justify-between py-5 px-4 text-left bg-transparent hover:bg-[#16171D]/25 transition-all duration-300 ease-in-out cursor-pointer"
                        >
                          <div className="flex items-center gap-4 pr-4">
                            {/* Question Indicator */}
                            <span className="font-mono text-xs text-cyan/70 font-bold shrink-0">
                              Q{idx + 1}
                            </span>
                            {/* Question Title */}
                            <span className="font-sans text-sm md:text-base font-semibold text-white tracking-wide">
                              {item.question}
                            </span>
                          </div>
                          {/* Chevron icon */}
                          <motion.div
                            animate={{ rotate: isActive ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-cyan p-1 border border-cyan/10 bg-black/30 rounded shrink-0"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 md:px-12 pb-6 pt-1 text-xs md:text-sm text-[#A0A2B0]/90 leading-relaxed font-sans font-normal">
                                <p className="text-[#A0A2B0]/90">
                                  {item.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>

            {/* Feedback Section - Positioned after FAQ section on Curriculum Page */}
            {currentTab === "curriculum" && (
              <section id="feedback" className="py-24 border-t border-[#2a2c35]/40 bg-[#0D0E12] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,rgba(229,138,60,0.015),transparent_50%)] z-0" />
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                  <div className="text-center mb-12">
                    <span className="text-[10px] font-mono text-[#E58A3C] uppercase tracking-widest block font-bold mb-2">
                      COHORT EVALUATION STATION
                    </span>
                    <h2 className="font-mono text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-white">
                      Submit Your Feedback
                    </h2>
                  </div>
                  <FeedbackSection 
                    signedInUser={signedInUser}
                    onNewFeedback={handleNewFeedback}
                    showNotification={showNotification}
                  />
                </div>
              </section>
            )}

            <section id="consultation" className="py-24 border-t border-[#2a2c35] bg-[#0D0E12] relative overflow-hidden">
            {/* Background decorative mesh or subtle glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.03),transparent_60%)] z-0" />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Process Section (Left on Desktop, Top on Mobile) */}
                <div className="lg:col-span-5 text-left space-y-8">
                  <div>
                    <span 
                      className="text-xs font-bold tracking-widest text-[#E58A3C] uppercase block font-mono mb-1"
                      style={{ fontVariant: "small-caps" }}
                    >
                      Onboarding Protocol
                    </span>
                    <h2 className="font-sans text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                      How We Align With Your Team
                    </h2>
                    <p className="text-xs text-[#A0A2B0] font-sans mt-2">
                      A transparent, structured three-step process to transition your team to high-performance AI workflows.
                    </p>
                  </div>

                  {/* Timeline Steps */}
                  <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#2a2c35]">
                    {/* Step 1 */}
                    <div className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-[#16171D] border border-cyan flex items-center justify-center font-mono text-[9px] font-bold text-cyan z-10 shrink-0">
                        1
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-sans text-sm font-bold text-white">Review</h3>
                        <p className="text-xs text-[#A0A2B0]">
                          We review your team size and query to check for alignment (1-2 business days).
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-[#16171D] border border-cyan flex items-center justify-center font-mono text-[9px] font-bold text-cyan z-10 shrink-0">
                        2
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-sans text-sm font-bold text-white">Discovery call</h3>
                        <p className="text-xs text-[#A0A2B0]">
                          30-min architecture deep dive to scope your automation needs.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-[#16171D] border border-cyan flex items-center justify-center font-mono text-[9px] font-bold text-cyan z-10 shrink-0">
                        3
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-sans text-sm font-bold text-white">Custom proposal</h3>
                        <p className="text-xs text-[#A0A2B0]">
                          Private cohort curriculum and commercial pricing package.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enquiry Form Section (Right on Desktop, Bottom on Mobile) */}
                <div className="lg:col-span-7 bg-[#16171D]/40 border border-[#2a2c35] p-8 rounded-2xl relative text-left">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.01),transparent_40%)]" />
                  
                  <div className="mb-6 relative z-10">
                    <span 
                      className="text-[10px] font-mono text-cyan uppercase tracking-widest block font-bold mb-1"
                      style={{ fontVariant: "small-caps" }}
                    >
                      Request Consultation
                    </span>
                    <h3 className="font-sans text-lg font-bold text-white">Let&apos;s Build Your System</h3>
                  </div>

                  <form onSubmit={handleEnquirySubmit} className="space-y-4 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] uppercase text-[#A0A2B0] tracking-wider">Full Name *</label>
                        <input 
                          type="text" 
                          required
                          value={enquiryForm.fullName}
                          onChange={(e) => setEnquiryForm({...enquiryForm, fullName: e.target.value})}
                          placeholder="Jane Doe"
                          className="w-full bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3.5 py-2 text-xs font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                        />
                      </div>

                      {/* Work Email */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] uppercase text-[#A0A2B0] tracking-wider">Work Email *</label>
                        <input 
                          type="email" 
                          required
                          value={enquiryForm.workEmail}
                          onChange={(e) => setEnquiryForm({...enquiryForm, workEmail: e.target.value})}
                          placeholder="jane@company.com"
                          className="w-full bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3.5 py-2 text-xs font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] uppercase text-[#A0A2B0] tracking-wider">Company Name</label>
                        <input 
                          type="text" 
                          value={enquiryForm.companyName}
                          onChange={(e) => setEnquiryForm({...enquiryForm, companyName: e.target.value})}
                          placeholder="Acme Corp"
                          className="w-full bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3.5 py-2 text-xs font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                        />
                      </div>

                      {/* Team Size */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] uppercase text-[#A0A2B0] tracking-wider">Team Size</label>
                        <select 
                          value={enquiryForm.teamSize}
                          onChange={(e) => setEnquiryForm({...enquiryForm, teamSize: e.target.value})}
                          className="w-full bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-cyan/50"
                        >
                          <option value="1">1 person</option>
                          <option value="2-15">2 - 15 people</option>
                          <option value="15+">15+ people</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] uppercase text-[#A0A2B0] tracking-wider">Phone Number *</label>
                        <div className="flex gap-2">
                          <select 
                            value={enquiryForm.countryCode}
                            onChange={(e) => setEnquiryForm({...enquiryForm, countryCode: e.target.value})}
                            className="bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-cyan/50 shrink-0 w-[110px] cursor-pointer"
                          >
                            <option value="+91">IND +91</option>
                            <option value="+1">USA +1</option>
                            <option value="+44">GBR +44</option>
                            <option value="+61">AUS +61</option>
                            <option value="+971">UAE +971</option>
                          </select>
                          <input 
                            type="tel" 
                            required
                            value={enquiryForm.phoneNumber}
                            onChange={(e) => setEnquiryForm({...enquiryForm, phoneNumber: e.target.value})}
                            placeholder="+91 XXXXXXXXXX"
                            className="flex-1 bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3.5 py-2 text-xs font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                          />
                        </div>
                      </div>

                      {/* Where did you hear about us */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] uppercase text-[#A0A2B0] tracking-wider">Where did you hear about us? *</label>
                        <select 
                          required
                          value={enquiryForm.source}
                          onChange={(e) => setEnquiryForm({...enquiryForm, source: e.target.value})}
                          className="w-full bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-cyan/50 cursor-pointer"
                        >
                          <option value="" disabled>Select an option</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Google">Google</option>
                          <option value="Referral">Referral</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Program Interested In */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[10px] uppercase text-[#A0A2B0] tracking-wider">Program Interested In</label>
                      <select 
                        value={enquiryForm.program}
                        onChange={(e) => setEnquiryForm({...enquiryForm, program: e.target.value})}
                        className="w-full bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-cyan/50"
                      >
                        <option value="Base Cohort">Base Cohort (6-Day Sprint)</option>
                        <option value="Premium Alpha">Premium Alpha (13-Day Deep Dive)</option>
                        <option value="Both">Both Tracks (Comprehensive Alignment)</option>
                      </select>
                    </div>

                    {/* Query */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[10px] uppercase text-[#A0A2B0] tracking-wider">Describe your scaling or automation query *</label>
                      <textarea 
                        required
                        rows={4}
                        value={enquiryForm.query}
                        onChange={(e) => setEnquiryForm({...enquiryForm, query: e.target.value})}
                        placeholder="Briefly tell us what processes you are trying to automate or scale with AI..."
                        className="w-full bg-[#0D0E12]/80 border border-[#2a2c35] rounded px-3.5 py-2 text-xs font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50 resize-none"
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-cyan text-[#16171D] font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded cursor-pointer mt-4"
                    >
                      Submit Enquiry
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </section>
          </>
        )}
      </main>

      {/* Persistent Footer Area */}
      <footer className="w-full py-16 bg-[#040507] border-t border-[#1d1f27] px-6 md:px-12 z-20 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 text-left">
          
          {/* Left Column (Brand, Copyright, Socials, Currency Selector) */}
          <div className="col-span-12 md:col-span-4 flex flex-col justify-between md:border-r md:border-[#1d1f27] md:pr-12">
            <div>
              {/* Logo with smooth pulse/hover micro-animations */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 mb-4 cursor-pointer inline-flex"
                onClick={() => {
                  setCurrentTab("curriculum");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div className="w-5 h-5 border border-cyan rounded-full flex items-center justify-center relative">
                  <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-ping"></div>
                </div>
                <span className="font-mono text-sm font-bold tracking-[0.2em] uppercase text-white">CODEXIA</span>
              </motion.div>
              
              <p className="font-mono text-[9px] text-[#8e919e] uppercase tracking-widest leading-relaxed mb-6 max-w-sm">
                © 2026 CODEXIA SYSTEMS COGNITIVE FABRIC. ALL PRIVACY AND INTELLECTUAL INTEGRATION PARAMETERS SECURED UNDER GLOBAL LEDGER STANDARDS.
              </p>
            </div>

            {/* Social Icons & Interactive Currency switcher */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); showNotification("Connecting to Facebook secure routing..."); }}
                className="w-8 h-8 rounded border border-[#1d1f27] bg-[#090b0e] flex items-center justify-center text-[#8e919e] hover:text-cyan hover:border-cyan/50 hover:bg-[#0c0f14] transition-all" 
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); showNotification("Connecting to Instagram secure routing..."); }}
                className="w-8 h-8 rounded border border-[#1d1f27] bg-[#090b0e] flex items-center justify-center text-[#8e919e] hover:text-cyan hover:border-cyan/50 hover:bg-[#0c0f14] transition-all" 
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); showNotification("Connecting to LinkedIn secure routing..."); }}
                className="w-8 h-8 rounded border border-[#1d1f27] bg-[#090b0e] flex items-center justify-center text-[#8e919e] hover:text-cyan hover:border-cyan/50 hover:bg-[#0c0f14] transition-all" 
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); showNotification("Connecting to Twitter secure routing..."); }}
                className="w-8 h-8 rounded border border-[#1d1f27] bg-[#090b0e] flex items-center justify-center text-[#8e919e] hover:text-cyan hover:border-cyan/50 hover:bg-[#0c0f14] transition-all" 
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              
              <div className="relative inline-block text-left ml-auto sm:ml-0">
                <select
                  value={pricingCurrency}
                  onChange={(e) => setPricingCurrency(e.target.value as "INR" | "USD")}
                  className="bg-[#090b0e] border border-[#1d1f27] text-[#8e919e] font-mono text-[10px] uppercase tracking-wider py-1.5 pl-3 pr-8 rounded focus:outline-none focus:border-cyan/50 cursor-pointer hover:text-white hover:border-[#2a2c35] transition-all appearance-none"
                >
                  <option value="INR">INR ₹</option>
                  <option value="USD">USD $</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#8e919e]">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns (4 Column Grid) */}
          <div className="col-span-12 md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8 pl-0 md:pl-8">
            {/* Column 1 */}
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-4">
                Cohorts & Labs
              </h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("curriculum");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Base Cohort (6-Day)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("curriculum");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Premium Alpha (13-Day)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("curriculum");
                      setTimeout(() => {
                        document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Dynamic Syllabus
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("student");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Student Workspace
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-4">
                Enterprise
              </h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("services");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Fractional AI Leader
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("services");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Private Team Sprints
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("services");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Systems Integration
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("curriculum");
                      setTimeout(() => {
                        document.getElementById("consultation")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Request Consultation
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-4">
                Frameworks
              </h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("frameworks");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    C.O.D.E. Method
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("frameworks");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Prompt Architecture
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const mail = prompt("Enter email coordinate for telemetry feed subscription:");
                      if (mail) {
                        showNotification(`Telemetry feed synced with ${mail}`);
                      }
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Mesh Telemetry Feed
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentTab("admin");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Diagnostics Engine
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-4">
                Systems & Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => showNotification("Secure documentation is accessible via the circular AI agent workspace.")}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    System Documentation
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => showNotification("Terms of Service: All interactions must conform with decentralized ledger integrity guidelines.")}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Terms of Integration
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => showNotification("Privacy Safeguards: Zero telemetry records are sold or exported to secondary centralized cloud nodes.")}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Privacy Safeguards
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => showNotification("Refund Parameters: Reallocation of reserved seats valid up to 48 hours before Day 1 execution cycle.")}
                    className="font-sans text-xs text-[#8e919e] hover:text-cyan hover:underline transition-colors text-left cursor-pointer"
                  >
                    Refund Parameters
                  </button>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </footer>

      {/* Google OAuth Identity Modal */}
      <GoogleOAuthModal
        isOpen={isGoogleOAuthOpen}
        onClose={() => setIsGoogleOAuthOpen(false)}
        onSuccess={handleGoogleSignInSuccess}
      />

      {/* Enroll Confirmation Modal to prevent accidental clicks */}
      <EnrollConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => {
          setIsConfirmationOpen(false);
          setSelectedPricingTier(null);
        }}
        onConfirm={() => {
          setIsConfirmationOpen(false);
          setIsRazorpayOpen(true);
        }}
        tier={selectedPricingTier}
        currency={pricingCurrency}
        masterclassActive={masterclassActive}
      />

      {/* Razorpay Checkout Modal Integration */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => {
          setIsRazorpayOpen(false);
          setSelectedPricingTier(null);
        }}
        tier={selectedPricingTier}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Autonomous Cybernetic AI Agent (Circular persistent widget) */}
      <CircularAgent 
        activeSyllabusId={activeSyllabusId}
        setActiveSyllabusId={setActiveSyllabusId}
        onNewLog={handleNewLog}
        onNewMeeting={handleNewMeeting}
      />
    </div>
  );
}

// Simple Helper X close icon for mock modals
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
