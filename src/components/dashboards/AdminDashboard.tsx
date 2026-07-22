import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  DollarSign, 
  Sliders, 
  Clock, 
  Download,
  ShieldAlert,
  Sparkles,
  Lock,
  Unlock,
  Key,
  Shield,
  User,
  Users,
  Check,
  X,
  Send,
  RefreshCw,
  TrendingUp,
  Server,
  UserCheck,
  Search,
  Star,
  Video,
  ExternalLink,
  Calendar
} from "lucide-react";
import { WebinarMetrics, FinancialMetrics, ComplaintLog, StudentFeedback, Cohort } from "../../types";
import { googleSignIn, createMeetSpace, auth } from "../../lib/googleMeet";
import { onAuthStateChanged } from "firebase/auth";
import AdminCurriculumCalendar from "./AdminCurriculumCalendar";
import BusinessAnalyticsPanel from "./BusinessAnalyticsPanel";

interface AdminRosterProfile {
  username: string;
  name: string;
  email: string;
  role: string;
  clearance: string;
  node: string;
  ip: string;
  passkey: string;
}

const ADMIN_ROSTER: AdminRosterProfile[] = [
  {
    username: "mallikharjuna_rao",
    name: "Mallikharjuna Rao",
    email: "vankayalapatimallikharjunarao@gmail.com",
    role: "Principal Architect & Director",
    clearance: "L4_PRINCIPAL (ROOT)",
    node: "SECTOR_COHORT_NODE_04",
    ip: "192.168.1.104",
    passkey: "MALLIK-ARCH-2026"
  },
  {
    username: "sarah_lin",
    name: "Sarah Lin",
    email: "sarah.ops@codexia.io",
    role: "Admissions & Operations Lead",
    clearance: "L3_STANDARD",
    node: "SECTOR_COHORT_NODE_01",
    ip: "192.168.1.88",
    passkey: "SARAH-OPS-2026"
  },
  {
    username: "alex_sec",
    name: "Alex DevSecOps",
    email: "sec.auditor@codexia.com",
    role: "Lead Cybersecurity Auditor",
    clearance: "L3_SECURE",
    node: "SECTOR_SECURITY_NODE_09",
    ip: "10.0.4.12",
    passkey: "ALEX-SEC-2026"
  }
];

interface WebinarTrack {
  id: string;
  name: string;
  instructor: string;
  status: "LIVE" | "STANDBY" | "COMPLETED";
  viewers: number;
  quality: string;
  bandwidth: string;
  chatLogs: {
    id: string;
    student: string;
    message: string;
    timestamp: string;
  }[];
}

interface WaitlistedStudent {
  email: string;
  username: string;
  trackId: string;
  timestamp: string;
  tier: "standard" | "premium";
  cohort_id?: string;
}

interface EnrolledStudent {
  email: string;
  username: string;
  trackId: string;
  timestamp: string;
  tier: "standard" | "premium";
  cohort_id?: string;
}

interface AdminDashboardProps {
  webinarMetrics: WebinarMetrics;
  setWebinarMetrics: React.Dispatch<React.SetStateAction<WebinarMetrics>>;
  financialMetrics: FinancialMetrics;
  setFinancialMetrics: React.Dispatch<React.SetStateAction<FinancialMetrics>>;
  complaintLogs: ComplaintLog[];
  setComplaintLogs: React.Dispatch<React.SetStateAction<ComplaintLog[]>>;
  lastSyncTime: string;
  handleExportCSV: () => void;
  toggleLogStatus: (id: string) => void;
  showNotification: (msg: string) => void;
  masterclassActive: boolean;
  setMasterclassActive: (active: boolean) => void;
  masterclassTimeLeft: number;
  setMasterclassTimeLeft: (seconds: number) => void;
  developerMode: boolean;
  setDeveloperMode: (mode: boolean) => void;
  signedInUser: string | null;
  setSignedInUser: (user: string | null) => void;
  feedbacks?: StudentFeedback[];
  sessionToken?: string | null;
  onLogout?: () => void;
}

export default function AdminDashboard({
  webinarMetrics,
  setWebinarMetrics,
  financialMetrics,
  setFinancialMetrics,
  complaintLogs,
  setComplaintLogs,
  lastSyncTime,
  handleExportCSV,
  toggleLogStatus,
  showNotification,
  masterclassActive,
  setMasterclassActive,
  masterclassTimeLeft,
  setMasterclassTimeLeft,
  developerMode,
  setDeveloperMode,
  signedInUser,
  setSignedInUser,
  feedbacks = [],
  sessionToken,
  onLogout
}: AdminDashboardProps) {
  
  // ----------------------------------------------------
  // Local Session State
  // ----------------------------------------------------
  const [activeAdmin, setActiveAdmin] = useState<AdminRosterProfile | null>(() => {
    const saved = localStorage.getItem("codexia_active_admin_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Real Google Meet API States
  const [realMeetUrl, setRealMeetUrl] = useState<string>("");
  const [isGoogleOAuthActive, setIsGoogleOAuthActive] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string>("");
  const [isGeneratingMeet, setIsGeneratingMeet] = useState<boolean>(false);

  // Sync state periodically from server in case it changes
  useEffect(() => {
    const fetchMeetUrl = async () => {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      try {
        const res = await fetch("/api/admin/state", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.live_meet_url !== undefined && data.live_meet_url !== realMeetUrl) {
            setRealMeetUrl(data.live_meet_url);
          }
        }
      } catch (err) {
        console.error("Failed to sync Meet URL from server:", err);
      }
    };
    fetchMeetUrl();
    const interval = setInterval(fetchMeetUrl, 3000);
    return () => clearInterval(interval);
  }, [realMeetUrl, sessionToken]);

  // Firebase auth listener
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
          setRealMeetUrl(space.meetingUri);
          
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (sessionToken) {
            headers["Authorization"] = `Bearer ${sessionToken}`;
          }
          // Persist to server instead of localStorage
          await fetch("/api/admin/state", {
            method: "POST",
            headers,
            body: JSON.stringify({ live_meet_url: space.meetingUri })
          });
          showNotification("SUCCESS // Live Google Meet room established!");
        }
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`ERROR // Failed to generate Google Meet: ${err.message || err}`);
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  // Login Input Forms
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPasskey, setLoginPasskey] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptStep, setDecryptStep] = useState("");

  // Webinar Tracks Active Data
  const [activeTrackId, setActiveTrackId] = useState("track-alpha");
  const [webinarTracks, setWebinarTracks] = useState<WebinarTrack[]>([
    {
      id: "track-alpha",
      name: "SRE & Swarm Load Balancing",
      instructor: "Mallikharjuna Rao",
      status: "LIVE",
      viewers: 142,
      quality: "1080p / 60fps (Secure WebRTC)",
      bandwidth: "4.8 Mbps",
      chatLogs: [
        { id: "c1", student: "rohan_dev", message: "Rao, is the context-window optimization safe for H100 partitions?", timestamp: "12:05" },
        { id: "c2", student: "neha_sys", message: "The load distribution latency looks incredibly low!", timestamp: "12:08" },
        { id: "c3", student: "amit_k", message: "Where can we download the Day 3 self-healing scripts?", timestamp: "12:12" }
      ]
    },
    {
      id: "track-beta",
      name: "Multi-Agent Consensus Protocol",
      instructor: "AI Swarm Orchestrator",
      status: "STANDBY",
      viewers: 0,
      quality: "720p Standby Link",
      bandwidth: "0.0 Mbps",
      chatLogs: [
        { id: "c4", student: "mark_ai", message: "Will today's sandbox cover Gossip sync?", timestamp: "11:45" }
      ]
    },
    {
      id: "track-gamma",
      name: "Zero-Latency Routing Nodes",
      instructor: "Sarah Lin",
      status: "COMPLETED",
      viewers: 89,
      quality: "1080p (Archive VOD)",
      bandwidth: "N/A",
      chatLogs: [
        { id: "c5", student: "rahul_v", message: "Excellent outline of the IP proxy routes.", timestamp: "Yesterday" }
      ]
    }
  ]);

  // Waitlisted Students State
  const [waitlistStudents, setWaitlistStudents] = useState<WaitlistedStudent[]>([]);

  // Recently Registered Students
  const [recentlyRegistered, setRecentlyRegistered] = useState<EnrolledStudent[]>([]);

  // Cohort state and alerts filter selection
  const [cohortsList, setCohortsList] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("ALL");

  // Helper to update server state
  const updateServerState = async (updates: any) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
    }
    try {
      await fetch("/api/admin/state", {
        method: "POST",
        headers,
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Failed to update server state:", err);
    }
  };

  // Sync state from server on mount and periodically
  useEffect(() => {
    const fetchState = async () => {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      try {
        const res = await fetch("/api/admin/state", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.webinar_tracks) setWebinarTracks(data.webinar_tracks);
          if (data.waitlist_students) setWaitlistStudents(data.waitlist_students);
          if (data.recently_registered) setRecentlyRegistered(data.recently_registered);
        } else if (res.status === 401 || res.status === 403) {
          console.warn("Unauthorized access to admin state. Disengaging.");
          if (onLogout) onLogout();
        }

        const cohortsRes = await fetch("/api/cohorts", { headers });
        if (cohortsRes.ok) {
          const cohortsData = await cohortsRes.json();
          setCohortsList(cohortsData);
        }
      } catch (e) {
        console.error("Error fetching state from server:", e);
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  // Direct Admission Form Fields
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [newStudentTrack, setNewStudentTrack] = useState("track-alpha");
  const [newStudentTier, setNewStudentTier] = useState<"standard" | "premium">("standard");

  // Admin Directive Chat Message field
  const [adminDirectiveMessage, setAdminDirectiveMessage] = useState("");

  // Telemetry Filtering Mode
  const [logFilter, setLogFilter] = useState<"ALL" | "SECURITY" | "STUDENT" | "WAITLIST">("ALL");
  const [logSearchQuery, setLogSearchQuery] = useState("");

  // Admin Operating Sub-tab state
  const [adminSubTab, setAdminSubTab] = useState<"overview" | "alerts" | "curriculum" | "analytics">("overview");

  // Multi-Factor Authentication States
  const [twoFactorProfile, setTwoFactorProfile] = useState<AdminRosterProfile | null>(null);
  const [twoFactorOtpInput, setTwoFactorOtpInput] = useState("");
  const [twoFactorSentCode, setTwoFactorSentCode] = useState("");

  // Registration Alerts Feed State
  const [alertFeedFilter, setAlertFeedFilter] = useState<"ALL" | "ENROLLMENT" | "WAITLIST">("ALL");
  const [alertSearchQuery, setAlertSearchQuery] = useState("");

  // Keep state sync with Server instead of localStorage
  useEffect(() => {
    updateServerState({ webinar_tracks: webinarTracks });
  }, [webinarTracks]);

  useEffect(() => {
    updateServerState({ waitlist_students: waitlistStudents });
    setWebinarMetrics(prev => ({ ...prev, waitlist: waitlistStudents.length }));
  }, [waitlistStudents, setWebinarMetrics]);

  useEffect(() => {
    updateServerState({ recently_registered: recentlyRegistered });
  }, [recentlyRegistered]);

  // Synchronize top navbar bypass or OAuth email changes
  useEffect(() => {
    if (developerMode && !activeAdmin) {
      // If parent developerMode was toggled on (e.g. from nav bypass), automatically bind to principal admin Rao
      const matchingAdmin = ADMIN_ROSTER.find(a => a.email === signedInUser) || ADMIN_ROSTER[0];
      setActiveAdmin(matchingAdmin);
      localStorage.setItem("codexia_active_admin_session", JSON.stringify(matchingAdmin));
    } else if (!developerMode && activeAdmin) {
      // If parent developerMode was toggled off, disengage admin session
      setActiveAdmin(null);
      localStorage.removeItem("codexia_active_admin_session");
    }
  }, [developerMode, signedInUser]);

  // Handle active countdown and simulated random actions when logged in
  useEffect(() => {
    if (!activeAdmin) return;

    // Simulate occasional random spectator increase on Live Tracks
    const tickInterval = setInterval(() => {
      setWebinarTracks(prev => prev.map(track => {
        if (track.status === "LIVE") {
          const delta = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          return {
            ...track,
            viewers: Math.max(120, track.viewers + delta)
          };
        }
        return track;
      }));
    }, 12000);

    return () => clearInterval(tickInterval);
  }, [activeAdmin]);

  // Helper to format correct date string matching current time
  const getCurrentFormattedTime = () => {
    const d = new Date();
    return d.toISOString().replace("T", " ").substring(0, 19);
  };

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

  // Secure Decryption Login Execution
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showNotification("ENTER ADMINISTRATIVE IDENTIFICATION EMAIL");
      return;
    }

    // Attempt to locate matching profile
    const profile = ADMIN_ROSTER.find(
      p => p.email.toLowerCase() === loginEmail.toLowerCase() || p.username.toLowerCase() === loginEmail.toLowerCase()
    );

    if (!profile) {
      showNotification("ACCESS DENIED // INCORRECT IDENTITY COORDINATES");
      return;
    }

    if (loginPasskey !== profile.passkey) {
      showNotification("SECURITY BLOCK // INVALID CRYPTO PASSKEY SEQUENCE");
      return;
    }

    // Trigger Multi-Factor Security Check
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setTwoFactorProfile(profile);
    setTwoFactorSentCode(code);
    setTwoFactorOtpInput("");
    
    showNotification(`🔑 MFA CHALLENGE SENT // Simulated OTP code is: ${code}`);
  };

  // Verify Multi-Factor Email Code Handshake
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorProfile || !twoFactorSentCode) return;

    if (twoFactorOtpInput.trim() !== twoFactorSentCode) {
      showNotification("SECURITY BLOCK // INVALID MULTI-FACTOR AUTHENTICATION CODE");
      return;
    }

    const profile = twoFactorProfile;

    // Success login sequence animations
    setIsDecrypting(true);
    setDecryptStep("ENGAGING CRYPTOGRAPHIC TUNNEL...");

    setTimeout(() => {
      setDecryptStep(`VERIFYING SECURITY CREDENTIALS [${profile.clearance}]...`);
    }, 1000);

    setTimeout(() => {
      setDecryptStep(`SYNCHRONIZING TELEMETRY PIPELINE TO NODE: ${profile.node}...`);
    }, 2000);

    setTimeout(() => {
      // Apply States
      setActiveAdmin(profile);
      setDeveloperMode(true);
      setSignedInUser(profile.email);
      localStorage.setItem("codexia_active_admin_session", JSON.stringify(profile));

      // Append Real Log Entry
      const newLog: ComplaintLog = {
        id: `SEC-${Math.floor(Math.random() * 9000 + 1000)}`,
        studentEntity: {
          initials: profile.username.substring(0, 2).toUpperCase(),
          username: `${profile.username} (ADMIN)`
        },
        issueDescription: `SECURITY EXECUTED // Session initiated for ${profile.name} [Clearance: ${profile.clearance}] from IP ${profile.ip}. Secure handshake complete.`,
        severity: "HIGH",
        timestamp: getCurrentFormattedTime(),
        status: "RESOLVED"
      };

      setComplaintLogs(prev => [newLog, ...prev]);
      setIsDecrypting(false);
      setLoginEmail("");
      setLoginPasskey("");
      setTwoFactorProfile(null);
      setTwoFactorSentCode("");
      setTwoFactorOtpInput("");
      showNotification(`AUTHORIZED // Admin Session Activated for ${profile.name}`);
    }, 3200);
  };

  // Log Out Administration Session
  const handleAdminLogout = () => {
    if (!activeAdmin) return;

    const profile = activeAdmin;

    // Append Real Log Entry
    const logoutLog: ComplaintLog = {
      id: `SEC-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: {
        initials: profile.username.substring(0, 2).toUpperCase(),
        username: `${profile.username} (ADMIN)`
      },
      issueDescription: `SECURITY TERMINATED // Administrative session safely disconnected for ${profile.name} [IP: ${profile.ip}]. Key tokens destroyed.`,
      severity: "MEDIUM",
      timestamp: getCurrentFormattedTime(),
      status: "RESOLVED"
    };

    setComplaintLogs(prev => [logoutLog, ...prev]);
    setActiveAdmin(null);
    setDeveloperMode(false);
    setSignedInUser(null);
    localStorage.removeItem("codexia_active_admin_session");
    showNotification("DISENGAGED // Administrative session terminated safely.");
  };

  // Select Quick Roster profile to auto-fill testing form
  const fillRosterTemplate = (profile: AdminRosterProfile) => {
    setLoginEmail(profile.email);
    setLoginPasskey(profile.passkey);
    showNotification(`Filled credentials for ${profile.name}`);
  };

  // Post Administrative Directive to Track Chat
  const handleSendDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDirectiveMessage.trim() || !activeAdmin) return;

    const messageText = adminDirectiveMessage;
    setAdminDirectiveMessage("");

    // 1. Update the chat log for active track
    setWebinarTracks(prev => prev.map(track => {
      if (track.id === activeTrackId) {
        return {
          ...track,
          chatLogs: [
            ...track.chatLogs,
            {
              id: `dir-${Date.now()}`,
              student: `Directive [${activeAdmin.name}]`,
              message: messageText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return track;
    }));

    // 2. Add System Log
    const selectedTrackName = webinarTracks.find(t => t.id === activeTrackId)?.name || activeTrackId;
    const directiveLog: ComplaintLog = {
      id: `SYS-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: {
        initials: activeAdmin.username.substring(0, 2).toUpperCase(),
        username: `${activeAdmin.username} (ADMIN)`
      },
      issueDescription: `ADMIN DIRECTIVE ISSUED // Broadcasted key to ${selectedTrackName}: "${messageText}"`,
      severity: "LOW",
      timestamp: getCurrentFormattedTime(),
      status: "RESOLVED"
    };

    setComplaintLogs(prev => [directiveLog, ...prev]);
    showNotification("DIRECTIVE BROADCASTED SUCCESSFULLY");
  };

  // Waitlist Seat Approvals
  const handleApproveWaitlist = (student: WaitlistedStudent) => {
    // 1. Remove from waitlist state
    setWaitlistStudents(prev => prev.filter(s => s.email !== student.email));

    // 2. Increment active registration metrics
    setWebinarMetrics(prev => {
      const nextReg = prev.activeRegistrations + 1;
      return {
        ...prev,
        activeRegistrations: nextReg,
        capacityPercentage: Math.min(100, Math.round((nextReg / 3674) * 100))
      };
    });

    // 3. Add to recently registered
    const newlyEnrolled: EnrolledStudent = {
      email: student.email,
      username: student.username,
      trackId: student.trackId,
      timestamp: getCurrentFormattedTime(),
      tier: student.tier
    };
    setRecentlyRegistered(prev => [newlyEnrolled, ...prev]);

    // 4. Update financials as simulation
    const addedUSD = student.tier === "premium" ? (masterclassActive ? 149 : 199) : (masterclassActive ? 59 : 79);
    const addedINR = student.tier === "premium" ? (masterclassActive ? 9999 : 12999) : (masterclassActive ? 3999 : 4999);
    setFinancialMetrics(prev => {
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

    // 5. Append system log
    const trackName = webinarTracks.find(t => t.id === student.trackId)?.name || student.trackId;
    const approveLog: ComplaintLog = {
      id: `SYS-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: {
        initials: student.username.substring(0, 2).toUpperCase(),
        username: student.username
      },
      issueDescription: `COHORT SEAT APPROVED // Waitlist converted to ACTIVE seat on ${trackName}. [Tier: ${student.tier.toUpperCase()}]`,
      severity: "MEDIUM",
      timestamp: getCurrentFormattedTime(),
      status: "RESOLVED"
    };

    setComplaintLogs(prev => [approveLog, ...prev]);
    showNotification(`APPROVED SEAT // Admitted ${student.email}`);
  };

  const handleDeclineWaitlist = (email: string) => {
    setWaitlistStudents(prev => prev.filter(s => s.email !== email));

    // Append log
    const declineLog: ComplaintLog = {
      id: `SYS-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: { initials: "WL", username: "waitlist_sys" },
      issueDescription: `WAITLIST REMOVED // Enrollment application coordinates rejected for student: ${email}`,
      severity: "LOW",
      timestamp: getCurrentFormattedTime(),
      status: "RESOLVED"
    };
    setComplaintLogs(prev => [declineLog, ...prev]);
    showNotification(`DECLINED // Removed application coordinates for ${email}`);
  };

  // Direct Admin Seat Assignment
  const handleDirectAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail.trim() || !newStudentUsername.trim()) {
      showNotification("COMPLETE ALL DIRECT REGISTRATION FIELDS");
      return;
    }

    // 1. Increment registrations
    setWebinarMetrics(prev => {
      const nextReg = prev.activeRegistrations + 1;
      return {
        ...prev,
        activeRegistrations: nextReg,
        capacityPercentage: Math.min(100, Math.round((nextReg / 3674) * 100))
      };
    });

    // 2. Add to enrolled list
    const directStudent: EnrolledStudent = {
      email: newStudentEmail,
      username: newStudentUsername,
      trackId: newStudentTrack,
      timestamp: getCurrentFormattedTime(),
      tier: newStudentTier
    };
    setRecentlyRegistered(prev => [directStudent, ...prev]);

    // 3. Update financial indicators
    const addedUSD = newStudentTier === "premium" ? (masterclassActive ? 149 : 199) : (masterclassActive ? 59 : 79);
    const addedINR = newStudentTier === "premium" ? (masterclassActive ? 9999 : 12999) : (masterclassActive ? 3999 : 4999);
    setFinancialMetrics(prev => {
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

    // 4. Log event
    const trackName = webinarTracks.find(t => t.id === newStudentTrack)?.name || newStudentTrack;
    const directLog: ComplaintLog = {
      id: `REG-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: {
        initials: newStudentUsername.substring(0, 2).toUpperCase(),
        username: newStudentUsername
      },
      issueDescription: `MANUAL DIRECT REGISTRATION // Assigned administrative seat override for ${newStudentEmail} on ${trackName}.`,
      severity: "HIGH",
      timestamp: getCurrentFormattedTime(),
      status: "RESOLVED"
    };

    setComplaintLogs(prev => [directLog, ...prev]);

    // Reset Fields
    setNewStudentEmail("");
    setNewStudentUsername("");
    showNotification(`DIRECT RESERVATION ASSIGNED // Student active: ${newStudentUsername}`);
  };

  // Clear system logs & reload defaults
  const handleResetSystemTelemetry = () => {
    const baseDate = new Date();
    // Reconstruct with current relative times
    const remappedLogs = [
      {
        id: "BUG-4091",
        studentEntity: { initials: "JD", username: "john_doe_99" },
        issueDescription: "Payment processed but course access not granted in dashboard.",
        severity: "HIGH" as const,
        status: "UNRESOLVED" as const
      },
      {
        id: "BUG-4088",
        studentEntity: { initials: "AS", username: "alice_sys" },
        issueDescription: "Video lesson #4 buffering repeatedly on 5G connection.",
        severity: "MEDIUM" as const,
        status: "UNRESOLVED" as const
      },
      {
        id: "BUG-4085",
        studentEntity: { initials: "MK", username: "mark_dev" },
        issueDescription: "Spelling error in 'Advanced Microservices' title name.",
        severity: "LOW" as const,
        status: "UNRESOLVED" as const
      },
      {
        id: "BUG-4082",
        studentEntity: { initials: "SL", username: "sarah_l" },
        issueDescription: "Profile picture upload fails if image is exactly 2MB.",
        severity: "LOW" as const,
        status: "UNRESOLVED" as const
      }
    ].map((log, index) => {
      const logDate = new Date(baseDate.getTime() - (index * 4 + 1.5) * 60 * 60 * 1000);
      return {
        ...log,
        timestamp: logDate.toISOString().replace("T", " ").substring(0, 16)
      };
    });

    setComplaintLogs(remappedLogs);
    setWaitlistStudents([]);
    setRecentlyRegistered([]);
    showNotification("TELEMETRY SYSTEM RE-INITIALIZED // ALL DATA SHARDS RE-ALIGNED");
  };

  // Combined Chronological Registration Alerts Generator
  const getRegistrationAlerts = () => {
    let enrollments = recentlyRegistered.map(r => ({
      ...r,
      cohort_id: r.cohort_id || "CODX-2026-07-BASE-01",
      type: "ENROLLMENT" as const,
      status: "COMPLETED" as const,
      timestampVal: new Date(r.timestamp).getTime() || Date.now()
    }));
    
    let waitlists = waitlistStudents.map(w => ({
      ...w,
      cohort_id: w.cohort_id || "CODX-2026-07-BASE-01",
      type: "WAITLIST" as const,
      status: "PENDING_APPROVAL" as const,
      timestampVal: Date.now() - 3600000 // default offset
    }));
    
    if (selectedCohortId !== "ALL") {
      enrollments = enrollments.filter(e => e.cohort_id === selectedCohortId);
      waitlists = waitlists.filter(w => w.cohort_id === selectedCohortId);
    }
    
    const combined = [...enrollments, ...waitlists];
    // Sort chronologically (newest first)
    combined.sort((a, b) => b.timestampVal - a.timestampVal);
    
    return combined;
  };

  // Filter and search combined registration alerts
  const getFilteredAlerts = () => {
    const alerts = getRegistrationAlerts();
    let filtered = alerts;
    if (alertFeedFilter === "ENROLLMENT") {
      filtered = alerts.filter(a => a.type === "ENROLLMENT");
    } else if (alertFeedFilter === "WAITLIST") {
      filtered = alerts.filter(a => a.type === "WAITLIST");
    }

    if (alertSearchQuery.trim()) {
      const q = alertSearchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.username.toLowerCase().includes(q) || 
        a.email.toLowerCase().includes(q)
      );
    }
    return filtered;
  };



  // Filter logs list based on categories & search query
  const getFilteredLogs = () => {
    let filtered = complaintLogs;
    if (logFilter === "SECURITY") {
      filtered = complaintLogs.filter(l => l.id.startsWith("SEC"));
    } else if (logFilter === "STUDENT") {
      filtered = complaintLogs.filter(l => l.issueDescription.includes("STUDENT") || l.id.startsWith("PAY") || l.issueDescription.includes("DIRECT") || l.issueDescription.includes("FEEDBACK"));
    } else if (logFilter === "WAITLIST") {
      filtered = complaintLogs.filter(l => l.issueDescription.includes("WAITLIST") || l.issueDescription.includes("SEAT"));
    }

    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.studentEntity.username.toLowerCase().includes(q) || 
        l.issueDescription.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const activeTrack = webinarTracks.find(t => t.id === activeTrackId) || webinarTracks[0];

  // ----------------------------------------------------
  // RENDER SECURITY ACCESS GATEWAY (IF NOT LOGGED IN)
  // ----------------------------------------------------
  if (!activeAdmin) {
    return (
      <div className="font-mono max-w-4xl mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#16171D] border-2 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.08)] p-6 md:p-10 rounded-2xl relative overflow-hidden"
        >
          {/* Mainframe Graphic Grid */}
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Locked Header */}
          <div className="flex flex-col items-center text-center pb-8 border-b border-[#2a2c35]/60 mb-8 relative">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              {isDecrypting ? (
                <RefreshCw className="w-8 h-8 animate-spin text-cyan" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
            <h1 className="text-sm md:text-base font-bold uppercase tracking-[0.25em] text-red-400">
              CODEXIA // ADMIN_AUTH_GATEWAY_v3.1
            </h1>
            <p className="text-[9px] text-[#A0A2B0] uppercase tracking-wider mt-2 max-w-lg leading-relaxed">
              REVOLVING CRYPTOGRAPHIC AUTHENTICATION HANDSHAKE REQUIRED. ACTIVATE ADMINISTRATOR TERMINAL ACCESS KEY TO SYNC SECTOR TELEMETRY.
            </p>
          </div>

          {isDecrypting ? (
            <div className="flex flex-col items-center justify-center py-16 font-mono text-center space-y-6">
              <div className="text-cyan text-xs uppercase tracking-widest font-bold animate-pulse">
                {decryptStep}
              </div>
              <div className="w-64 h-1 bg-black border border-[#2a2c35] rounded-full overflow-hidden relative">
                <motion.div 
                  className="bg-cyan h-full absolute left-0"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </div>
              <p className="text-[8px] text-[#A0A2B0] uppercase tracking-widest animate-pulse">
                DO NOT DISCONNECT OR SWITCH PORT TABS. STANDBY...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
              
              {/* Left Column: Registered Security Roster */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-[9px] font-bold uppercase text-red-400 tracking-widest flex items-center gap-1.5 border-b border-red-500/10 pb-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  SECURE REGISTERED ROSTER
                </h3>
                
                {signedInUser ? (
                  <>
                    <p className="text-[8px] text-slate-400 uppercase leading-normal">
                      Click a security administrator's credentials profile below to pre-load key values:
                    </p>

                    <div className="space-y-2.5">
                      {ADMIN_ROSTER.map((p) => (
                        <div 
                          key={p.username}
                          onClick={() => fillRosterTemplate(p)}
                          className="p-3 border border-[#2a2c35] bg-black/40 rounded-lg hover:border-cyan/50 hover:bg-black/80 cursor-pointer transition-all flex items-center gap-3 group"
                        >
                          <div className="w-7 h-7 bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[10px] font-bold text-white rounded group-hover:border-cyan/40 group-hover:text-cyan">
                            {p.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[9px] font-bold text-white group-hover:text-cyan uppercase tracking-tighter">
                              {p.name}
                            </div>
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest leading-none mt-1">
                              {p.role}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-5 border border-red-500/20 bg-black/30 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                    <Lock className="w-8 h-8 text-red-400/60 animate-pulse" />
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">GOOGLE HANDSHAKE DECRYPTED ONLY</span>
                    <p className="text-[8px] text-slate-400 uppercase leading-relaxed max-w-xs">
                      SECURITY ROSTER SUGGESTIONS ARE DECRYPTED ONLY AFTER ESTABLISHING AN ACTIVE GOOGLE IDENTITY SIGN-IN SECURE CHANNEL.
                    </p>
                    <div className="text-[7px] text-slate-600 uppercase">
                      SECURE AUDIT PORT CHECK IN PROGRESS...
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Authenticator Key Input Form */}
              <div className="lg:col-span-7">
                {twoFactorProfile ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 border border-red-500/20 p-5 rounded-xl bg-[#1d1013]/30">
                    <h3 className="text-[9px] font-bold uppercase text-red-400 tracking-widest flex items-center gap-1.5 border-b border-red-500/15 pb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      MULTI-FACTOR EMAIL CHALLENGE REQUIRED
                    </h3>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-black/60 border border-[#2a2c35] rounded-lg">
                        <span className="text-[8px] text-[#A0A2B0] uppercase block mb-1">DISPATCHED SECURE DESTINATION:</span>
                        <span className="font-mono text-[9px] text-white block truncate uppercase tracking-wider font-bold">
                          {twoFactorProfile.email}
                        </span>
                        <p className="text-[8.5px] text-red-400/80 uppercase leading-relaxed mt-2">
                          A 6-digit cryptographic verification passkey has been transmitted to your email inbox. Please retrieve and input it below to authorize this session.
                        </p>
                      </div>

                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-red-400 font-bold block mb-1">
                          ENTER 6-DIGIT MULTI-FACTOR TOKEN
                        </label>
                        <input 
                          type="text" 
                          maxLength={6}
                          value={twoFactorOtpInput}
                          onChange={(e) => setTwoFactorOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 123456"
                          className="w-full bg-black border border-red-500/40 p-3 rounded font-mono text-center tracking-[0.5em] text-xs font-bold text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      {/* Helpful Dev Assist */}
                      <div className="p-2.5 bg-cyan/5 border border-cyan/20 rounded text-[8.5px] text-cyan uppercase tracking-wider">
                        <span className="font-bold block mb-0.5">MFA Dev-simulation logs:</span>
                        One-time security token broadcasted to system logs: <span className="font-bold underline text-white select-all">{twoFactorSentCode}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setTwoFactorProfile(null);
                          setTwoFactorSentCode("");
                        }}
                        className="w-1/3 py-3 border border-[#2a2c35] text-slate-400 hover:text-white uppercase tracking-widest text-[8px] rounded-lg cursor-pointer transition-all"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="submit"
                        className="w-2/3 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold uppercase tracking-widest text-[9px] rounded-lg cursor-pointer transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.25)] flex items-center justify-center gap-2"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        VERIFY &amp; LOGIN
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[7px] text-slate-500 uppercase tracking-widest border-t border-[#2a2c35]/50 pt-2.5">
                      <span>VERIFICATION SEQUENCE: ROT-13/AES</span>
                      <span>PORT: COHORT_SECURE_TUNNEL</span>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <h3 className="text-[9px] font-bold uppercase text-white tracking-widest flex items-center gap-1.5 border-b border-[#2a2c35] pb-1.5">
                      <Key className="w-3.5 h-3.5 text-cyan" />
                      DECRYPTION CONTROLLER
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-[#A0A2B0] block mb-1">
                          ADMIN_COORDINATE_EMAIL (OR USERNAME)
                        </label>
                        <input 
                          type="text" 
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="vankayalapatimallikharjunarao@gmail.com"
                          className="w-full bg-black border border-[#2a2c35] p-3 rounded font-mono text-[10px] text-white focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
                        />
                      </div>

                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-[#A0A2B0] block mb-1">
                          SECURE_CRYPTOGRAPHIC_PASSKEY
                        </label>
                        <input 
                          type="password" 
                          value={loginPasskey}
                          onChange={(e) => setLoginPasskey(e.target.value)}
                          placeholder="•••••••••••••••"
                          className="w-full bg-black border border-[#2a2c35] p-3 rounded font-mono text-[10px] text-white focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold uppercase tracking-widest text-[9px] rounded-lg cursor-pointer transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.25)] flex items-center justify-center gap-2"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        AUTHENTICATE TERMINAL SESSION
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[7px] text-slate-500 uppercase tracking-widest border-t border-[#2a2c35]/50 pt-2.5">
                      <span>SECURITY: AES-256</span>
                      <span>SESSION PORT: HTTPS_3000</span>
                    </div>
                  </form>
                )}
              </div>

            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL ACTIVE ADMIN OPERATING PANEL (LOGGED IN)
  // ----------------------------------------------------
  return (
    <div className="font-mono text-xs">
      
      {/* Dynamic Session Banner (Tops monitor) */}
      <div className="mb-6 p-4 bg-[#16171D]/40 border border-[#2a2c35] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan/10 border border-cyan/30 rounded flex items-center justify-center text-cyan">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-white uppercase tracking-tight">
              Logged in as: <span className="text-cyan">{activeAdmin.name}</span> · Admin
            </div>
          </div>
        </div>

        <div>
          <button 
            onClick={handleAdminLogout}
            className="px-3.5 py-1.5 border border-[#2a2c35] text-[#A0A2B0] text-[8px] font-bold uppercase tracking-widest hover:border-red-500 hover:text-red-400 cursor-pointer transition-all rounded"
          >
            End session
          </button>
        </div>
      </div>

      {/* Dashboard Sub Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-cyan pl-4">
        <div>
          <h1 className="font-serif text-xl md:text-2xl font-medium text-white leading-normal">
            Internal metrics
          </h1>
          <p className="font-mono text-[9px] text-[#A0A2B0] uppercase tracking-widest mt-0.5">
            Restricted Access // Cohort &amp; System Health Viewport
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#A0A2B0] uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-cyan" />
          <span>Telemetry Sync: {lastSyncTime}</span>
        </div>
      </header>

      {/* Tab Navigation Switcher */}
      <div className="flex bg-black p-1 border border-[#2a2c35] rounded-lg max-w-2xl mb-8">
        <button
          onClick={() => setAdminSubTab("overview")}
          className={`flex-grow py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded-md cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            adminSubTab === "overview"
              ? "bg-cyan text-black font-bold"
              : "text-[#A0A2B0] hover:text-white"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Metrics Overview
        </button>
        <button
          onClick={() => setAdminSubTab("alerts")}
          className={`flex-grow py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded-md cursor-pointer transition-all flex items-center justify-center gap-1.5 relative ${
            adminSubTab === "alerts"
              ? "bg-cyan text-black font-bold"
              : "text-[#A0A2B0] hover:text-white"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          Registration Alerts
          {(recentlyRegistered.length > 0 || waitlistStudents.length > 0) && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono text-[8px] px-1.5 py-0.5 rounded-full border border-black animate-pulse">
              {recentlyRegistered.length + waitlistStudents.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAdminSubTab("analytics")}
          className={`flex-grow py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded-md cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            adminSubTab === "analytics"
              ? "bg-cyan text-black font-bold"
              : "text-[#A0A2B0] hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Business Analytics
        </button>
        <button
          onClick={() => setAdminSubTab("curriculum")}
          className={`flex-grow py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded-md cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            adminSubTab === "curriculum"
              ? "bg-cyan text-black font-bold"
              : "text-[#A0A2B0] hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Curriculum Calendar
        </button>
      </div>

      {adminSubTab === "overview" ? (
        /* Bento Grid Layer */
        <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        
        {/* GOOGLE MEET GATEWAY PANEL (6 cols) */}
        <section className="col-span-12 lg:col-span-6 bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-[#2a2c35]/60 pb-3">
              <h3 className="text-[10px] font-bold uppercase text-[#A0A2B0] flex items-center gap-2 tracking-widest">
                <Video className="w-4 h-4 text-cyan" />
                GOOGLE MEET INTEGRATION GATEWAY
              </h3>
              <span className="text-[9px] text-cyan bg-cyan/10 px-2.5 py-0.5 border border-cyan/20 animate-pulse uppercase tracking-widest font-bold">
                ADMIN FALLBACK CONTROL
              </span>
            </div>

            {/* Live Google Meet Panel Integration */}
            <div className="mt-4 p-4 bg-cyan/5 border border-cyan/20 rounded-lg space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-cyan/10">
                <span className="text-[9px] font-bold text-cyan uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
                  GOOGLE MEET LIVE ROOM
                </span>
                <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                  Admin Control Panel
                </span>
              </div>

              {realMeetUrl ? (
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between text-[9px] font-mono gap-1">
                    <span className="text-[#A0A2B0]">CURRENT SPACE URI:</span>
                    <a 
                      href={realMeetUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-cyan font-bold hover:underline break-all"
                    >
                      {realMeetUrl} ↗
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={realMeetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-grow py-2 bg-cyan text-black font-bold text-center uppercase tracking-wider text-[9px] rounded hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      ENTER MEETING ROOM
                    </a>
                    <button
                      type="button"
                      onClick={handleGenerateMeet}
                      disabled={isGeneratingMeet}
                      className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-[#E58A3C]/10 hover:text-[#E58A3C] text-slate-300 font-bold uppercase tracking-wider text-[9px] rounded transition-all cursor-pointer"
                    >
                      {isGeneratingMeet ? "PROVISIONING..." : "RECREATE SPACE"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-[9px] text-slate-400 uppercase">
                    No active Google Meet has been generated for the students yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateMeet}
                    disabled={isGeneratingMeet}
                    className="w-full py-2 bg-cyan text-black font-bold uppercase tracking-widest text-[9px] rounded hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isGeneratingMeet ? (
                      <span className="animate-spin">⚡</span>
                    ) : (
                      <Video className="w-3.5 h-3.5" />
                    )}
                    GENERATE REAL GOOGLE MEET SPACE FOR COHORT
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* INTERACTIVE WAITLIST & SEAT ALLOCATION PORT (6 cols) */}
        <section className="col-span-12 lg:col-span-6 bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start border-b border-[#2a2c35]/60 pb-3">
              <h3 className="text-[10px] font-bold uppercase text-[#A0A2B0] flex items-center gap-2 tracking-widest">
                <Users className="w-4 h-4 text-cyan" />
                COHORT ADMISSION &amp; SEAT APPROVALS
              </h3>
              <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {waitlistStudents.length} WAITLIST QUEUED
              </span>
            </div>

            {/* Waitlist Rows */}
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
              {waitlistStudents.length === 0 ? (
                <div className="p-4 text-center bg-black/20 border border-[#2a2c35]/50 rounded-lg text-slate-500 uppercase font-bold text-[9px]">
                  ALL WAITLIST SEATS ASSIGNED // NO QUEUED APPLICANTS
                </div>
              ) : (
                waitlistStudents.map((s) => (
                  <div key={s.email} className="p-2 bg-[#0d0e14]/60 border border-[#2a2c35] rounded flex items-center justify-between text-[9px]">
                    <div>
                      <div className="font-bold text-white uppercase tracking-tight">{s.username}</div>
                      <div className="text-[8px] text-slate-500 uppercase tracking-wider leading-none mt-1">
                        {s.email} • {s.tier.toUpperCase()} TRACK • {s.timestamp}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleApproveWaitlist(s)}
                        className="p-1 px-2.5 bg-cyan text-black font-bold uppercase text-[8px] tracking-widest rounded hover:opacity-90 cursor-pointer flex items-center gap-1"
                        title="Approve to Cohort Seat"
                      >
                        <Check className="w-3 h-3" /> APPROVE
                      </button>
                      <button
                        onClick={() => handleDeclineWaitlist(s.email)}
                        className="p-1 px-2.5 bg-red-950/40 border border-red-500/20 text-red-400 font-bold uppercase text-[8px] tracking-widest rounded hover:bg-red-500 hover:text-black cursor-pointer"
                        title="Reject Seat Application"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Direct Admin Seat Assignment Form */}
            <div className="mt-4 pt-4 border-t border-[#2a2c35]/40">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest block mb-2 font-bold">MANUAL DIRECT SEAT RESERVATION OVERRIDE:</span>
              <form onSubmit={handleDirectAdmission} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <input 
                  type="text"
                  placeholder="Username"
                  value={newStudentUsername}
                  onChange={(e) => setNewStudentUsername(e.target.value)}
                  className="bg-black border border-[#2a2c35] p-2 rounded font-mono text-[9px] text-white focus:outline-none focus:border-cyan"
                />
                <input 
                  type="email"
                  placeholder="Email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="bg-black border border-[#2a2c35] p-2 rounded font-mono text-[9px] text-white focus:outline-none focus:border-cyan"
                />
                <select
                  value={newStudentTrack}
                  onChange={(e) => setNewStudentTrack(e.target.value)}
                  className="bg-black border border-[#2a2c35] p-1.5 rounded font-mono text-[9px] text-white focus:outline-none focus:border-cyan cursor-pointer"
                >
                  <option value="track-alpha">Track Alpha (SRE)</option>
                  <option value="track-beta">Track Beta (Swarm)</option>
                  <option value="track-gamma">Track Gamma (Routing)</option>
                </select>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan to-blue-500 hover:from-cyan hover:to-cyan text-black font-extrabold uppercase text-[8px] tracking-widest rounded cursor-pointer transition-colors"
                >
                  ADD STUDENT MANUALLY
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* Financial Revenue Engine (8 cols) */}
        <section className="col-span-12 lg:col-span-8 bg-[#16171D]/40 border border-[#2a2c35] p-6 flex flex-col rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#2a2c35]/60 pb-3">
            <h3 className="text-[10px] font-bold uppercase text-[#A0A2B0] flex items-center gap-2 tracking-widest">
              <DollarSign className="w-4 h-4 text-cyan" />
              Financial Revenue Engine
            </h3>
            <div className="flex items-center gap-1 bg-black p-1 border border-[#2a2c35] rounded-lg">
              <button className="px-3 py-1 text-[9px] uppercase text-black bg-cyan font-bold tracking-wider rounded">
                Daily Interval
              </button>
              <button 
                onClick={() => showNotification("Monthly intervals are compiled in production pipeline logs.")}
                className="px-3 py-1 text-[9px] uppercase text-[#A0A2B0] hover:text-white tracking-wider cursor-pointer"
              >
                Monthly Log
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="border-l-2 border-[#2a2c35] px-4 py-1">
              <div className="text-[9px] text-[#A0A2B0] uppercase tracking-wider">
                Gross Volume (USD)
              </div>
              <div className="text-lg font-bold text-white tracking-wide">
                ${financialMetrics.totalGrossUSD.toLocaleString()}
              </div>
            </div>
            <div className="border-l-2 border-[#2a2c35] px-4 py-1">
              <div className="text-[9px] text-[#A0A2B0] uppercase tracking-wider">
                Gross Volume (INR)
              </div>
              <div className="text-lg font-bold text-cyan tracking-wide">
                ₹{(financialMetrics.totalGrossINR / 10000000).toFixed(2)} Cr
              </div>
            </div>
            <div className="border-l-2 border-[#2a2c35] px-4 py-1">
              <div className="text-[9px] text-[#A0A2B0] uppercase tracking-wider">
                Average Ticket Size
              </div>
              <div className="text-lg font-bold text-white tracking-wide">
                ${financialMetrics.avgOrderValueUSD}.00
              </div>
            </div>
          </div>

          {/* Visual Bar Chart representation */}
          {financialMetrics.totalGrossUSD === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center h-52 border border-[#2a2c35]/40 text-[#A0A2B0] text-[9px] font-mono uppercase tracking-widest bg-black/20 rounded-lg p-4">
              <span className="text-cyan">No completed transactions registered</span>
              <span className="text-[8px] text-slate-500 mt-1">Live metrics populate automatically upon enrollment</span>
            </div>
          ) : (
            <>
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
                  const maxAmount = Math.max(...financialMetrics.chartData.map(b => b.amount)) || 1000;
                  const barHeight = Math.max(8, Math.min(95, (bar.amount / maxAmount) * 100));
                  return (
                    <div 
                      key={i} 
                      className="flex-grow flex flex-col justify-end group cursor-pointer relative"
                      style={{ height: "100%" }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cyan text-black text-[9px] font-bold px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 uppercase tracking-tighter rounded">
                        ${bar.amount.toLocaleString()}
                      </div>

                      <div 
                        className={`w-full transition-all duration-300 rounded-t-sm ${
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
              <div className="flex justify-between mt-3 text-[9px] text-[#A0A2B0] uppercase px-2 tracking-widest">
                {financialMetrics.chartData.map((bar, i) => (
                  <span key={i}>{bar.day[0]}</span>
                ))}
              </div>
            </>
          )}
        </section>

        {/* COHORT REGISTRATION SUMMARY (4 cols) */}
        <section className="col-span-12 lg:col-span-4 bg-[#16171D]/40 border border-[#2a2c35] p-6 flex flex-col justify-between rounded-xl">
          <div>
            <div className="flex justify-between items-start mb-6 border-b border-[#2a2c35]/60 pb-3">
              <h3 className="text-[10px] font-bold uppercase text-[#A0A2B0] flex items-center gap-2 tracking-widest">
                <Users className="w-4 h-4 text-cyan" />
                COHORT METRICS
              </h3>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-[#0d0e14]/60 border border-[#2a2c35] rounded-lg">
                <div className="text-[10px] uppercase text-[#A0A2B0] mb-1.5 tracking-wider font-bold">
                  ACTIVE COHORT SEATS TAKEN
                </div>
                <div className="text-4xl font-bold text-white tabular-nums flex items-baseline gap-1.5">
                  {webinarMetrics.activeRegistrations.toLocaleString()}
                  <span className="text-[9px] text-cyan uppercase tracking-wider">SEATS</span>
                </div>
                <div className="w-full bg-black h-1.5 mt-4 border border-[#2a2c35]/50 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan h-full transition-all duration-1000" 
                    style={{ width: `${webinarMetrics.capacityPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] mt-2 text-[#A0A2B0] uppercase tracking-widest">
                  <span>CAPACITY RANGE // CHOKE</span>
                  <span>{webinarMetrics.capacityPercentage}% LOADED</span>
                </div>
              </div>

              {/* Display list of recently registered/approved members */}
              <div className="p-4 bg-[#0d0e14]/60 border border-[#2a2c35] rounded-lg space-y-2.5">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-bold">RECENT LIVE MEMBERSHIPS ADMITTED:</span>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {recentlyRegistered.length === 0 ? (
                    <div className="text-[8px] text-slate-600 uppercase text-center py-4">NO TRANSACTIONS ASSIGNED DIRECTLY THIS SESSION</div>
                  ) : (
                    recentlyRegistered.map((student, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[9px] border-b border-[#2a2c35]/40 pb-1.5 last:border-0 last:pb-0">
                        <div>
                          <span className="text-white font-bold">{student.username}</span>
                          <span className="text-[7px] text-slate-500 block">{student.email}</span>
                        </div>
                        <span className="text-cyan text-[8px] font-bold uppercase">{student.tier}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2a2c35]/60">
            <button 
              onClick={handleExportCSV}
              className="w-full py-2.5 border border-[#2a2c35] text-[10px] uppercase hover:border-cyan hover:text-cyan transition-all flex justify-center items-center gap-2 tracking-widest cursor-pointer bg-[#0D0E12] rounded-lg"
            >
              Export Telemetry CSV
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Dynamic Free Masterclass Controller (col-span-12) */}
        <section className="col-span-12 bg-gradient-to-r from-[#16171D]/80 to-[#1e293b]/40 border border-cyan/30 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-cyan/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2a2c35] pb-4 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan animate-pulse" />
                FREE_MASTERCLASS_DYNAMIC_PRICING_CONTROL_PROTOCOL
              </h3>
              <p className="text-[9px] text-[#A0A2B0] uppercase tracking-widest mt-0.5">
                Configure real-time cohort price conversion drops and synchronize standard fallback timeouts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-mono uppercase">CURRENT_PROMO_STATE:</span>
              {masterclassActive ? (
                <span className="text-[9px] bg-red-500/10 text-red-400 px-3 py-1 border border-red-500/20 font-bold uppercase tracking-widest flex items-center gap-1.5 rounded animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  PROMO_ACTIVE_LIMIT_TIME
                </span>
              ) : (
                <span className="text-[9px] bg-slate-800 text-slate-400 px-3 py-1 border border-slate-700 font-bold uppercase tracking-widest rounded">
                  STANDARD_RATES_LOCK
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Config Info */}
            <div className="space-y-3 font-mono text-[10px] leading-relaxed text-[#A0A2B0]">
              <p className="text-white font-bold uppercase tracking-wider text-[11px]">Dynamic Conversion Logic:</p>
              <p>
                Conducting a Masterclass activates high-urgency conversion. Clicking <strong className="text-cyan">TRIGGER MASTERCLASS</strong> slashes seat investments to maximize immediate cohort signups.
              </p>
              <ul className="space-y-1.5 text-[9px] text-slate-400 border-l border-[#2a2c35] pl-3">
                <li>• <span className="text-white">Base Cohort:</span> ₹4,999 ($79) drops to <span className="text-cyan font-bold">₹3,999 ($59)</span></li>
                <li>• <span className="text-white">Premium Alpha:</span> ₹12,999 ($199) drops to <span className="text-cyan font-bold">₹9,999 ($149)</span></li>
                <li>• <span className="text-red-400 font-bold">Hard Reversion Lock:</span> After the timer expires, prices automatically reset. Students are warned: "You will not be able to get this promotional price again."</li>
              </ul>
            </div>

            {/* Column 2: Timer Sync Controls */}
            <div className="bg-[#0D0E12] border border-[#2a2c35] p-4 rounded-lg flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-1">PROMO_TIME_LIMIT_SETTING</span>
                <div className="flex gap-2">
                  {[300, 900, 1800, 3600].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setMasterclassTimeLeft(sec);
                        showNotification(`Timer set to ${sec / 60} minutes.`);
                      }}
                      disabled={masterclassActive}
                      className={`flex-1 py-1.5 border rounded text-[9px] uppercase font-bold tracking-tight transition-all cursor-pointer ${
                        masterclassTimeLeft === sec
                          ? "border-cyan text-cyan bg-cyan/5"
                          : "border-[#2a2c35] text-slate-500 hover:border-slate-700 hover:text-white"
                      } ${masterclassActive ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {sec / 60} Min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-1">TIMELINE_MONITOR</span>
                <div className="flex justify-between items-center bg-black/60 border border-[#2a2c35]/60 p-2.5 rounded font-mono text-white text-base font-bold tabular-nums">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 text-cyan ${masterclassActive ? "animate-spin" : ""}`} />
                    <span>COUNTDOWN:</span>
                  </div>
                  <span className={masterclassActive ? "text-red-400 animate-pulse" : "text-cyan"}>
                    {Math.floor(masterclassTimeLeft / 60) < 10 ? "0" : ""}{Math.floor(masterclassTimeLeft / 60)}:
                    {masterclassTimeLeft % 60 < 10 ? "0" : ""}{masterclassTimeLeft % 60}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Live Action Triggers */}
            <div className="flex flex-col justify-between gap-3 bg-[#0D0E12] border border-[#2a2c35] p-4 rounded-lg">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">TRIGGER_MECHANISM</span>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Manually initiate or immediately abort the masterclass session state. These state variables propagate globally to all public screens.
                </p>
              </div>

              <div className="space-y-2">
                {!masterclassActive ? (
                  <button
                    onClick={() => {
                      setMasterclassActive(true);
                      showNotification("MASTERCLASS TRIGGERED // Prices slashed globally. Timer engaged.");
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan to-blue-500 hover:opacity-95 text-black font-bold uppercase tracking-widest text-[9px] rounded shadow-lg shadow-cyan/15 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    TRIGGER MASTERCLASS PROMO
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMasterclassActive(false);
                      showNotification("PROMO TERMINATED // Standard pricing rates restored.");
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[9px] rounded cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    FORCE TERMINATE (REVERT RATES)
                  </button>
                )}

                <button
                  onClick={() => {
                    // Trigger simulated random seat registration!
                    const randomName = `student_${Math.floor(Math.random() * 900 + 100)}`;
                    const randomEmail = `${randomName}@gmail.com`;
                    
                    setWebinarMetrics(prev => {
                      const nextReg = prev.activeRegistrations + 1;
                      return {
                        ...prev,
                        activeRegistrations: nextReg,
                        capacityPercentage: Math.min(100, Math.round((nextReg / 3674) * 100))
                      };
                    });

                    const simStudent: EnrolledStudent = {
                      email: randomEmail,
                      username: randomName,
                      trackId: "track-alpha",
                      timestamp: getCurrentFormattedTime(),
                      tier: "standard"
                    };
                    setRecentlyRegistered(prev => [simStudent, ...prev]);

                    setFinancialMetrics(prev => {
                      const amount = 79; // masterclass base price
                      const updatedChart = [...prev.chartData];
                      if (updatedChart.length > 0) {
                        updatedChart[updatedChart.length - 1].amount += amount;
                      }
                      return {
                        ...prev,
                        totalGrossUSD: prev.totalGrossUSD + amount,
                        totalGrossINR: prev.totalGrossINR + (amount * 83),
                        chartData: updatedChart
                      };
                    });

                    const simLog: ComplaintLog = {
                      id: `PAY-${Math.floor(Math.random() * 9000 + 1000)}`,
                      studentEntity: { initials: randomName.substring(0,2).toUpperCase(), username: randomName },
                      issueDescription: `CONVERSION CONSOLIDATED // Masterclass promo signup registered: ${randomEmail}`,
                      severity: "LOW",
                      timestamp: getCurrentFormattedTime(),
                      status: "RESOLVED"
                    };
                    setComplaintLogs(prev => [simLog, ...prev]);

                    showNotification("SIMULATION ACTIVE // Simulated attendee cohort conversion logged.");
                  }}
                  disabled={!masterclassActive}
                  className="w-full py-2 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-[8px] uppercase tracking-wider rounded font-mono font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  SIMULATE ENROLLMENT SPIKE
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* STUDENT FEEDBACKS & REVIEWS BOARD (col-span-12) */}
        <section className="col-span-12 bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2a2c35]/60 pb-3">
            <div>
              <h3 className="text-[10px] font-bold uppercase text-[#A0A2B0] flex items-center gap-2 tracking-widest">
                <Star className="w-4 h-4 text-[#E58A3C]" />
                STUDENT FEEDBACK &amp; COHORT RATING REVIEWS
              </h3>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
                Real-time cohort quality evaluation stream and satisfaction indexes
              </p>
            </div>
            <div className="flex items-center gap-3 bg-black px-3 py-1 border border-[#2a2c35] rounded-lg">
              <span className="text-[9px] text-[#A0A2B0] uppercase tracking-wider font-mono">Average Rating:</span>
              <span className="text-xs font-bold text-[#E58A3C] tracking-wide font-mono">
                {(feedbacks.reduce((acc, f) => acc + f.rating, 0) / Math.max(1, feedbacks.length)).toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Star Rating Breakdown card */}
            <div className="bg-[#0d0e14]/60 border border-[#2a2c35]/60 p-4 rounded-lg flex flex-col justify-between space-y-3 font-mono">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-2">SATISFACTION INDEX BREAKDOWN</span>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = feedbacks.filter(f => f.rating === stars).length;
                    const pct = Math.round((count / Math.max(1, feedbacks.length)) * 100);
                    return (
                      <div key={stars} className="flex items-center justify-between gap-2 text-[8px] uppercase">
                        <span className="text-white w-10">{stars} STAR</span>
                        <div className="flex-grow bg-black h-2 border border-[#2a2c35]/40 rounded overflow-hidden">
                          <div className="bg-[#E58A3C] h-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[#A0A2B0] w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-[#2a2c35]/40 pt-2 text-[8px] text-slate-500 uppercase tracking-widest text-center font-mono">
                Total Submissions Recorded: {feedbacks.length}
              </div>
            </div>

            {/* Scrollable list of comments */}
            <div className="md:col-span-2 bg-[#0d0e14]/30 border border-[#2a2c35]/40 rounded-lg p-4 font-mono">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-3">SUBMITTED FEEDBACK RECORD:</span>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {feedbacks.length === 0 ? (
                  <div className="text-slate-600 uppercase text-center py-12 text-[10px] tracking-widest">
                    NO STUDENT FEEDBACK SUBMITTED YET
                  </div>
                ) : (
                  feedbacks.map((f) => (
                    <div key={f.id} className="p-3 bg-[#16171D]/60 border border-[#2a2c35]/60 rounded-lg flex flex-col space-y-1.5 hover:border-[#E58A3C]/40 transition-all">
                      <div className="flex items-center justify-between text-[8px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold">{f.username}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-500">{f.timestamp}</span>
                        </div>
                        <div className="flex gap-0.5 text-[#E58A3C]">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3 h-3 ${idx < f.rating ? "fill-[#E58A3C] text-[#E58A3C]" : "text-slate-700"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] text-[#A0A2B0] normal-case leading-relaxed font-sans pl-2 border-l border-[#E58A3C]/40">
                        "{f.comment || "Rated without comment."}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Satisfaction & Complaint Logs Table (12 cols) */}
        <section className="col-span-12 bg-[#16171D]/40 border border-[#2a2c35] overflow-hidden rounded-xl">
          <div className="p-6 border-b border-[#2a2c35] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0d0e14]/50">
            <div>
              <h3 className="text-[10px] font-bold uppercase text-[#A0A2B0] flex items-center gap-2 tracking-widest">
                <Sliders className="w-4 h-4 text-cyan" />
                SYSTEM AUDIT &amp; USER LOGS TELEMETRY
              </h3>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1">
                Real-time synchronized event logs with active operator session tracking
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-black p-1 border border-[#2a2c35] rounded-lg">
              {(["ALL", "SECURITY", "STUDENT", "WAITLIST"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-3 py-1 text-[8px] uppercase font-bold tracking-wider rounded cursor-pointer transition-all ${
                    logFilter === filter 
                      ? "text-black bg-cyan" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
              <button 
                onClick={handleResetSystemTelemetry}
                className="px-2 py-1 text-[8px] uppercase text-red-400 hover:text-red-300 tracking-wider flex items-center gap-1 border-l border-[#2a2c35] ml-1.5"
                title="Reset system log coordinates"
              >
                <RefreshCw className="w-2.5 h-2.5" /> RESET
              </button>
            </div>
          </div>

          {/* Real-time search query input */}
          <div className="px-6 py-3 border-b border-[#2a2c35]/50 bg-black/20 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text"
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              placeholder="Filter logs by student username, issue description, or log coordinate in real-time..."
              className="flex-grow bg-transparent border-0 text-[10px] text-cyan placeholder-slate-600 focus:outline-none focus:ring-0 font-mono"
            />
            {logSearchQuery && (
              <button 
                onClick={() => setLogSearchQuery("")}
                className="text-[9px] text-slate-500 hover:text-white uppercase tracking-widest font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1C1E26] border-b border-[#2a2c35] text-[#A0A2B0] uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold text-[9px]">Log Coordinate</th>
                  <th className="px-6 py-4 font-bold text-[9px]">User/System Entity</th>
                  <th className="px-6 py-4 font-bold text-[9px]">Parameters Incurred</th>
                  <th className="px-6 py-4 font-bold text-[9px]">Severity</th>
                  <th className="px-6 py-4 font-bold text-[9px]">Timestamp (UTC)</th>
                  <th className="px-6 py-4 font-bold text-[9px] text-right">Diagnostic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2c35]/50">
                {getFilteredLogs().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 uppercase tracking-widest text-[10px]">
                      No open issues
                    </td>
                  </tr>
                ) : (
                  getFilteredLogs().map((log) => (
                    <tr key={log.id} className="hover:bg-[#1a1b21]/30 transition-all">
                      <td className="px-6 py-4 text-cyan font-bold text-[9px]">#{log.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 border flex items-center justify-center text-[8px] font-bold rounded ${
                            log.studentEntity.username.includes("ADMIN") 
                              ? "bg-red-500/10 border-red-500/40 text-red-400" 
                              : "bg-black border-[#2a2c35] text-white"
                          }`}>
                            {log.studentEntity.initials}
                          </div>
                          <span className={`text-[9px] tracking-tighter ${log.studentEntity.username.includes("ADMIN") ? "text-red-400 font-bold" : "text-white"}`}>
                            {log.studentEntity.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#A0A2B0] max-w-xs truncate uppercase font-mono text-[9px]">
                        {log.issueDescription}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border rounded ${
                          log.severity === "HIGH" 
                            ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.05)]" 
                            : log.severity === "MEDIUM" 
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" 
                            : "bg-cyan/10 text-cyan border-cyan/20"
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#A0A2B0] text-[9px] font-mono whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleLogStatus(log.id)}
                          className={`px-3 py-1 text-[8px] font-bold uppercase border transition-all cursor-pointer rounded ${
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-[#2a2c35] flex justify-between items-center bg-[#0d0e14]/30 text-[9px]">
            <span className="text-[#A0A2B0] uppercase tracking-widest">
              ACTIVE CRYPTO LOG-STREAM BOUND // SHARDS VALIDATED
            </span>
            <div className="flex gap-1.5 text-[#A0A2B0] uppercase tracking-widest">
              <span>Records compiled: {getFilteredLogs().length}</span>
            </div>
          </div>
        </section>
      </div>
      ) : adminSubTab === "alerts" ? (
        <div className="space-y-6">
          {/* Real-time Alerts Subpanel */}
          <section className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2a2c35]/60 pb-5 mb-6 relative">
              <div>
                <h3 className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  REAL-TIME REGISTRATION ALERTS FEED
                </h3>
                <p className="text-[9px] text-[#A0A2B0] uppercase tracking-wider mt-1">
                  Active monitoring stream of landing page checkouts and waitlist submissions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase text-[#A0A2B0] font-mono tracking-widest">Scope Cohort:</span>
                <select
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(e.target.value)}
                  className="bg-black/60 border border-[#2a2c35] text-[9px] text-cyan px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan font-mono uppercase cursor-pointer"
                >
                  <option value="ALL">ALL COHORTS</option>
                  {cohortsList.map(cohort => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name || cohort.id} ({cohort.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Stats Header Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 bg-black/40 border border-[#2a2c35] rounded-lg">
                <span className="text-[8px] text-slate-500 uppercase block mb-0.5">CURRENT COHORT CAPACITY:</span>
                <span className="font-mono text-base font-bold text-white block">
                  {webinarMetrics.activeRegistrations.toLocaleString()} / 3,674 SEATS
                </span>
                <div className="w-full bg-black h-1 mt-2.5 border border-[#2a2c35]/40 rounded-full overflow-hidden">
                  <div className="bg-cyan h-full transition-all duration-1000" style={{ width: `${webinarMetrics.capacityPercentage}%` }} />
                </div>
              </div>

              <div className="p-3.5 bg-black/40 border border-[#2a2c35] rounded-lg">
                <span className="text-[8px] text-slate-500 uppercase block mb-0.5">PENDING WAITLIST APPLICATIONS:</span>
                <span className="font-mono text-base font-bold text-cyan block">
                  {waitlistStudents.length} STUDENT RECORDS
                </span>
                <span className="text-[7.5px] text-cyan/70 uppercase block mt-2.5">
                  WAITING OPERATOR CONVERSION COMMANDS
                </span>
              </div>

              <div className="p-3.5 bg-black/40 border border-[#2a2c35] rounded-lg">
                <span className="text-[8px] text-slate-500 uppercase block mb-0.5">TOTAL GROSS REVENUE DIRECT:</span>
                <span className="font-mono text-base font-bold text-green-400 block">
                  ₹{(financialMetrics.totalGrossINR / 10000000).toFixed(4)} Cr
                </span>
                <span className="text-[7.5px] text-slate-400 uppercase block mt-2.5">
                  (${financialMetrics.totalGrossUSD.toLocaleString()} USD NET INTEGRATION)
                </span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/60 p-4 border border-[#2a2c35] rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase text-slate-500">Filter Feed:</span>
                <div className="flex gap-1 bg-[#16171D] p-1 border border-[#2a2c35] rounded-lg">
                  {["ALL", "ENROLLMENT", "WAITLIST"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAlertFeedFilter(type as any)}
                      className={`px-3 py-1.5 text-[8.5px] uppercase font-bold tracking-wider rounded cursor-pointer transition-all ${
                        alertFeedFilter === type 
                          ? "bg-cyan text-black" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {type === "ALL" ? "ALL ALERTS" : type === "ENROLLMENT" ? "ENROLLED SEATS" : "WAITLIST SEATS"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-black border border-[#2a2c35] px-3.5 py-1.5 rounded-lg w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="text"
                  value={alertSearchQuery}
                  onChange={(e) => setAlertSearchQuery(e.target.value)}
                  placeholder="Search alert usernames/emails..."
                  className="bg-transparent border-0 text-[10px] text-cyan placeholder-slate-600 focus:outline-none focus:ring-0 font-mono w-full"
                />
                {alertSearchQuery && (
                  <button onClick={() => setAlertSearchQuery("")} className="text-[8px] text-slate-500 hover:text-white uppercase font-bold">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Chronological Alert Logs Stream */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {getFilteredAlerts().length === 0 ? (
                <div className="py-16 text-center border border-dashed border-[#2a2c35] rounded-xl text-slate-500 uppercase tracking-widest text-[10px]">
                  No active registration alerts match the selected filter parameters.
                </div>
              ) : (
                getFilteredAlerts().map((alert, idx) => {
                  const isEnroll = alert.type === "ENROLLMENT";
                  const trackName = webinarTracks.find(t => t.id === alert.trackId)?.name || alert.trackId;
                  
                  return (
                    <div 
                      key={alert.email + alert.type + idx}
                      className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                        isEnroll 
                          ? "bg-[#101c18]/30 border-green-500/20 hover:border-green-500/40" 
                          : "bg-[#1c1810]/30 border-yellow-500/20 hover:border-yellow-500/40"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                          isEnroll 
                            ? "bg-green-500/10 border-green-500/30 text-green-400" 
                            : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                        }`}>
                          {isEnroll ? <UserCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">
                              {alert.username}
                            </span>
                            <span className="text-[8px] text-slate-600">•</span>
                            <span className="text-[9px] text-slate-400">
                              {alert.email}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[8.5px] text-slate-500 uppercase tracking-wider font-mono">
                            <span>Track Selection: <strong className="text-white font-bold">{trackName}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              Selected Tier: 
                              {alert.tier === "premium" ? (
                                <strong className="text-cyan font-bold flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-cyan text-cyan" />
                                  Premium Alpha
                                </strong>
                              ) : (
                                <strong className="text-slate-300 font-bold">Base Cohort</strong>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Hand Side Info & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[#2a2c35]/40 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[8px] text-slate-500 block uppercase">FUNDS REALIZED:</span>
                          <span className={`font-mono text-[10px] font-bold block ${isEnroll ? "text-green-400" : "text-yellow-400"}`}>
                            {isEnroll 
                              ? (alert.tier === "premium" ? "₹14,999 / $299 PAID" : "₹4,999 / $99 PAID") 
                              : "₹0 (WAITLIST APPLICATION)"}
                          </span>
                          <span className="text-[8px] text-slate-600 block mt-0.5 uppercase">
                            Timestamp: {alert.timestamp}
                          </span>
                        </div>

                        <div>
                          {isEnroll ? (
                            <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[8.5px] font-bold uppercase tracking-widest rounded flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Enrolled
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleApproveWaitlist(alert)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 text-white font-mono text-[8.5px] font-bold uppercase tracking-widest rounded cursor-pointer transition-all border border-yellow-500/20"
                              >
                                APPROVE SEAT
                              </button>
                              <button
                                onClick={() => handleDeclineWaitlist(alert.email)}
                                className="p-1.5 border border-[#2a2c35] text-slate-500 hover:text-red-400 hover:border-red-500/30 rounded cursor-pointer transition-all"
                                title="Decline application coordinate"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      ) : adminSubTab === "analytics" ? (
        <BusinessAnalyticsPanel 
          cohortsList={cohortsList}
          recentlyRegistered={recentlyRegistered}
          waitlistStudents={waitlistStudents}
          complaintLogs={complaintLogs}
        />
      ) : (
        <AdminCurriculumCalendar sessionToken={sessionToken} showNotification={showNotification} />
      )}
    </div>
  );
}
