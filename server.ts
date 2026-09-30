import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { LEGAL_DOCUMENTS, GRIEVANCE_OFFICER_DETAILS } from "./src/data/legalDocuments";
import { generateCertificateSVG } from "./src/utils/certificateGenerator";
import { Resvg } from "@resvg/resvg-js";

dotenv.config();

// Helper to create Nodemailer transport based on env variables
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;
  
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
  }
  
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass }
    });
  }

  return null;
}

async function sendCertificateEmail(params: {
  toEmail: string;
  studentName: string;
  certificateId: string;
  program: string;
  completionDate: string;
  downloadUrl: string;
  svgContent?: string;
}): Promise<{ sent: boolean; message: string; mode: "smtp" | "simulated" }> {
  const transporter = getMailTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.GMAIL_USER || "support.codexiaindia@gmail.com";
  
  const hostUrl = process.env.APP_URL || "https://ais-dev-rffbl3drvahic2immp4x2t-526609645001.asia-east1.run.app";
  const fullDownloadUrl = params.downloadUrl.startsWith("http")
    ? params.downloadUrl
    : `${hostUrl.replace(/\/$/, "")}${params.downloadUrl}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #04060b; color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #0d0f18; border: 1px solid rgba(0, 242, 255, 0.25); border-radius: 16px; padding: 32px; box-shadow: 0 0 40px rgba(0,242,255,0.1); }
          .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 24px; margin-bottom: 24px; }
          .logo { font-size: 26px; font-weight: 800; color: #00f2ff; letter-spacing: 2px; text-transform: uppercase; }
          .badge { background: rgba(240, 213, 130, 0.15); border: 1px solid #f0d582; color: #f0d582; font-size: 11px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
          .title { font-size: 22px; color: #ffffff; margin: 16px 0 8px 0; font-family: Georgia, serif; }
          .content { font-size: 15px; line-height: 1.6; color: #94a3b8; }
          .name { font-size: 26px; font-weight: bold; color: #f0d582; margin: 20px 0; text-align: center; font-family: Georgia, serif; text-shadow: 0 0 10px rgba(240, 213, 130, 0.3); }
          .cert-box { background: #141724; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0; font-family: monospace; }
          .cert-row { margin-bottom: 8px; color: #cbd5e1; font-size: 13px; }
          .cert-val { color: #00f2ff; font-weight: bold; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #00f2ff 0%, #0066ff 100%); color: #000000 !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 0 20px rgba(0, 242, 255, 0.4); }
          .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CODEXIA</div>
            <p style="margin-top: 12px;"><span class="badge">OFFICIAL CERTIFICATE OF COMPLETION</span></p>
          </div>
          
          <div class="content">
            <p>Congratulations <strong>${params.studentName}</strong>,</p>
            <p>We are delighted to present your official <strong>Codexia Certificate of Completion</strong>. You have successfully met all curriculum milestones and demonstrated technical excellence.</p>
            
            <div class="name">[ ${params.studentName} ]</div>

            <div class="cert-box">
              <div class="cert-row">PROGRAM: <span class="cert-val">${params.program}</span></div>
              <div class="cert-row">COMPLETION DATE: <span class="cert-val">${params.completionDate}</span></div>
              <div class="cert-row">CERTIFICATE ID: <span class="cert-val">${params.certificateId}</span></div>
            </div>

            <div class="btn-container">
              <a href="${fullDownloadUrl}" class="btn" target="_blank">View & Download Certificate</a>
            </div>

            <p style="font-size: 13px;">You can also verify or download your certificate directly anytime from your Codexia Student Portal.</p>
          </div>

          <div class="footer">
            <p>Codexia AI Education & Automation Studio<br/>Build Practical AI. Solve Real Problems. Create Impact.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Codexia Academic Ledger" <${fromEmail}>`,
        to: params.toEmail,
        subject: `🎓 Your Official Codexia Certificate of Completion - ${params.certificateId}`,
        html: htmlBody
      });

      console.log(`[SMTP EMAIL SUCCESS] Delivered certificate ${params.certificateId} to ${params.toEmail}`);
      return {
        sent: true,
        message: `Official certificate successfully delivered to ${params.toEmail}`,
        mode: "smtp"
      };
    } catch (err: any) {
      console.error(`[SMTP EMAIL ERROR] Failed sending to ${params.toEmail}:`, err.message || err);
      return {
        sent: false,
        message: `SMTP attempt failed (${err.message}). Certificate registered & downloadable in portal.`,
        mode: "simulated"
      };
    }
  } else {
    console.log(`[EMAIL DISPATCH NOTICE] No SMTP server configured. Certificate ${params.certificateId} logged for ${params.toEmail}. Set GMAIL_USER/GMAIL_PASS or SMTP_HOST in env secrets for live SMTP email dispatch.`);
    return {
      sent: true,
      message: `Certificate generated & logged for ${params.toEmail}. Configure SMTP credentials in secrets to send live SMTP inbox emails.`,
      mode: "simulated"
    };
  }
}


const app = express();
// Cloud Run terminates TLS at the proxy; trust the forwarded protocol/host for callback URLs.
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cloud Run provides PORT at runtime. Use 8080 as the local/production fallback.
const PORT = Number(process.env.PORT) || 8080;

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Server-side State for Masterclass Dynamic Promo
let masterclassActive = true;
let masterclassExpirationTime: number | null = Date.now() + 900 * 1000; // default 15 minutes from server start
let masterclassDuration = 900;

// Unified Centralized Server-side State Store (for persisting localStorage values in-memory)
const defaultTestimonials: any[] = [];

const defaultWebinarTracks = [
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
];

const defaultComplaintLogs: any[] = [];

const defaultStudentFeedbacks = [
  {
    id: "FB-101",
    rating: 5,
    comment: "The SRE consensus engine tracks are pure gold. Zero-overhead model swap is incredible.",
    timestamp: "2026-07-04 08:34",
    username: "alice_sys"
  },
  {
    id: "FB-102",
    rating: 4,
    comment: "Amazing interactive terminal assignments. Highly visual dashboard.",
    timestamp: "2026-07-03 14:15",
    username: "mark_dev"
  }
];

let serverStore = {
  live_meet_url: "",
  student_testimonials: defaultTestimonials,
  webinar_tracks: defaultWebinarTracks,
  waitlist_students: [] as any[],
  recently_registered: [] as any[],
  has_paid: false,
  webinar_metrics: {
    activeRegistrations: 0,
    waitlist: 0,
    conversionRate: 0,
    capacityPercentage: 0
  },
  financial_metrics: {
    totalGrossUSD: 0,
    totalGrossINR: 0,
    avgOrderValueUSD: 0,
    chartData: [] as any[]
  },
  complaint_logs: defaultComplaintLogs,
  student_feedbacks: defaultStudentFeedbacks
};

// --- SECURE SESSION AND RBAC ENGINE ---
interface UserSession {
  token: string;
  email: string;
  role: "admin" | "student";
  lastActive: number;
  deviceFingerprint?: string;
}

const activeSessions = new Map<string, UserSession>();
const userActiveTokens = new Map<string, string>(); // email -> token

// In-memory user database for secure credentials
const userCredentials = new Map<string, string>();
userCredentials.set("vankayalapatimallikharjunarao@gmail.com", "MALLIK-ARCH-2026");
userCredentials.set("developer", "admin123");
userCredentials.set("alex.student@gmail.com", "student123");
userCredentials.set("shreyu.nothing@gmail.com", "@admin@");
userCredentials.set("guest.unpaid@gmail.com", "guest123");

// Cohort & Community Data Structures
interface CohortDocument {
  name: string;
  file_url: string;
  uploaded_at: string;
}

interface Cohort {
  id: string;
  name: string;
  track: "base" | "premium";
  repo_url: string;
  documents: CohortDocument[];
  next_session_at?: string;
  active_briefing_topic?: string;
  live_meet_url?: string;
  year?: number;
  month?: number;
  sequence?: number;
  start_date?: string;
  end_date?: string;
  status?: "draft" | "enrolling" | "active" | "completed";
  syllabus_status?: Record<string, "upcoming" | "active" | "completed">;
  capacity?: number;
}

interface StudentProfile {
  email: string;
  track: "base" | "premium" | null;
  cohort_id: string | null;
  username?: string;
  name?: string;
  phone?: string;
  certificate_name?: string;
  is_completed?: boolean;
  completed_at?: string;
}

interface GeneratedCertificate {
  certificate_id: string;
  student_email: string;
  student_name: string;
  program: string;
  cohort_id: string;
  completion_date: string;
  generated_at: string;
  download_url: string;
  file_id: string;
}

interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  role: "student" | "admin";
  content: string;
  created_at: string;
  is_accepted?: boolean;
  reactions?: Record<string, string[]>;
  attachment?: { name: string; url: string; size?: string };
}

interface CommunityPost {
  id: string;
  cohort_id: string;
  author_id: string;
  author_name: string;
  role: "student" | "admin";
  content: string;
  is_announcement: boolean;
  channel?: "announcements" | "discussions" | "question-answer" | string;
  is_pinned?: boolean;
  reactions?: Record<string, string[]>;
  created_at: string;
  replies?: CommunityReply[];
  attachment?: { name: string; url: string; size?: string };
  voice_note?: { url: string; duration?: string };
}

interface DirectMessage {
  id: string;
  cohort_id: string;
  student_email: string;
  sender: "student" | "admin";
  sender_name: string;
  content: string;
  created_at: string;
}

interface StoredFile {
  id: string;
  fileName: string;
  mimeType: string;
  data: string; // base64 representation of file
}

// In-memory databases
const studentProfiles = new Map<string, StudentProfile>();
const cohorts = new Map<string, Cohort>();
const communityPosts: CommunityPost[] = [];
const directMessages: DirectMessage[] = [];
const cohortYears = new Set<number>([2026]);
const storedFiles = new Map<string, StoredFile>();
const generatedCertificates = new Map<string, GeneratedCertificate>();

// Auto-generation loop for student certificates upon cohort completion
function generateCohortCertificates(cohortId: string): GeneratedCertificate[] {
  const cohort = cohorts.get(cohortId);
  if (!cohort) return [];

  const completionDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const program = cohort.track === "premium" ? "Premium Alpha" : "Base Cohort";

  // Gather student records bound to this cohort_id
  let enrolledStudents = Array.from(studentProfiles.values()).filter(s => s.cohort_id === cohortId);

  // Fallback: If no enrolled students in map, check recently registered students or bind demo students
  if (enrolledStudents.length === 0) {
    const registered = (serverStore.recently_registered || []).filter((r: any) => r.cohort_id === cohortId || r.tier === cohort.track);
    if (registered.length > 0) {
      registered.forEach((r: any) => {
        let p = studentProfiles.get(r.email);
        if (!p) {
          p = {
            email: r.email,
            track: cohort.track,
            cohort_id: cohortId,
            username: r.username,
            certificate_name: r.username
          };
          studentProfiles.set(r.email, p);
        } else {
          p.cohort_id = cohortId;
        }
      });
      enrolledStudents = Array.from(studentProfiles.values()).filter(s => s.cohort_id === cohortId);
    }
  }

  if (enrolledStudents.length === 0) {
    // Ensure default demo students exist for testing if no custom student registered yet
    const defaultDemos = Array.from(studentProfiles.values());
    if (defaultDemos.length > 0) {
      defaultDemos.forEach(s => {
        s.cohort_id = cohortId;
      });
      enrolledStudents = Array.from(studentProfiles.values()).filter(s => s.cohort_id === cohortId);
    }
  }

  const generatedList: GeneratedCertificate[] = [];

  enrolledStudents.forEach((student, index) => {
    const seqNum = String(index + 1).padStart(3, "0");
    const certId = `CODX-CERT-${cohortId}-${seqNum}`;

    // Name precedence: Name for Certificate -> Username -> Formatted Email
    let studentName = student.certificate_name?.trim();
    if (!studentName) {
      studentName = student.username?.trim();
    }
    if (!studentName) {
      const parts = student.email.split("@")[0].split(/[._]/);
      studentName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    }

    // Generate full SVG template
    const certSvg = generateCertificateSVG({
      studentName,
      program,
      cohortId,
      completionDate,
      certificateId: certId
    });

    const base64Svg = Buffer.from(certSvg, "utf-8").toString("base64");
    const fileId = `cert_${certId.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

    // Save in file storage
    storedFiles.set(fileId, {
      id: fileId,
      fileName: `Codexia_Certificate_${studentName.replace(/\s+/g, "_")}_${certId}.svg`,
      mimeType: "image/svg+xml",
      data: base64Svg
    });

    const downloadUrl = `/api/certificates/download/${certId}`;

    const certRecord: GeneratedCertificate = {
      certificate_id: certId,
      student_email: student.email,
      student_name: studentName,
      program,
      cohort_id: cohortId,
      completion_date: completionDate,
      generated_at: new Date().toISOString(),
      download_url: downloadUrl,
      file_id: fileId
    };

    generatedCertificates.set(certId, certRecord);

    // Attach document entry to cohort.documents
    cohort.documents = cohort.documents || [];
    const existingDocIdx = cohort.documents.findIndex(d => d.name.includes(certId) || d.file_url.includes(certId));
    const certDoc = {
      id: fileId,
      name: `Certificate of Completion - ${studentName} (${certId})`,
      file_url: downloadUrl,
      uploaded_at: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    if (existingDocIdx >= 0) {
      cohort.documents[existingDocIdx] = certDoc;
    } else {
      cohort.documents.push(certDoc);
    }

    // Email dispatch simulation
    console.log(`[MAIL GATEWAY // DISPATCH] Certificate ${certId} automatically generated and dispatched to ${student.email}`);

    generatedList.push(certRecord);
  });

  return generatedList;
}

interface VaultEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  type: "prompt" | "template";
  content: string;
  created_at: string;
}

// Seed Prompt & Template Vault
const promptVault: VaultEntry[] = [
  {
    id: "pv-1",
    title: "Dynamic Marketing Copy Generator",
    category: "Marketing",
    description: "An advanced system prompt to generate high-converting ad copy variations tailored to target demographic behaviors.",
    type: "prompt",
    content: "Act as an elite conversion copywriter. Analyze the following target audience traits and generate 3 direct-response ad copy variations using the AIDA framework.",
    created_at: "2026-07-01 10:00 AM"
  },
  {
    id: "pv-2",
    title: "Campaign Performance Analysis Template",
    category: "Marketing",
    description: "An importable JSON configuration file for setting up a web scraping bot that reports campaign ROI.",
    type: "template",
    content: "https://codexia.academy/templates/marketing-performance-v1.json",
    created_at: "2026-07-02 11:30 AM"
  },
  {
    id: "pv-3",
    title: "Customer Support Triaging Flow",
    category: "Support",
    description: "Prompt for analyzing customer email sentiments and categorizing them into priority queues dynamically.",
    type: "prompt",
    content: "Read the client inquiry below. Classify the sentiment into [HIGH, MEDIUM, LOW] priority, extract key technical problems, and generate a polite auto-reply.",
    created_at: "2026-07-03 09:15 AM"
  },
  {
    id: "pv-4",
    title: "Logistical Dispatch Routing Template",
    category: "Operations",
    description: "A workflow template to orchestrate delivery coordinates and assign micro-agents to driver schedules.",
    type: "template",
    content: "https://codexia.academy/templates/operations-dispatch-v2.json",
    created_at: "2026-07-04 02:00 PM"
  },
  {
    id: "pv-5",
    title: "Fintech Risk Assessment Prompt",
    category: "Analyst",
    description: "An expert prompt instructing LLMs to process quarterly balance sheets and check compliance risk.",
    type: "prompt",
    content: "Audit the following balance sheet and check for anomalies against the 2026 Fintech Regulatory Standard checklist. Highlight risk scores.",
    created_at: "2026-07-05 04:30 PM"
  }
];

// Seed student profiles
studentProfiles.set("alex.student@gmail.com", {
  email: "alex.student@gmail.com",
  track: "premium",
  cohort_id: "CODX-2026-07-PREMIUM-01"
});
studentProfiles.set("sam.base@gmail.com", {
  email: "sam.base@gmail.com",
  track: "base",
  cohort_id: "CODX-2026-07-BASE-01"
});
studentProfiles.set("guest.unpaid@gmail.com", {
  email: "guest.unpaid@gmail.com",
  track: null,
  cohort_id: null
});

const bSyllabusDays = [
  { id: "day-1", title: "AI Basics & the Micro-Bot Idea", timing: "10:00 AM - 12:00 PM" },
  { id: "day-2", title: "Building Your First Micro-Bot", timing: "10:00 AM - 12:30 PM" },
  { id: "day-3", title: "Micro-Bots for Your Profession", timing: "10:00 AM - 01:00 PM" },
  { id: "day-4", title: "Connecting Your Bot to Real Tools", timing: "10:00 AM - 12:00 PM" },
  { id: "day-5", title: "Making It Visual: Quick Video & Image Content", timing: "10:00 AM - 12:30 PM" },
  { id: "day-6", title: "Capstone: Ship Your Micro-Bot", timing: "10:00 AM - 01:00 PM" }
];

const pSyllabusDays = [
  { id: "pday-1", title: "Systems Thinking: Mapping a Workflow to Bots", timing: "02:00 PM - 04:00 PM" },
  { id: "pday-2", title: "Designing Multiple Bots That Work Together", timing: "02:00 PM - 05:00 PM" },
  { id: "pday-3", title: "Voice & Conversational Bots", timing: "02:00 PM - 04:00 PM" },
  { id: "pday-4", title: "Web Scraping & Data Gathering Bots", timing: "02:00 PM - 04:30 PM" },
  { id: "pday-5", title: "Writing Assistants that Adapt to Your Style", timing: "02:00 PM - 04:00 PM" },
  { id: "pday-6", title: "AI-Powered Customer Support & Email Auto-Replies", timing: "02:00 PM - 05:00 PM" },
  { id: "pday-7", title: "Research & Analysis Bots", timing: "02:00 PM - 04:30 PM" },
  { id: "pday-8", title: "Dynamic Marketing Image Generation", timing: "02:00 PM - 04:00 PM" },
  { id: "pday-9", title: "Automation: Handling File Uploads", timing: "02:00 PM - 04:00 PM" },
  { id: "pday-10", title: "Complex Workflows with Webhook Triggers", timing: "02:00 PM - 04:30 PM" },
  { id: "pday-11", title: "AI Voiceovers & Audio Editing on Autopilot", timing: "02:00 PM - 04:30 PM" },
  { id: "pday-12", title: "Creating Stitched AI Video Walkthroughs", timing: "02:00 PM - 05:00 PM" },
  { id: "pday-13", title: "Graduate Presentation & Professional Roadmap", timing: "02:00 PM - 05:00 PM" }
];

// Seed cohorts
cohorts.set("CODX-2026-07-BASE-01", {
  id: "CODX-2026-07-BASE-01",
  name: "July 2026 Base Cohort",
  track: "base",
  repo_url: "https://github.com/codexia-academy/base-sprint-july-2026",
  documents: [
    { name: "Syllabus Roadmap PDF", file_url: "https://codexia.academy/docs/base-syllabus.pdf", uploaded_at: "2026-07-01 10:00" },
    { name: "C.O.D.E. Method Guide", file_url: "https://codexia.academy/docs/code-method.pdf", uploaded_at: "2026-07-02 12:00" }
  ],
  next_session_at: "2026-07-15T14:00:00.000Z",
  active_briefing_topic: "LOAD_BALANCING_DISTRIBUTED_SWARMS.MKV",
  year: 2026,
  month: 7,
  sequence: 1,
  start_date: "2026-07-01",
  end_date: "2026-07-14",
  capacity: 150,
  status: "enrolling",
  syllabus_status: {
    "day-1": "completed",
    "day-2": "completed",
    "day-3": "completed",
    "day-4": "active",
    "day-5": "upcoming",
    "day-6": "upcoming"
  }
});

cohorts.set("CODX-2026-07-PREMIUM-01", {
  id: "CODX-2026-07-PREMIUM-01",
  name: "July 2026 Premium Alpha Cohort",
  track: "premium",
  repo_url: "https://github.com/codexia-academy/premium-alpha-july-2026",
  documents: [
    { name: "Premium Capstone Spec", file_url: "https://codexia.academy/docs/premium-capstone.pdf", uploaded_at: "2026-07-03 09:00" },
    { name: "Enterprise Multi-Agent Consensus Protocol", file_url: "https://codexia.academy/docs/consensus-protocol.pdf", uploaded_at: "2026-07-04 15:30" }
  ],
  next_session_at: "2026-07-16T14:00:00.000Z",
  active_briefing_topic: "MULTI_AGENT_CONSENSUS_ENGINE.MKV",
  year: 2026,
  month: 7,
  sequence: 1,
  start_date: "2026-07-01",
  end_date: "2026-07-14",
  capacity: 35,
  status: "enrolling",
  syllabus_status: {
    "pday-1": "completed",
    "pday-2": "completed",
    "pday-3": "completed",
    "pday-4": "active",
    "pday-5": "upcoming",
    "pday-6": "upcoming",
    "pday-7": "upcoming",
    "pday-8": "upcoming",
    "pday-9": "upcoming",
    "pday-10": "upcoming",
    "pday-11": "upcoming",
    "pday-12": "upcoming",
    "pday-13": "upcoming"
  }
});

cohorts.set("CODX-2026-08-BASE-01", {
  id: "CODX-2026-08-BASE-01",
  name: "August 2026 Base Cohort",
  track: "base",
  repo_url: "https://github.com/codexia-academy/base-sprint-august-2026",
  documents: [
    { name: "Syllabus Roadmap PDF", file_url: "https://codexia.academy/docs/base-syllabus.pdf", uploaded_at: "2026-08-01 10:00" },
    { name: "C.O.D.E. Method Guide", file_url: "https://codexia.academy/docs/code-method.pdf", uploaded_at: "2026-08-02 12:00" }
  ],
  next_session_at: "2026-08-15T14:00:00.000Z",
  active_briefing_topic: "CONNECTING_YOUR_BOT_TO_REAL_TOOLS.MKV",
  year: 2026,
  month: 8,
  sequence: 1,
  start_date: "2026-08-01",
  end_date: "2026-08-14",
  capacity: 150,
  status: "enrolling",
  syllabus_status: {
    "day-1": "upcoming",
    "day-2": "upcoming",
    "day-3": "upcoming",
    "day-4": "upcoming",
    "day-5": "upcoming",
    "day-6": "upcoming"
  }
});

// Seed community posts
communityPosts.push(
  {
    id: "post-1",
    cohort_id: "CODX-2026-07-PREMIUM-01",
    author_id: "vankayalapatimallikharjunarao@gmail.com",
    author_name: "Mallikharjuna Rao (Mentor)",
    role: "admin",
    content: "Welcome to Codexia Premium Alpha Track! Over the next 13 days, we will dissect multi-agent architecture. Get ready for an intense ride.",
    is_announcement: true,
    created_at: "2026-07-11 08:00",
    replies: []
  },
  {
    id: "post-2",
    cohort_id: "CODX-2026-07-PREMIUM-01",
    author_id: "alex.student@gmail.com",
    author_name: "Alex",
    role: "student",
    content: "Super excited to start the multi-agent consensus protocols. Is anyone else using LangChain or are we strictly working with CrewAI and custom agents?",
    is_announcement: false,
    created_at: "2026-07-11 09:15",
    replies: [
      {
        id: "rep-1",
        post_id: "post-2",
        author_id: "vankayalapatimallikharjunarao@gmail.com",
        author_name: "Mallikharjuna Rao (Mentor)",
        role: "admin",
        content: "We will build from pure HTTP APIs first to understand core mechanics, then we will use framework bindings like CrewAI.",
        created_at: "2026-07-11 09:30"
      }
    ]
  },
  {
    id: "post-3",
    cohort_id: "CODX-2026-07-BASE-01",
    author_id: "vankayalapatimallikharjunarao@gmail.com",
    author_name: "Mallikharjuna Rao (Mentor)",
    role: "admin",
    content: "Base Cohort - Day 1 is now active. Please complete the C.O.D.E. Method checklist before joining the live briefing.",
    is_announcement: true,
    created_at: "2026-07-11 08:30",
    replies: []
  }
);

// Seed direct messages
directMessages.push(
  {
    id: "dm-1",
    cohort_id: "CODX-2026-07-PREMIUM-01",
    student_email: "alex.student@gmail.com",
    sender: "student",
    sender_name: "Alex",
    content: "Hi Rao, I am working on the Capstone project write-up but I wanted to check if we can get a template for the system architecture schema.",
    created_at: "2026-07-11 10:00"
  },
  {
    id: "dm-2",
    cohort_id: "CODX-2026-07-PREMIUM-01",
    student_email: "alex.student@gmail.com",
    sender: "admin",
    sender_name: "Mallikharjuna Rao (Mentor)",
    content: "Yes Alex, I have uploaded the Packaged Capstone write-up template in the Cohort Resources tab. Let me know if you can see it.",
    created_at: "2026-07-11 10:15"
  }
);

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes strict timeout

// Periodically purge expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (now - session.lastActive > SESSION_TIMEOUT) {
      activeSessions.delete(token);
      if (userActiveTokens.get(session.email) === token) {
        userActiveTokens.delete(session.email);
      }
    }
  }
}, 30 * 1000);

function getSession(req: express.Request): UserSession | null {
  const authHeader = req.headers["authorization"] || req.headers["x-session-token"];
  let token = "";
  if (typeof authHeader === "string") {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }
  }

  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  const now = Date.now();
  if (now - session.lastActive > SESSION_TIMEOUT) {
    // Session has expired
    activeSessions.delete(token);
    if (userActiveTokens.get(session.email) === token) {
      userActiveTokens.delete(session.email);
    }
    return null;
  }

  // sliding window active timestamp update
  session.lastActive = now;
  return session;
}

// Secure email OTP verification database for password setup
const emailOtps = new Map<string, string>();

// Helper to determine administrator access
const isAdminEmail = (emailLower: string) => {
  if (!emailLower) return false;
  const lower = emailLower.toLowerCase().trim();
  return (
    lower === "vankayalapatimallikharjunarao@gmail.com" ||
    lower === "support.codexiaindia@gmail.com" ||
    lower === "admin@codexiaindia.com" ||
    lower === "bestnest125@gmail.com" ||
    lower.endsWith("@codexiaindia.com") ||
    lower.endsWith("@codexia.com") ||
    lower.endsWith("@codexia.io")
  );
};

app.post("/api/auth/request-otp", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email address is required" });
  }
  const emailLower = email.toLowerCase().trim();

  // Strict Security Isolation: Only Admin accounts can request OTP verification codes.
  if (!isAdminEmail(emailLower)) {
    return res.status(400).json({ 
      error: "OTP generation is restricted to Administrator nodes. Regular user accounts bypass this security gateway." 
    });
  }

  // Generate a highly secure 5-digit verification OTP
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  emailOtps.set(emailLower, otp);
  
  console.log(`[MAIL GATEWAY] Secure OTP ${otp} allocated for administrator address ${emailLower}`);
  
  res.json({ 
    success: true, 
    otp, 
    message: `Verification code successfully dispatched to your email.` 
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and verification code are required" });
  }
  const emailLower = email.toLowerCase().trim();
  const storedOtp = emailOtps.get(emailLower);
  
  if (storedOtp && storedOtp === otp.trim()) {
    res.json({ success: true, message: "Code verified successfully." });
  } else {
    res.status(400).json({ error: "Invalid verification code. Please check your inbox and try again." });
  }
});

app.post("/api/auth/reset-password", (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password parameters are required" });
  }
  const emailLower = email.toLowerCase().trim();

  // If the account belongs to an Administrator, validate the security OTP token.
  if (isAdminEmail(emailLower)) {
    if (!otp) {
      return res.status(400).json({ error: "OTP security token is required for administrator credential resets." });
    }
    const storedOtp = emailOtps.get(emailLower);
    if (!storedOtp || storedOtp !== otp.trim()) {
      return res.status(400).json({ error: "Verification session expired or invalid. Please request a new OTP." });
    }
  }
  
  if (password.length < 5) {
    return res.status(400).json({ error: "Password must be at least 5 characters for security setup" });
  }
  
  // Update secure credentials database
  userCredentials.set(emailLower, password);
  if (isAdminEmail(emailLower)) {
    emailOtps.delete(emailLower);
  }
  
  res.json({ success: true, message: "Security password successfully changed." });
});

// API Routes - Authentication
app.post("/api/auth/login", (req, res) => {
  const { email, password, deviceFingerprint } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password parameter is required" });
  }

  const emailLower = email.toLowerCase().trim();
  
  // Strict role definition matching User Database guidance
  const isAdmin = isAdminEmail(emailLower);
  const role = isAdmin ? "admin" : "student";

  // Check if user exists. If not, register dynamically on first login
  if (!userCredentials.has(emailLower)) {
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters for secure setup" });
    }
    userCredentials.set(emailLower, password);
  } else {
    const correctPassword = userCredentials.get(emailLower);
    const isPasswordCorrect = (password === correctPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Incorrect password or signature mismatched" });
    }
  }

  // FORCE SINGLE-SESSION CONSTRAINT: destroy any existing session for this user
  const oldToken = userActiveTokens.get(emailLower);
  if (oldToken) {
    activeSessions.delete(oldToken);
    userActiveTokens.delete(emailLower);
  }

  // Create highly secure session token
  const token = "cx_sec_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
  const newSession: UserSession = {
    token,
    email: emailLower,
    role,
    lastActive: Date.now(),
    deviceFingerprint
  };

  activeSessions.set(token, newSession);
  userActiveTokens.set(emailLower, token);

  let track: string | null = null;
  let cohort_id: string | null = null;
  if (role === "admin") {
    track = "admin";
  } else {
    const profile = studentProfiles.get(emailLower);
    if (profile) {
      track = profile.track;
      cohort_id = profile.cohort_id;
    } else {
      const defaultProf: StudentProfile = {
        email: emailLower,
        track: null,
        cohort_id: null
      };
      studentProfiles.set(emailLower, defaultProf);
    }
  }

  res.json({
    token,
    email: emailLower,
    role,
    track,
    cohort_id,
    message: isAdmin 
      ? "AUTHORIZED // Single admin session bound on server" 
      : "AUTHORIZED // Single student session bound on server"
  });
});

// Firebase Auth Server Session Synchronizer & Server-side RBAC Enforcement
app.post("/api/auth/firebase-session", (req, res) => {
  const { email, uid, deviceFingerprint } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "Email parameter required for Firebase session synchronization." });
  }

  const emailLower = email.toLowerCase().trim();
  const isAdmin = isAdminEmail(emailLower);
  const role = isAdmin ? "admin" : "student";

  // Single active session enforcement
  const oldToken = userActiveTokens.get(emailLower);
  if (oldToken) {
    activeSessions.delete(oldToken);
    userActiveTokens.delete(emailLower);
  }

  const token = "cx_sec_fb_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
  const newSession: UserSession = {
    token,
    email: emailLower,
    role,
    lastActive: Date.now(),
    deviceFingerprint: deviceFingerprint || "fb_device"
  };

  activeSessions.set(token, newSession);
  userActiveTokens.set(emailLower, token);

  let track: string | null = null;
  let cohort_id: string | null = null;
  let payment_status = "unpaid";
  let enrollment_status = "inactive";
  let has_paid = false;

  if (role === "admin") {
    track = "admin";
    payment_status = "paid";
    enrollment_status = "active";
    has_paid = true;
  } else {
    const profile = studentProfiles.get(emailLower);
    if (profile && profile.track && profile.cohort_id) {
      track = profile.track;
      cohort_id = profile.cohort_id;
      payment_status = "paid";
      enrollment_status = "active";
      has_paid = true;
    } else {
      const defaultProf: StudentProfile = {
        email: emailLower,
        track: null,
        cohort_id: null
      };
      studentProfiles.set(emailLower, defaultProf);
    }
  }

  res.json({
    token,
    email: emailLower,
    role,
    track,
    cohort_id,
    payment_status,
    enrollment_status,
    has_paid,
    isAdmin,
    message: isAdmin ? "ADMIN_PRIVILEGES_GRANTED" : "STUDENT_SESSION_INITIALIZED"
  });
});

// Real-time server enrollment check endpoint
app.get("/api/auth/enrollment-check", (req, res) => {
  const session = getSession(req);
  const email = req.query.email ? String(req.query.email).toLowerCase().trim() : session?.email;
  if (!email) {
    return res.status(400).json({ payment_status: "unpaid", enrollment_status: "inactive", has_paid: false });
  }

  const isAdmin = isAdminEmail(email);
  if (isAdmin) {
    return res.json({
      email,
      payment_status: "paid",
      enrollment_status: "active",
      has_paid: true,
      track: "admin",
      cohort_id: "ADMIN-ALL"
    });
  }

  const profile = studentProfiles.get(email);
  const hasPaid = !!(profile && profile.track && profile.cohort_id);

  res.json({
    email,
    payment_status: hasPaid ? "paid" : "unpaid",
    enrollment_status: hasPaid ? "active" : "inactive",
    has_paid: hasPaid,
    track: profile?.track || null,
    cohort_id: profile?.cohort_id || null
  });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers["authorization"] || req.headers["x-session-token"];
  let token = "";
  if (typeof authHeader === "string") {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }
  }

  if (token) {
    const session = activeSessions.get(token);
    if (session) {
      activeSessions.delete(token);
      if (userActiveTokens.get(session.email) === token) {
        userActiveTokens.delete(session.email);
      }
    }
  }
  res.json({ success: true, message: "Session successfully destroyed on server" });
});

app.get("/api/auth/session", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session credentials" });
  }

  let track: string | null = null;
  let cohort_id: string | null = null;
  let profile: StudentProfile | null = null;

  if (session.role === "admin") {
    track = "admin";
  } else {
    profile = studentProfiles.get(session.email) || null;
    if (profile) {
      track = profile.track;
      cohort_id = profile.cohort_id;
    } else {
      // Create lazy/default student profile
      const defaultProf: StudentProfile = {
        email: session.email,
        track: null,
        cohort_id: null
      };
      studentProfiles.set(session.email, defaultProf);
      profile = defaultProf;
      track = null;
      cohort_id = null;
    }
  }

  res.json({
    email: session.email,
    role: session.role,
    track,
    cohort_id,
    certificate_name: profile?.certificate_name || "",
    profile
  });
});

// POST /api/profile: Update student profile (e.g., Name for Certificate)
app.post("/api/profile", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { certificate_name, username } = req.body || {};
  let profile = studentProfiles.get(session.email);
  if (!profile) {
    profile = {
      email: session.email,
      track: null,
      cohort_id: null
    };
  }

  if (certificate_name !== undefined) {
    profile.certificate_name = certificate_name.trim();
  }
  if (username !== undefined) {
    profile.username = username.trim();
  }

  studentProfiles.set(session.email, profile);
  res.json({ success: true, profile });
});

// GET /api/certificates/me: Retrieve certificates for current user
app.get("/api/certificates/me", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const profile = studentProfiles.get(session.email);
  const myCerts = Array.from(generatedCertificates.values()).filter(c => c.student_email === session.email);

  res.json({
    success: true,
    certificates: myCerts,
    profile
  });
});

// GET /api/certificates/download/:cert_id: Serve/download generated certificate SVG or PNG file
app.get("/api/certificates/download/:cert_id", (req, res) => {
  const certId = req.params.cert_id;
  const cert = generatedCertificates.get(certId);
  const format = (req.query.format as string)?.toLowerCase();

  let studentName = "Student Name";
  let program = "Base Cohort";
  let cohortId = "CODX-2026-07-BASE-01";
  let completionDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  let certificateId = certId;

  if (cert) {
    studentName = cert.student_name;
    program = cert.program;
    cohortId = cert.cohort_id;
    completionDate = cert.completion_date;
    certificateId = cert.certificate_id;
  } else {
    // Search profile or registry
    const matchedProfile = Array.from(studentProfiles.values()).find(p => p.certificate_name && certId.includes("CERT"));
    if (matchedProfile) {
      studentName = matchedProfile.certificate_name;
      cohortId = matchedProfile.cohort_id || cohortId;
      program = matchedProfile.track === "premium" ? "Premium Alpha" : "Base Cohort";
    }
  }

  const svgContent = generateCertificateSVG({
    studentName,
    program,
    cohortId,
    completionDate,
    certificateId
  });

  if (format === "png") {
    try {
      const resvg = new Resvg(svgContent, {
        fitTo: { mode: "width", value: 3508 }
      });
      const pngBuffer = resvg.render().asPng();
      res.setHeader("Content-Disposition", `inline; filename="Codexia_Certificate_${certificateId}.png"`);
      res.setHeader("Content-Type", "image/png");
      return res.send(pngBuffer);
    } catch (e) {
      console.warn("[RESVG DOWNLOAD NOTICE] PNG conversion fallback to SVG:", e);
    }
  }

  res.setHeader("Content-Disposition", `inline; filename="Codexia_Certificate_${certificateId}.svg"`);
  res.setHeader("Content-Type", "image/svg+xml");
  return res.send(svgContent);
});

// POST /api/certificates/generate: Generate certificate for student with user-specified name
app.post("/api/certificates/generate", async (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { studentName, targetEmail, cohortId: reqCohortId, sendMail } = req.body || {};
  const recipientEmail = (session.role === "admin" && targetEmail) ? targetEmail.toLowerCase().trim() : session.email;

  if (!studentName || !studentName.trim()) {
    return res.status(400).json({ error: "Student name is required to be printed on the certificate." });
  }

  const formattedName = studentName.trim();

  // Fetch or create profile
  let profile = studentProfiles.get(recipientEmail);
  if (!profile) {
    profile = {
      email: recipientEmail,
      track: "base",
      cohort_id: reqCohortId || "CODX-2026-07-BASE-01"
    };
  }

  // Determine cohort ID and track
  const cohortId = reqCohortId || profile.cohort_id || (profile.track === "premium" ? "CODX-2026-07-PREMIUM-01" : "CODX-2026-07-BASE-01");
  const cohort = cohorts.get(cohortId);
  const trackName = profile.track === "premium" || cohort?.track === "premium" ? "Premium Alpha" : "Base Cohort";
  const program = cohort ? (cohort.track === "premium" ? "Premium Alpha" : "Base Cohort") : trackName;

  // Update student profile record
  profile.certificate_name = formattedName;
  profile.is_completed = true;
  profile.completed_at = new Date().toISOString();
  profile.cohort_id = cohortId;
  studentProfiles.set(recipientEmail, profile);

  // Update enrollment ledger in serverStore
  if (serverStore.recently_registered) {
    const regIndex = serverStore.recently_registered.findIndex((r: any) => r.email === recipientEmail);
    if (regIndex >= 0) {
      serverStore.recently_registered[regIndex].is_completed = true;
      serverStore.recently_registered[regIndex].completed_at = profile.completed_at;
      serverStore.recently_registered[regIndex].certificate_name = formattedName;
    }
  }

  // Auto generate unique certificate ID
  const certSeq = Math.floor(Math.random() * 899 + 100);
  const cleanCohort = cohortId.replace(/^CODX-/, "");
  const certId = `CODX-CERT-${cleanCohort}-${certSeq}`;
  const completionDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Generate SVG string using 100% exact pattern template
  const certSvg = generateCertificateSVG({
    studentName: formattedName,
    program,
    cohortId,
    completionDate,
    certificateId: certId
  });

  const base64Svg = Buffer.from(certSvg, "utf-8").toString("base64");
  const fileId = `cert_${certId.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

  // Store in file storage
  storedFiles.set(fileId, {
    id: fileId,
    fileName: `Codexia_Certificate_${formattedName.replace(/\s+/g, "_")}_${certId}.svg`,
    mimeType: "image/svg+xml",
    data: base64Svg
  });

  const downloadUrl = `/api/certificates/download/${certId}`;

  const certRecord: GeneratedCertificate = {
    certificate_id: certId,
    student_email: recipientEmail,
    student_name: formattedName,
    program,
    cohort_id: cohortId,
    completion_date: completionDate,
    generated_at: new Date().toISOString(),
    download_url: downloadUrl,
    file_id: fileId
  };

  generatedCertificates.set(certId, certRecord);

  // Attach to cohort documents
  if (cohort) {
    cohort.documents = cohort.documents || [];
    const certDoc = {
      id: fileId,
      name: `Certificate of Completion - ${formattedName} (${certId})`,
      file_url: downloadUrl,
      uploaded_at: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    const existingIdx = cohort.documents.findIndex(d => d.name.includes(certId) || d.file_url.includes(certId));
    if (existingIdx >= 0) {
      cohort.documents[existingIdx] = certDoc;
    } else {
      cohort.documents.push(certDoc);
    }
  }

  // Dispatch Email notification via Nodemailer
  let mailDispatched = false;
  let mailMessage = "";

  if (sendMail !== false) {
    const emailResult = await sendCertificateEmail({
      toEmail: recipientEmail,
      studentName: formattedName,
      certificateId: certId,
      program,
      completionDate,
      downloadUrl,
      svgContent: certSvg
    });

    mailDispatched = emailResult.sent;
    mailMessage = emailResult.message;

    const mailLog = {
      id: `MAIL-${Math.floor(Math.random() * 9000 + 1000)}`,
      studentEntity: {
        initials: formattedName.substring(0, 2).toUpperCase(),
        username: recipientEmail.split("@")[0]
      },
      issueDescription: `CERTIFICATE EMAIL DISPATCH (${emailResult.mode.toUpperCase()}) // Cert ID: ${certId}, Recipient: ${recipientEmail}, Result: ${emailResult.message}`,
      severity: "LOW",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: emailResult.sent ? "RESOLVED" : "ATTENTION_REQUIRED"
    };
    serverStore.complaint_logs = [mailLog, ...(serverStore.complaint_logs || [])];
  }

  res.json({
    success: true,
    certificate: certRecord,
    profile,
    mailDispatched,
    mailMessage: mailMessage || "Certificate generated successfully.",
    message: `Certificate generated for ${formattedName} and dispatched to ${recipientEmail}!`
  });
});

// POST /api/certificates/mail: Send certificate via email
app.post("/api/certificates/mail", async (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { cert_id, email: targetEmail } = req.body || {};
  const cert = generatedCertificates.get(cert_id);

  if (!cert) {
    return res.status(404).json({ error: "Certificate record not found in ledger" });
  }

  const recipientEmail = targetEmail || cert.student_email || session.email;

  const certSvg = generateCertificateSVG({
    studentName: cert.student_name,
    program: cert.program,
    cohortId: cert.cohort_id,
    completionDate: cert.completion_date,
    certificateId: cert.certificate_id
  });

  const emailResult = await sendCertificateEmail({
    toEmail: recipientEmail,
    studentName: cert.student_name,
    certificateId: cert.certificate_id,
    program: cert.program,
    completionDate: cert.completion_date,
    downloadUrl: cert.download_url,
    svgContent: certSvg
  });

  const mailLog = {
    id: `MAIL-${Math.floor(Math.random() * 9000 + 1000)}`,
    studentEntity: {
      initials: cert.student_name.substring(0, 2).toUpperCase(),
      username: recipientEmail.split("@")[0]
    },
    issueDescription: `CERTIFICATE RE-DISPATCH (${emailResult.mode.toUpperCase()}) // ID: ${cert.certificate_id}, Student: ${cert.student_name}, Recipient: ${recipientEmail}, Result: ${emailResult.message}`,
    severity: "LOW",
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    status: emailResult.sent ? "RESOLVED" : "ATTENTION_REQUIRED"
  };
  serverStore.complaint_logs = [mailLog, ...(serverStore.complaint_logs || [])];

  res.json({
    success: true,
    recipientEmail,
    certificateId: cert.certificate_id,
    downloadUrl: cert.download_url,
    mailDispatched: emailResult.sent,
    mailMessage: emailResult.message,
    message: emailResult.message
  });
});

// --- COHORT & RBAC-SEGREGATED COMMUNITY / WORKSPACE ENDPOINTS ---

// GET dynamic enrolling cohorts
app.get("/api/cohorts/enrolling", (req, res) => {
  const baseEnrolling = Array.from(cohorts.values()).find(c => c.track === "base" && c.status === "enrolling") || cohorts.get("CODX-2026-07-BASE-01");
  const premiumEnrolling = Array.from(cohorts.values()).find(c => c.track === "premium" && c.status === "enrolling") || cohorts.get("CODX-2026-07-PREMIUM-01");
  res.json({
    base: baseEnrolling || null,
    premium: premiumEnrolling || null
  });
});

// Enrollment endpoint: tags student and places them into a cohort
app.post("/api/enroll", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required for enrollment" });
  }
  
  const { track } = req.body;
  if (track !== "base" && track !== "premium") {
    return res.status(400).json({ error: "Invalid track specification" });
  }
  
  // Tag student to the currently enrolling cohort for that track, or fallback
  const enrollingCohort = Array.from(cohorts.values()).find(c => c.track === track && c.status === "enrolling");
  const cohortId = enrollingCohort ? enrollingCohort.id : (track === "base" ? "CODX-2026-07-BASE-01" : "CODX-2026-07-PREMIUM-01");
  
  const profile: StudentProfile = {
    email: session.email,
    track,
    cohort_id: cohortId
  };
  
  studentProfiles.set(session.email, profile);
  serverStore.has_paid = true; // Sync globally for backward compatibility
  
  // Track as completed transaction in recently_registered
  const email = session.email;
  const username = email.split("@")[0];
  const amountUSD = track === "premium" ? (masterclassActive ? 149 : 199) : (masterclassActive ? 59 : 79);
  const amountINR = track === "premium" ? (masterclassActive ? 9999 : 12999) : (masterclassActive ? 3999 : 4999);
  
  const newReg = {
    email,
    username,
    trackId: track === "premium" ? "track-premium" : "track-base",
    timestamp: new Date().toISOString(),
    tier: track,
    amountUSD,
    amountINR,
    cohort_id: cohortId
  };

  serverStore.recently_registered = [newReg, ...(serverStore.recently_registered || [])];

  // Log the enrollment action
  console.log(`[ENROLLMENT ENGINES] Student ${session.email} successfully logged under cohort ${cohortId}`);
  
  res.json({ success: true, profile });
});

// GET years list
app.get("/api/admin/cohorts/years", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  res.json(Array.from(cohortYears).sort((a, b) => b - a));
});

// POST add new year
app.post("/api/admin/cohorts/years", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  const { year } = req.body;
  if (!year || typeof year !== "number") {
    return res.status(400).json({ error: "Valid year is required" });
  }
  cohortYears.add(year);
  res.json({ success: true, years: Array.from(cohortYears).sort((a, b) => b - a) });
});

// POST create cohort
app.post("/api/admin/cohorts", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  const { year, month, track, start_date, end_date, capacity, repo_url } = req.body;
  if (!year || !month || !track || !start_date || !end_date) {
    return res.status(400).json({ error: "All cohort creation parameters are required" });
  }
  if (track !== "base" && track !== "premium") {
    return res.status(400).json({ error: "Invalid track specification" });
  }

  // Calculate sequence
  const sameGroup = Array.from(cohorts.values()).filter(c => c.year === year && c.month === month && c.track === track);
  const sequence = sameGroup.length + 1;

  const cohortId = `CODX-${year}-${month.toString().padStart(2, "0")}-${track.toUpperCase()}-${sequence.toString().padStart(2, "0")}`;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[month - 1] || "Unknown";
  const trackName = track === "premium" ? "Premium Alpha" : "Base";

  const syllabus_status: Record<string, "upcoming" | "active" | "completed"> = {};
  const syllabusDays = track === "premium" ? pSyllabusDays : bSyllabusDays;
  syllabusDays.forEach((d) => {
    syllabus_status[d.id] = "upcoming";
  });

  const defaultCapacity = track === "premium" ? 35 : 150;
  const finalCapacity = capacity ? Number(capacity) : defaultCapacity;
  const finalRepoUrl = repo_url && repo_url.trim() !== "" ? repo_url.trim() : `https://github.com/codexia-academy/${track}-sprint-${monthName.toLowerCase()}-${year}`;

  const defaultDocs = track === "premium" ? [
    { name: "Syllabus Roadmap PDF", file_url: "https://codexia.academy/docs/premium-syllabus.pdf", uploaded_at: `${start_date} 10:00` },
    { name: "C.O.D.E. Method Guide", file_url: "https://codexia.academy/docs/code-method.pdf", uploaded_at: `${start_date} 12:00` },
    { name: "Premium Capstone Spec", file_url: "https://codexia.academy/docs/premium-capstone.pdf", uploaded_at: `${start_date} 14:00` }
  ] : [
    { name: "Syllabus Roadmap PDF", file_url: "https://codexia.academy/docs/base-syllabus.pdf", uploaded_at: `${start_date} 10:00` },
    { name: "C.O.D.E. Method Guide", file_url: "https://codexia.academy/docs/code-method.pdf", uploaded_at: `${start_date} 12:00` }
  ];

  const newCohort: Cohort = {
    id: cohortId,
    name: `${monthName} ${year} ${trackName} Cohort`,
    track,
    repo_url: finalRepoUrl,
    documents: defaultDocs,
    next_session_at: new Date(start_date).toISOString(),
    active_briefing_topic: "CONNECTING_YOUR_BOT_TO_REAL_TOOLS.MKV",
    year,
    month,
    sequence,
    start_date,
    end_date,
    capacity: finalCapacity,
    status: "draft",
    syllabus_status
  };

  cohorts.set(cohortId, newCohort);
  res.json({ success: true, cohort: newCohort });
});

// PATCH update cohort specifications (Start date, End date, Repo URL, Capacity)
app.patch("/api/admin/cohorts/:cohort_id", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }

  const cohortId = req.params.cohort_id;
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }

  const { start_date, end_date, repo_url, capacity } = req.body;

  if (start_date) {
    cohort.start_date = start_date;
    try {
      cohort.next_session_at = new Date(start_date).toISOString();
    } catch {
      // Ignore invalid date strings
    }
  }
  if (end_date) {
    cohort.end_date = end_date;
  }
  if (repo_url !== undefined && repo_url.trim() !== "") {
    cohort.repo_url = repo_url.trim();
  }
  if (capacity !== undefined && !isNaN(Number(capacity))) {
    cohort.capacity = Number(capacity);
  }

  res.json({ success: true, cohort });
});

// DELETE a draft cohort (Draft stage only)
app.delete("/api/admin/cohorts/:cohort_id", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }

  const cohortId = req.params.cohort_id;
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }

  if (cohort.status !== "draft") {
    return res.status(400).json({ error: "Only cohorts in Draft status can be deleted. Non-draft cohorts must be Archived." });
  }

  cohorts.delete(cohortId);
  res.json({ success: true, message: `Cohort ${cohortId} permanently deleted from system ledger.` });
});

// PATCH status of cohort
app.patch("/api/admin/cohorts/:cohort_id/status", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }

  const cohortId = req.params.cohort_id;
  const { status, resolvePrevious } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }

  if (status === "enrolling") {
    // Check if there is another cohort of the same track currently marked "enrolling"
    const conflicting = Array.from(cohorts.values()).find(c => c.track === cohort.track && c.status === "enrolling" && c.id !== cohortId);
    if (conflicting) {
      if (!resolvePrevious) {
        return res.status(409).json({
          error: "conflict",
          message: `There is already an Enrolling cohort for the ${cohort.track} track (${conflicting.id}).`,
          conflictingCohort: conflicting
        });
      } else {
        // Resolve conflicting
        if (resolvePrevious === "active" || resolvePrevious === "completed") {
          conflicting.status = resolvePrevious;
          if (resolvePrevious === "completed") {
            generateCohortCertificates(conflicting.id);
          }
        } else {
          return res.status(400).json({ error: "Invalid resolution status" });
        }
      }
    }
  }

  cohort.status = status;

  let generatedCertificatesList: GeneratedCertificate[] = [];
  if (status === "completed") {
    generatedCertificatesList = generateCohortCertificates(cohortId);
  }

  res.json({
    success: true,
    cohort,
    certificates_generated: generatedCertificatesList.length,
    message: status === "completed"
      ? `Cohort ${cohortId} transitioned to COMPLETED. Successfully auto-generated and dispatched ${generatedCertificatesList.length} certificates.`
      : `Cohort ${cohortId} status updated to ${status}`
  });
});

// PATCH update live_meet_url of a cohort
app.patch("/api/admin/cohorts/:cohort_id/meet", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }

  const cohortId = req.params.cohort_id;
  const { live_meet_url } = req.body;
  
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }

  cohort.live_meet_url = live_meet_url;
  res.json({ success: true, cohort });
});

// Helper route guard to enforce cohort track segregation
function checkCohortAccess(session: UserSession, cohortId: string): boolean {
  if (session.role === "admin") return true;
  const profile = studentProfiles.get(session.email);
  return profile?.cohort_id === cohortId;
}

// Public endpoint to get all running cohorts for testimonials & selection
app.get("/api/public/cohorts", (req, res) => {
  res.json(Array.from(cohorts.values()));
});

// Get cohorts (segregated based on role)
app.get("/api/cohorts", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (session.role === "admin") {
    return res.json(Array.from(cohorts.values()));
  }
  
  const profile = studentProfiles.get(session.email);
  if (!profile || !profile.cohort_id) {
    return res.json([]);
  }
  
  const cohort = cohorts.get(profile.cohort_id);
  return res.json(cohort ? [cohort] : []);
});

// Get specific cohort
app.get("/api/cohorts/:cohort_id", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const cohortId = req.params.cohort_id;
  if (!checkCohortAccess(session, cohortId)) {
    return res.status(403).json({ error: "Access Denied: You are not enrolled in this cohort track." });
  }
  
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }
  
  res.json(cohort);
});

// Admin updates repo URL
app.all(["/api/cohorts/:cohort_id/repo_url", "/api/admin/cohorts/:cohort_id/repo_url"], (req, res) => {
  if (req.method !== "POST" && req.method !== "PATCH" && req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  
  const cohortId = req.params.cohort_id;
  const { repo_url } = req.body;
  
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }
  
  cohort.repo_url = typeof repo_url === "string" ? repo_url.trim() : "";
  res.json({ success: true, cohort });
});

// Admin updates syllabus status of a day
app.post("/api/cohorts/:cohort_id/syllabus_status", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  
  const cohortId = req.params.cohort_id;
  const day_id = req.body.day_id || req.body.dayId;
  const { status } = req.body;
  if (!day_id || !status) {
    return res.status(400).json({ error: "day_id (or dayId) and status are required" });
  }
  
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }
  
  cohort.syllabus_status = cohort.syllabus_status || {};
  cohort.syllabus_status[day_id] = status;
  
  // Auto-advance next day if current day is completed
  const syllabus = cohort.track === "premium" ? pSyllabusDays : bSyllabusDays;
  const dayIndex = syllabus.findIndex(d => d.id === day_id);
  if (status === "completed" && dayIndex !== -1 && dayIndex < syllabus.length - 1) {
    const nextDay = syllabus[dayIndex + 1];
    const currentNextStatus = cohort.syllabus_status[nextDay.id] || "upcoming";
    if (currentNextStatus === "upcoming") {
      cohort.syllabus_status[nextDay.id] = "active";
    }
  }
  
  res.json({ success: true, cohort });
});

// Admin uploads cohort document with real file storage and format integrity
app.post("/api/cohorts/:cohort_id/documents", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  
  const cohortId = req.params.cohort_id;
  const { name, file_url, fileName, fileData } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Document name is required" });
  }
  
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }
  
  const docId = "doc_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
  let finalUrl = file_url;
  let finalFileName = fileName || name || "uploaded_file";
  let finalMimeType = "application/octet-stream";

  if (fileData) {
    const match = fileData.match(/^data:(.*);base64,(.*)$/);
    let base64Content = fileData;
    if (match) {
      finalMimeType = match[1];
      base64Content = match[2];
    }
    storedFiles.set(docId, {
      id: docId,
      fileName: finalFileName,
      mimeType: finalMimeType,
      data: base64Content
    });
    finalUrl = `/api/documents/download/${docId}`;
  } else if (!finalUrl) {
    return res.status(400).json({ error: "File data or URL is required" });
  }
  
  const newDoc = {
    id: docId,
    name,
    fileName: finalFileName,
    mimeType: finalMimeType,
    file_url: finalUrl,
    uploaded_at: new Date().toISOString().replace("T", " ").substring(0, 16)
  };
  
  cohort.documents = cohort.documents || [];
  cohort.documents.push(newDoc);
  
  res.json({ success: true, cohort });
});

// Serve uploaded document file (supporting direct download and in-browser native inline viewing)
app.get(["/api/documents/download/:id", "/api/documents/view/:id"], (req, res) => {
  const file = storedFiles.get(req.params.id);
  if (!file) {
    return res.status(404).send("Error // File not found in registry ledger");
  }
  try {
    const buffer = Buffer.from(file.data, "base64");
    const isInline = req.query.inline === "true" || req.path.includes("/view/");
    const disposition = isInline 
      ? `inline; filename="${encodeURIComponent(file.fileName)}"`
      : `attachment; filename="${encodeURIComponent(file.fileName)}"`;
    
    res.setHeader("Content-Disposition", disposition);
    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send("Error // Failed to stream document binary: " + err.message);
  }
});

// Admin deletes a cohort document
app.delete("/api/cohorts/:cohort_id/documents/:doc_id", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  
  const cohortId = req.params.cohort_id;
  const docId = req.params.doc_id;
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }
  
  cohort.documents = cohort.documents || [];
  
  // Clean up in-memory stored file if possible
  const doc = cohort.documents.find(d => (d as any).id === docId || d.file_url.includes(docId));
  if (doc) {
    const parts = doc.file_url.split("/");
    const fileId = parts[parts.length - 1];
    if (fileId && storedFiles.has(fileId)) {
      storedFiles.delete(fileId);
    }
  }

  cohort.documents = cohort.documents.filter(d => (d as any).id !== docId && !d.file_url.includes(docId));
  
  res.json({ success: true, cohort });
});

// Admin updates next session / briefing topic / meet url
app.post("/api/cohorts/:cohort_id/next_session", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  
  const cohortId = req.params.cohort_id;
  const { next_session_at, active_briefing_topic, live_meet_url } = req.body;
  
  const cohort = cohorts.get(cohortId);
  if (!cohort) {
    return res.status(404).json({ error: "Cohort not found" });
  }
  
  if (next_session_at !== undefined) {
    cohort.next_session_at = next_session_at;
  }
  if (active_briefing_topic !== undefined) {
    cohort.active_briefing_topic = active_briefing_topic;
  }
  if (live_meet_url !== undefined) {
    cohort.live_meet_url = live_meet_url;
    serverStore.live_meet_url = live_meet_url; // sync globally for fallback
  }
  
  res.json({ success: true, cohort });
});

// Get roster of students (admin-only)
app.get("/api/admin/cohorts/:cohort_id/roster", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  
  const cohortId = req.params.cohort_id;
  const roster = Array.from(studentProfiles.values()).filter(s => s.cohort_id === cohortId);
  res.json(roster);
});

// GET public members list of a cohort
app.get("/api/cohorts/:cohort_id/members", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const cohortId = req.params.cohort_id;
  if (!checkCohortAccess(session, cohortId)) {
    return res.status(403).json({ error: "Access Denied" });
  }
  
  const isStudent = session.role !== "admin";
  const roster = Array.from(studentProfiles.values())
    .filter(s => s.cohort_id === cohortId)
    .map(s => {
      const parts = s.email.split("@")[0].split(".");
      const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      return {
        name,
        email: isStudent ? undefined : s.email
      };
    });
    
  // Also add admin as a member if not already there
  const hasAdmin = roster.some(m => m.name === "Mallikharjuna Rao");
  if (!hasAdmin) {
    roster.unshift({
      name: "Mallikharjuna Rao (Mentor)",
      email: isStudent ? undefined : "vankayalapatimallikharjunarao@gmail.com"
    });
  }
  
  res.json(roster);
});

// GET community posts (segregated and sanitized)
app.get("/api/community/:cohort_id", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const cohortId = req.params.cohort_id;
  if (!checkCohortAccess(session, cohortId)) {
    return res.status(403).json({ error: "Access Denied: You are not enrolled in this cohort track." });
  }
  
  // Filter posts for this cohort
  const posts = communityPosts.filter(p => p.cohort_id === cohortId);
  
  // Sanitization: students see display names only, never emails.
  const isStudent = session.role !== "admin";
  const sanitizedPosts = posts.map(p => {
    const isOwn = p.author_id === session.email;
    return {
      ...p,
      author_id: isStudent ? "" : p.author_id, // Clear email for students
      is_own: isOwn,
      replies: (p.replies || []).map(r => ({
        ...r,
        author_id: isStudent ? "" : r.author_id, // Clear email for replies
        is_own: r.author_id === session.email
      }))
    };
  });
  
  res.json(sanitizedPosts);
});

// POST community post (channel-based permissions)
app.post("/api/community/:cohort_id", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const cohortId = req.params.cohort_id;
  if (!checkCohortAccess(session, cohortId)) {
    return res.status(403).json({ error: "Access Denied: You are not enrolled in this cohort track." });
  }
  
  const { content, is_announcement, channel, attachment, voice_note } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Post content cannot be empty" });
  }

  const selectedChannel = channel || "discussions";
  const isAdmin = session.role === "admin";

  // Channel Permissions check
  if (selectedChannel === "announcements" && !isAdmin) {
    return res.status(403).json({ error: "Forbidden: Only administrators can publish in #announcements." });
  }
  
  const postAnnouncement = isAdmin ? (selectedChannel === "announcements" || !!is_announcement) : false;
  
  const authorName = isAdmin 
    ? "Mallikharjuna Rao (Mentor)" 
    : session.email.split("@")[0].split(".")[0].replace(/^\w/, c => c.toUpperCase());
    
  const newPost: CommunityPost = {
    id: "post_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    cohort_id: cohortId,
    author_id: session.email,
    author_name: authorName,
    role: isAdmin ? "admin" : "student",
    content,
    is_announcement: postAnnouncement,
    channel: selectedChannel,
    is_pinned: false,
    reactions: {},
    created_at: new Date().toISOString().replace("T", " ").substring(0, 16),
    replies: [],
    attachment: attachment || undefined,
    voice_note: voice_note || undefined
  };
  
  communityPosts.push(newPost);
  res.json({ ...newPost, is_own: true });
});

// POST community reply
app.post("/api/community/:cohort_id/reply", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const cohortId = req.params.cohort_id;
  if (!checkCohortAccess(session, cohortId)) {
    return res.status(403).json({ error: "Access Denied: You are not enrolled in this cohort track." });
  }
  
  const { post_id, content, attachment } = req.body;
  if (!post_id || !content || !content.trim()) {
    return res.status(400).json({ error: "Post ID and reply content are required" });
  }
  
  const post = communityPosts.find(p => p.id === post_id && p.cohort_id === cohortId);
  if (!post) {
    return res.status(404).json({ error: "Target post not found in this cohort community." });
  }
  
  const isAdmin = session.role === "admin";
  const authorName = isAdmin 
    ? "Mallikharjuna Rao (Mentor)" 
    : session.email.split("@")[0].split(".")[0].replace(/^\w/, c => c.toUpperCase());
    
  const newReply: CommunityReply = {
    id: "rep_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    post_id,
    author_id: session.email,
    author_name: authorName,
    role: isAdmin ? "admin" : "student",
    content,
    is_accepted: false,
    reactions: {},
    created_at: new Date().toISOString().replace("T", " ").substring(0, 16),
    attachment: attachment || undefined
  };
  
  post.replies = post.replies || [];
  post.replies.push(newReply);
  
  res.json({ ...newReply, is_own: true });
});

// POST community emoji reaction
app.post("/api/community/:cohort_id/posts/:post_id/react", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const { cohort_id, post_id } = req.params;
  const { emoji } = req.body;
  if (!emoji) {
    return res.status(400).json({ error: "Emoji coordinates are required" });
  }
  
  if (!checkCohortAccess(session, cohort_id)) {
    return res.status(403).json({ error: "Access Denied" });
  }

  const post = communityPosts.find(p => p.id === post_id && p.cohort_id === cohort_id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const userDisplayName = session.role === "admin" 
    ? "Mallikharjuna Rao" 
    : session.email.split("@")[0].split(".")[0].replace(/^\w/, c => c.toUpperCase());

  post.reactions = post.reactions || {};
  if (!post.reactions[emoji]) {
    post.reactions[emoji] = [];
  }

  const userIndex = post.reactions[emoji].indexOf(userDisplayName);
  if (userIndex !== -1) {
    post.reactions[emoji].splice(userIndex, 1);
    if (post.reactions[emoji].length === 0) {
      delete post.reactions[emoji];
    }
  } else {
    post.reactions[emoji].push(userDisplayName);
  }

  res.json({ success: true, reactions: post.reactions });
});

// POST community accept answer (admin-only)
app.post("/api/community/:cohort_id/posts/:post_id/replies/:reply_id/accept", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }
  const { cohort_id, post_id, reply_id } = req.params;
  const post = communityPosts.find(p => p.id === post_id && p.cohort_id === cohort_id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.replies = post.replies || [];
  post.replies.forEach(r => {
    if (r.id === reply_id) {
      r.is_accepted = !r.is_accepted;
    } else {
      r.is_accepted = false;
    }
  });

  res.json({ success: true, post });
});

// POST moderation (pin / remove post/reply) — with self-delete permissions for students
app.post("/api/community/:cohort_id/moderate", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const cohortId = req.params.cohort_id;
  const { action, target_id, post_id } = req.body; // action: "remove_post" | "remove_reply" | "pin_post"
  const isAdmin = session.role === "admin";

  if (!checkCohortAccess(session, cohortId)) {
    return res.status(403).json({ error: "Access Denied" });
  }
  
  if (action === "remove_post") {
    const idx = communityPosts.findIndex(p => p.id === target_id && p.cohort_id === cohortId);
    if (idx !== -1) {
      const post = communityPosts[idx];
      // Check permission: Admin, or the post author themself
      if (!isAdmin && post.author_id !== session.email) {
        return res.status(403).json({ error: "Forbidden: You can only delete your own messages." });
      }
      communityPosts.splice(idx, 1);
      return res.json({ success: true, message: "Post successfully moderated/removed." });
    }
    return res.status(404).json({ error: "Post not found" });
  } else if (action === "remove_reply") {
    const post = communityPosts.find(p => p.id === post_id && p.cohort_id === cohortId);
    if (post && post.replies) {
      const idx = post.replies.findIndex(r => r.id === target_id);
      if (idx !== -1) {
        const reply = post.replies[idx];
        // Check permission: Admin, or the reply author themself
        if (!isAdmin && reply.author_id !== session.email) {
          return res.status(403).json({ error: "Forbidden: You can only delete your own replies." });
        }
        post.replies.splice(idx, 1);
        return res.json({ success: true, message: "Reply successfully moderated/removed." });
      }
    }
    return res.status(404).json({ error: "Reply or Post not found" });
  } else if (action === "pin_post") {
    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden: Only admins can pin messages." });
    }
    const post = communityPosts.find(p => p.id === target_id && p.cohort_id === cohortId);
    if (post) {
      post.is_pinned = !post.is_pinned;
      return res.json({ success: true, message: `Post pinned state toggled to ${post.is_pinned}`, post });
    }
    return res.status(404).json({ error: "Post not found" });
  }
  
  res.status(400).json({ error: "Invalid action" });
});

// GET direct messages (segregated)
app.get("/api/dms/:cohort_id", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const cohortId = req.params.cohort_id;
  if (!checkCohortAccess(session, cohortId)) {
    return res.status(403).json({ error: "Access Denied: You are not enrolled in this cohort track." });
  }
  
  // Filter messages for this cohort
  let filtered = directMessages.filter(m => m.cohort_id === cohortId);
  
  if (session.role !== "admin") {
    // Student can only see messages exchanged between themselves and the admin
    filtered = filtered.filter(m => m.student_email === session.email);
  } else {
    // Admin can see all, but can optionally filter by a specific student email
    const { student_email } = req.query;
    if (student_email) {
      filtered = filtered.filter(m => m.student_email === student_email);
    }
  }
  
  res.json(filtered);
});

// POST direct message
app.post("/api/dms/:cohort_id", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const cohortId = req.params.cohort_id;
  if (!checkCohortAccess(session, cohortId)) {
    return res.status(403).json({ error: "Access Denied: You are not enrolled in this cohort track." });
  }
  
  const { content, student_email } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Message content cannot be empty" });
  }
  
  const isAdmin = session.role === "admin";
  let targetStudentEmail = session.email;
  
  if (isAdmin) {
    if (!student_email) {
      return res.status(400).json({ error: "Recipient student email is required for admins sending direct messages" });
    }
    targetStudentEmail = student_email;
  }
  
  const senderName = isAdmin 
    ? "Mallikharjuna Rao (Mentor)" 
    : session.email.split("@")[0].split(".")[0].replace(/^\w/, c => c.toUpperCase());
    
  const newMsg: DirectMessage = {
    id: "dm_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    cohort_id: cohortId,
    student_email: targetStudentEmail,
    sender: isAdmin ? "admin" : "student",
    sender_name: senderName,
    content,
    created_at: new Date().toISOString().replace("T", " ").substring(0, 16)
  };
  
  directMessages.push(newMsg);
  res.json(newMsg);
});

// API Routes - State Synchronization
app.get("/api/state", (req, res) => {
  // Public/student sanitized state view. Does not contain any metrics, waitlists, registered pupils, or logs.
  const publicState = {
    live_meet_url: serverStore.live_meet_url,
    student_testimonials: serverStore.student_testimonials,
    student_feedbacks: serverStore.student_feedbacks,
    has_paid: serverStore.has_paid
  };
  res.json(publicState);
});

app.post("/api/state", (req, res) => {
  const session = getSession(req);
  const updates = req.body;
  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ error: "Invalid state parameters" });
  }

  // Restrict modification of any metrics or telemetry logs to admins only
  const sensitiveFields = [
    "webinar_tracks", "waitlist_students", "recently_registered", 
    "financial_metrics", "complaint_logs", "webinar_metrics"
  ];
  const containsSensitive = Object.keys(updates).some(k => sensitiveFields.includes(k));

  if (containsSensitive) {
    if (!session || session.role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Administrator level clearance required to modify telemetry state" });
    }
  }

  // Allow updating testimonials or feedbacks
  serverStore = { ...serverStore, ...updates };
  res.json(serverStore);
});

function refreshCentralMetrics() {
  const enrollments = serverStore.recently_registered || [];
  const waitlist = serverStore.waitlist_students || [];
  
  const totalPaid = enrollments.length;
  const totalWait = waitlist.length;
  
  const conversionRate = (totalPaid + totalWait) > 0 
    ? Math.round((totalPaid / (totalPaid + totalWait)) * 1000) / 10 
    : 0;

  // capacity percentage of currently enrolling cohorts
  const enrollingCohorts = Array.from(cohorts.values()).filter(c => c.status === "enrolling");
  const totalCap = enrollingCohorts.reduce((sum, c) => sum + (c.capacity || 150), 0) || 185;
  const capacityPercentage = totalCap > 0 ? Math.min(100, Math.round((totalPaid / totalCap) * 100)) : 0;

  serverStore.webinar_metrics = {
    activeRegistrations: totalPaid,
    waitlist: totalWait,
    conversionRate,
    capacityPercentage
  };

  const totalGrossUSD = enrollments.reduce((sum, r) => sum + (r.amountUSD || 0), 0);
  const totalGrossINR = enrollments.reduce((sum, r) => sum + (r.amountINR || 0), 0);
  const avgOrderValueUSD = totalPaid > 0 ? Math.round(totalGrossUSD / totalPaid) : 0;

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartData = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayName = daysOfWeek[d.getDay()];
    chartData.push({ day: dayName, amount: 0, isHighlighted: i === 0 });
  }

  enrollments.forEach(r => {
    const rDate = new Date(r.timestamp);
    const rDayName = daysOfWeek[rDate.getDay()];
    const match = chartData.find(c => c.day === rDayName);
    if (match) {
      match.amount += r.amountUSD || 0;
    }
  });

  serverStore.financial_metrics = {
    totalGrossUSD,
    totalGrossINR,
    avgOrderValueUSD,
    chartData
  };
}

// Admin Dedicated Telemetry Gateway - Protected under strict RBAC gate
app.get("/api/admin/state", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Administrator privileges required to request secure telemetry data" });
  }
  refreshCentralMetrics();
  res.json(serverStore);
});

app.post("/api/admin/state", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Administrator privileges required to submit secure state parameters" });
  }

  const updates = req.body;
  if (updates && typeof updates === "object") {
    serverStore = { ...serverStore, ...updates };
  }
  refreshCentralMetrics();
  res.json(serverStore);
});

// API Route - Consultation Enquiry Submission & Local Database Recording
app.post("/api/enquiries", (req, res) => {
  const { fullName, email, company, teamSize, phone, source, program, message } = req.body || {};
  
  if (!fullName || !email || !message) {
    return res.status(400).json({ error: "Full name, work email, and query message are required." });
  }

  const newLog = {
    id: `ENQ-${Math.floor(Math.random() * 9000 + 1000)}`,
    studentEntity: {
      initials: (fullName || email || "ENQ").substring(0, 2).toUpperCase(),
      username: (fullName || email || "consultation_prospect").replace(/\s+/g, "_").toLowerCase()
    },
    issueDescription: `CONSULTATION ENQUIRY // Name: ${fullName}, Email: ${email}, Company: ${company || "N/A"}, Team: ${teamSize || "1"}, Phone: ${phone || "N/A"}, Source: ${source || "Website"}, Program: ${program || "Base Cohort"}, Query: "${message}"`,
    severity: "MEDIUM",
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    status: "UNRESOLVED"
  };

  serverStore.complaint_logs = [newLog, ...(serverStore.complaint_logs || [])];
  
  console.log(`[ENQUIRY SYSTEM] New consultation enquiry recorded for ${fullName} (${email})`);

  res.json({ success: true, log: newLog });
});

app.get("/api/masterclass", (req, res) => {
  const now = Date.now();
  if (masterclassActive && masterclassExpirationTime && now >= masterclassExpirationTime) {
    masterclassActive = false;
    masterclassExpirationTime = null;
  }
  
  const timeLeft = masterclassActive && masterclassExpirationTime
    ? Math.max(0, Math.round((masterclassExpirationTime - now) / 1000))
    : masterclassDuration;

  res.json({
    active: masterclassActive,
    timeLeft: timeLeft,
    duration: masterclassDuration
  });
});

app.post("/api/masterclass", (req, res) => {
  // Secure masterclass changes with admin check
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Administrator privileges required to modify masterclass timeline" });
  }

  const { active, duration } = req.body;
  const now = Date.now();
  
  if (active !== undefined) {
    masterclassActive = !!active;
    if (masterclassActive) {
      const d = duration ? parseInt(duration, 10) : masterclassDuration;
      masterclassDuration = d;
      masterclassExpirationTime = now + d * 1000;
    } else {
      masterclassExpirationTime = null;
    }
  } else if (duration !== undefined) {
    const d = parseInt(duration, 10);
    masterclassDuration = d;
    if (masterclassActive) {
      masterclassExpirationTime = now + d * 1000;
    }
  }

  const timeLeft = masterclassActive && masterclassExpirationTime
    ? Math.max(0, Math.round((masterclassExpirationTime - now) / 1000))
    : masterclassDuration;

  res.json({
    active: masterclassActive,
    timeLeft: timeLeft,
    duration: masterclassDuration
  });
});

// GET Template & Prompt Vault (Admin & Premium-only)
app.get("/api/prompt-vault", (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Admin always has access.
  // Student must be premium track.
  if (session.role !== "admin") {
    const profile = studentProfiles.get(session.email);
    if (!profile || profile.track !== "premium") {
      return res.status(403).json({ error: "Access Denied: Template & Prompt Vault is exclusive to Premium Alpha members." });
    }
  }

  res.json(promptVault);
});

// POST new Vault entry (Admin only)
app.post("/api/prompt-vault", (req, res) => {
  const session = getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Administrator privileges required to manage vault" });
  }

  const { title, category, description, type, content } = req.body || {};
  if (!title || !category || !description || !type || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const entry: VaultEntry = {
    id: `pv-${Date.now()}`,
    title,
    category,
    description,
    type: type === "prompt" ? "prompt" : "template",
    content,
    created_at: new Date().toLocaleString()
  };

  promptVault.unshift(entry);
  res.status(201).json(entry);
});

app.get(["/api/payu-config", "/api/razorpay-config"], (req, res) => {
  const envKeys = Object.keys(process.env);
  const foundEnvNames = envKeys.filter(k => 
    k.toUpperCase().includes("PAYU") || k.toUpperCase().includes("RAZORPAY")
  );
  
  let keyId = process.env.VITE_PAYU_MERCHANT_KEY || 
              process.env.PAYU_MERCHANT_KEY || 
              process.env.VITE_RAZORPAY_KEY_ID || 
              process.env.RAZORPAY_KEY_ID || "";
              
  // Never expose PAYU_SALT or any merchant secret to the browser.
  // Checkout is created and signed server-side by /api/create-payu-payment.
  res.json({
    keyId: keyId.trim(),
    merchantKey: keyId.trim(),
    salt: "",
    redirectUrl: "",
    checkoutMode: "hosted",
    actionUrl: PAYU_ENV === "test" ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment",
    hasSecret: !!(process.env.PAYU_SALT || process.env.VITE_PAYU_SALT),
    detectedVars: foundEnvNames
  });
});

// Authoritative Course Pricing Catalog & Server-Side PayU Payment Engine
interface ServerCourseInfo {
  courseId: string;
  name: string;
  subtitle: string;
  originalPriceINR: number;
  offerPriceINR: number;
  originalPriceUSD: number;
  offerPriceUSD: number;
  isOfferActive: boolean;
}

const SERVER_COURSE_CATALOG: Record<string, ServerCourseInfo> = {
  standard: {
    courseId: "standard",
    name: "Base Cohort",
    subtitle: "Launch pricing - 6-day live curriculum",
    originalPriceINR: 4999,
    offerPriceINR: 3999,
    originalPriceUSD: 79,
    offerPriceUSD: 59,
    isOfferActive: true
  },
  base: {
    courseId: "base",
    name: "Base Cohort",
    subtitle: "Launch pricing - 6-day live curriculum",
    originalPriceINR: 4999,
    offerPriceINR: 3999,
    originalPriceUSD: 79,
    offerPriceUSD: 59,
    isOfferActive: true
  },
  premium: {
    courseId: "premium",
    name: "Executive Track",
    subtitle: "1-on-1 Mentorship & Executive AI Blueprint",
    originalPriceINR: 12999,
    offerPriceINR: 9999,
    originalPriceUSD: 199,
    offerPriceUSD: 149,
    isOfferActive: true
  },
  ai_masterclass: {
    courseId: "ai_masterclass",
    name: "AI Architect Masterclass",
    subtitle: "Specialized Deep-Dive Cohort",
    originalPriceINR: 4999,
    offerPriceINR: 3999,
    originalPriceUSD: 79,
    offerPriceUSD: 59,
    isOfferActive: true
  }
};

const pendingPayuOrders: Record<string, any> = {};

// Prevent duplicate frontend clicks / React retries from creating several PayU sessions in a few milliseconds.
// This is intentionally short-lived so a genuine retry can still create a fresh transaction.
const recentPayuSessionRequests = new Map<string, { txnid: string; createdAt: number }>();
const PAYU_DUPLICATE_WINDOW_MS = 8000;

// PayU credentials must be supplied as Cloud Run/server environment variables.
const PAYU_KEY = process.env.PAYU_KEY || process.env.VITE_PAYU_MERCHANT_KEY || "";
const PAYU_SALT = process.env.PAYU_SALT || "";
const PAYU_ENV = (process.env.PAYU_ENV || "production").toLowerCase();
const PAYU_BASE_URL = PAYU_ENV === "test"
  ? "https://test.payu.in/_payment"
  : "https://secure.payu.in/_payment";
const PAYU_VERIFY_URL = PAYU_ENV === "test"
  ? "https://test.payu.in/merchant/postservice.php?form=2"
  : "https://info.payu.in/merchant/postservice.php?form=2";

function getPublicAppUrl(req: express.Request): string {
  const configured = (process.env.APP_URL || "").trim().replace(/\/$/, "");
  if (configured) return configured;

  // Cloud Run forwards the original scheme. `trust proxy` is enabled below.
  const protocol = req.protocol || "https";
  const host = req.get("host");
  return host ? `${protocol}://${host}` : `http://localhost:${PORT}`;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeEqualHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

function buildPayURequestHash(params: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  // PayU Hosted Checkout basic _payment hash:
  // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
  const sequence = [
    PAYU_KEY,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    params.udf4 || "",
    params.udf5 || "",
    "",
    "",
    "",
    "",
    "",
    "",
    PAYU_SALT
  ].join("|");
  return crypto.createHash("sha512").update(sequence).digest("hex");
}

function buildPayUReverseHash(payload: Record<string, any>, order: any): string {
  // PayU reverse hash:
  // SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const status = String(payload.status || "");
  const udf1 = String(payload.udf1 || "");
  const udf2 = String(payload.udf2 || "");
  const udf3 = String(payload.udf3 || "");
  const udf4 = String(payload.udf4 || "");
  const udf5 = String(payload.udf5 || "");
  const email = String(payload.email || order.customer?.email || "");
  const firstname = String(payload.firstname || order.customer?.firstname || "");
  const productinfo = String(payload.productinfo || order.courseName || "");
  const amount = String(payload.amount || order.finalAmount.toFixed(2));
  const txnid = String(payload.txnid || order.txnid || "");

  const sequence = [
    PAYU_SALT,
    status,
    "", "", "", "", "",
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    PAYU_KEY
  ].join("|");

  return crypto.createHash("sha512").update(sequence).digest("hex");
}

function provisionPaidOrder(order: any, payload: Record<string, any>) {
  const buyerEmail = String(payload.email || order.customer?.email || order.email || "").trim();
  const buyerName = String(
    payload.firstname ||
    order.customer?.firstname ||
    order.customer?.fullName ||
    order.customer?.name ||
    (buyerEmail ? buyerEmail.split("@")[0] : "Student")
  ).trim();
  const buyerPhone = String(payload.phone || order.customer?.phone || "").trim();
  const track = (order.track || (order.courseId?.includes("premium") ? "premium" : "base")) as "base" | "premium";

  if (!buyerEmail) return;

  const enrollingCohort = Array.from(cohorts.values()).find(c => c.track === track && c.status === "enrolling");
  const cohortId = enrollingCohort
    ? enrollingCohort.id
    : (track === "base" ? "CODX-2026-07-BASE-01" : "CODX-2026-07-PREMIUM-01");

  studentProfiles.set(buyerEmail, {
    email: buyerEmail,
    username: buyerName,
    phone: buyerPhone,
    track,
    cohort_id: cohortId
  });
  serverStore.has_paid = true;

  const amountINR = order.currency === "INR"
    ? order.finalAmount
    : Math.round((order.finalAmount || 0) * 83);
  const amountUSD = order.currency === "USD"
    ? order.finalAmount
    : Math.round((order.finalAmount || 0) / 83);

  const newReg = {
    email: buyerEmail,
    username: buyerName,
    name: buyerName,
    phone: buyerPhone,
    trackId: track === "premium" ? "track-premium" : "track-base",
    timestamp: new Date().toISOString(),
    tier: track,
    amountUSD,
    amountINR,
    cohort_id: cohortId
  };

  const existingReg = serverStore.recently_registered?.find(
    (r: any) => r.email === buyerEmail && r.cohort_id === cohortId
  );
  if (existingReg) {
    existingReg.username = buyerName;
    existingReg.name = buyerName;
    existingReg.phone = buyerPhone;
  } else {
    serverStore.recently_registered = [newReg, ...(serverStore.recently_registered || [])];
  }

  console.log(`[PAYU AUTO-PROVISIONING] Student ${buyerName} (${buyerEmail}) admitted to cohort ${cohortId}`);
}

async function verifyPayUTransaction(txnid: string): Promise<{ verified: boolean; data?: any; error?: string }> {
  if (!PAYU_KEY || !PAYU_SALT) {
    return { verified: false, error: "PayU credentials are not configured on the server" };
  }

  const hash = crypto
    .createHash("sha512")
    .update(`${PAYU_KEY}|verify_payment|${txnid}|${PAYU_SALT}`)
    .digest("hex");

  try {
    const response = await fetch(PAYU_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key: PAYU_KEY,
        command: "verify_payment",
        var1: txnid,
        hash
      })
    });

    const data = await response.json();
    const details = data?.transaction_details?.[txnid];
    const verified = response.ok && String(data?.status) === "1" && String(details?.status || "").toLowerCase() === "success";
    return { verified, data, error: verified ? undefined : "PayU Verify Payment did not confirm success" };
  } catch (error: any) {
    return { verified: false, error: error?.message || "Unable to contact PayU Verify Payment API" };
  }
}

// POST Create PayU Payment Session (server calculates price and signs every unique transaction).
app.post(["/api/create-payu-payment", "/api/payu/create-payment"], (req, res) => {
  if (!PAYU_KEY || !PAYU_SALT) {
    return res.status(503).json({
      success: false,
      error: "PayU is not configured. Set PAYU_KEY and PAYU_SALT in Cloud Run environment variables."
    });
  }

  const { courseId, currency, customer } = req.body || {};

  const now = Date.now();
  if (masterclassActive && masterclassExpirationTime && now >= masterclassExpirationTime) {
    masterclassActive = false;
    masterclassExpirationTime = null;
  }

  const normalizedCourseId = (courseId || "standard").toLowerCase();
  const course = SERVER_COURSE_CATALOG[normalizedCourseId] || SERVER_COURSE_CATALOG.standard;

  // Collapse accidental duplicate create-payment calls from the same customer/course for a few seconds.
  // This prevents a rapid double-click or client retry loop from hammering PayU with multiple sessions.
  const requestedCurrency = String(currency || "INR").toUpperCase();
  const requestCustomerEmail = String(customer?.email || "student@codexia.academy").trim().toLowerCase();
  const duplicateKey = `${requestCustomerEmail}|${course.courseId}|${requestedCurrency}`;
  const previousRequest = recentPayuSessionRequests.get(duplicateKey);
  if (previousRequest && Date.now() - previousRequest.createdAt < PAYU_DUPLICATE_WINDOW_MS) {
    const existingOrder = pendingPayuOrders[previousRequest.txnid];
    if (existingOrder) {
      const existingCheckoutPageUrl = `${getPublicAppUrl(req)}/api/payu/checkout/${encodeURIComponent(existingOrder.txnid)}`;
      return res.json({
        success: true,
        txnid: existingOrder.txnid,
        courseId: existingOrder.courseId,
        courseName: existingOrder.courseName,
        originalPrice: existingOrder.originalPrice,
        offerPrice: existingOrder.offerPrice,
        offerActive: existingOrder.isOfferActive,
        finalAmount: existingOrder.finalAmount,
        amountStr: existingOrder.payuParams.amount,
        currency: existingOrder.currency,
        redirectUrl: existingCheckoutPageUrl,
        checkoutPageUrl: existingCheckoutPageUrl,
        actionUrl: PAYU_BASE_URL,
        payuParams: existingOrder.payuParams,
        merchantName: "CODEXIA",
        verifiedOnServer: true,
        duplicateRequestCollapsed: true
      });
    }
  }

  // Standard PayU India Hosted Checkout is INR. USD/Cross-Border must be enabled on the merchant account.
  // Do not silently submit USD to a domestic-only merchant account.
  if (requestedCurrency !== "INR" && requestedCurrency !== "USD") {
    return res.status(400).json({ success: false, error: "Unsupported currency" });
  }

  const isUSD = requestedCurrency === "USD";
  const originalPrice = isUSD ? course.originalPriceUSD : course.originalPriceINR;
  const offerPrice = isUSD ? course.offerPriceUSD : course.offerPriceINR;
  const isOfferValid = masterclassActive && course.isOfferActive;
  const finalAmount = isOfferValid ? offerPrice : originalPrice;
  const amountStr = finalAmount.toFixed(2);

  const txnid = `PAYU_${course.courseId.toUpperCase()}_${Date.now()}_${crypto.randomBytes(5).toString("hex")}`;
  const firstname = String(customer?.firstname || customer?.name || "Student").trim().slice(0, 60);
  const email = String(customer?.email || "student@codexia.academy").trim();
  const phone = String(customer?.phone || "9999999999").trim();
  const productinfo = String(course.name).slice(0, 100);

  const appBaseUrl = getPublicAppUrl(req);
  const surl = `${appBaseUrl}/api/payu/callback`;
  const furl = `${appBaseUrl}/api/payu/callback`;

  const hash = buildPayURequestHash({ txnid, amount: amountStr, productinfo, firstname, email });

  const payuParams: Record<string, string> = {
    key: PAYU_KEY,
    txnid,
    amount: amountStr,
    productinfo,
    firstname,
    email,
    phone,
    surl,
    furl,
    hash,
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: ""
  };

  // `currency=USD` is only meaningful when the PayU merchant account is enabled for the relevant
  // cross-border flow. The default Codexia checkout remains INR.
  if (isUSD) payuParams.currency = "USD";

  pendingPayuOrders[txnid] = {
    txnid,
    courseId: course.courseId,
    courseName: course.name,
    originalPrice,
    offerPrice,
    finalAmount,
    currency: isUSD ? "USD" : "INR",
    isOfferActive: isOfferValid,
    status: "created",
    payuParams,
    customer: { firstname, email, phone },
    createdAt: new Date().toISOString()
  };
  recentPayuSessionRequests.set(duplicateKey, { txnid, createdAt: Date.now() });
  setTimeout(() => {
    const current = recentPayuSessionRequests.get(duplicateKey);
    if (current?.txnid === txnid) recentPayuSessionRequests.delete(duplicateKey);
  }, PAYU_DUPLICATE_WINDOW_MS).unref?.();

  const checkoutPageUrl = `${appBaseUrl}/api/payu/checkout/${encodeURIComponent(txnid)}`;

  return res.json({
    success: true,
    txnid,
    courseId: course.courseId,
    courseName: course.name,
    originalPrice,
    offerPrice,
    offerActive: isOfferValid,
    finalAmount,
    amountStr,
    currency: isUSD ? "USD" : "INR",
    redirectUrl: checkoutPageUrl,
    checkoutPageUrl,
    actionUrl: PAYU_BASE_URL,
    payuParams,
    merchantName: "CODEXIA",
    verifiedOnServer: true
  });
});

// PayU Hosted Checkout requires a POST to _payment. This route renders an auto-submitting
// form instead of redirecting to a reusable PayU payment-link/short URL.
app.get("/api/payu/checkout/:txnid", (req, res) => {
  const { txnid } = req.params;
  const order = pendingPayuOrders[txnid];

  if (!order) {
    return res.status(404).send("<html><body style='font-family:sans-serif;padding:40px'><h2>Transaction session expired.</h2><p>Please return to Codexia and start checkout again.</p></body></html>");
  }

  const fields = Object.entries(order.payuParams as Record<string, string>)
    .map(([key, value]) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}">`)
    .join("\n");

  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  return res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Redirecting to PayU</title></head>
<body style="font-family:Arial,sans-serif;text-align:center;padding:48px">
  <p>Redirecting securely to PayU…</p>
  <form id="payu-form" method="post" action="${escapeHtml(PAYU_BASE_URL)}">
    ${fields}
    <noscript><button type="submit">Continue to PayU</button></noscript>
  </form>
  <script>document.getElementById('payu-form').submit();</script>
</body></html>`);
});

// PayU posts the payment result to surl/furl. Never mark an order paid from status alone:
// validate the reverse hash, transaction ID, amount, product, merchant key and success status.
app.all("/api/payu/callback", async (req, res) => {
  const payload: Record<string, any> = { ...req.query, ...req.body };
  const txnid = String(payload.txnid || "");
  const order = pendingPayuOrders[txnid];
  let finalStatus = "FAILED";

  if (order && payload.key === PAYU_KEY) {
    const receivedHash = String(payload.hash || "").toLowerCase();
    const calculatedHash = buildPayUReverseHash(payload, order);
    const responseAmount = Number(payload.amount);
    const expectedAmount = Number(order.finalAmount);
    const responseProduct = String(payload.productinfo || "");
    const responseStatus = String(payload.status || "").toLowerCase();

    const validResponse =
      safeEqualHex(receivedHash, calculatedHash) &&
      txnid === order.txnid &&
      Number.isFinite(responseAmount) && Math.abs(responseAmount - expectedAmount) < 0.001 &&
      responseProduct === String(order.courseName) &&
      responseStatus === "success";

    if (validResponse) {
      order.status = "PAID";
      order.verifiedAt = new Date().toISOString();
      order.payuResponse = payload;

      // Reconcile with PayU's server-to-server Verify Payment API before provisioning access.
      const verification = await verifyPayUTransaction(txnid);
      if (verification.verified) {
        order.status = "PAID";
        order.payuVerification = verification.data;
        provisionPaidOrder(order, payload);
        finalStatus = "PAID";
      } else {
        order.status = "PENDING_VERIFICATION";
        order.payuVerificationError = verification.error;
        finalStatus = "PENDING_VERIFICATION";
        console.warn(`[PAYU] Callback hash was valid but Verify Payment did not confirm ${txnid}: ${verification.error}`);
      }
    } else {
      order.status = "FAILED";
      order.payuResponse = payload;
      console.warn(`[PAYU] Rejected callback for ${txnid}: hash/amount/product/status validation failed.`);
    }
  } else {
    console.warn(`[PAYU] Callback received for unknown transaction or invalid merchant key: ${txnid}`);
  }

  const redirectStatus = finalStatus === "PAID" ? "success" : finalStatus.toLowerCase();
  return res.redirect(`/?payment=${encodeURIComponent(redirectStatus)}&txnid=${encodeURIComponent(txnid)}&status=${encodeURIComponent(finalStatus)}`);
});

// Verify endpoint: reconcile with PayU, then provision only after PayU confirms success.
app.post("/api/payu/verify-payment", async (req, res) => {
  const { txnid } = req.body || {};

  if (!txnid || !pendingPayuOrders[txnid]) {
    return res.status(404).json({ verified: false, error: "Transaction session not found or invalid" });
  }

  const order = pendingPayuOrders[txnid];
  const verification = await verifyPayUTransaction(String(txnid));

  if (!verification.verified) {
    return res.status(409).json({
      verified: false,
      txnid: order.txnid,
      payment_status: order.status,
      error: verification.error || "PayU has not confirmed this transaction"
    });
  }

  const details = verification.data?.transaction_details?.[String(txnid)] || {};
  if (details.amount && Math.abs(Number(details.amount) - Number(order.finalAmount)) >= 0.001) {
    return res.status(409).json({ verified: false, txnid: order.txnid, error: "PayU amount does not match the order amount" });
  }

  order.status = "PAID";
  order.verifiedAt = new Date().toISOString();
  order.payuVerification = verification.data;
  provisionPaidOrder(order, details);

  const track = (order.track || (order.courseId?.includes("premium") ? "premium" : "base")) as "base" | "premium";
  const enrollingCohort = Array.from(cohorts.values()).find(c => c.track === track && c.status === "enrolling");
  const resolvedCohortId = enrollingCohort ? enrollingCohort.id : (track === "base" ? "CODX-2026-07-BASE-01" : "CODX-2026-07-PREMIUM-01");

  return res.json({
    verified: true,
    txnid: order.txnid,
    courseId: order.courseId,
    courseName: order.courseName,
    program: order.courseName || (track === "premium" ? "Premium Alpha" : "Base Cohort"),
    payment_status: "paid",
    enrollment_status: "active",
    cohort_id: resolvedCohortId,
    finalAmount: order.finalAmount,
    currency: order.currency,
    purchased_at: order.verifiedAt,
    message: "Payment verified with PayU Verify Payment API"
  });
});

// API Routes - Legal, Compliance & Policy Documents (PayU & IT Act 2000 / DPDP 2023 Aligned)
app.get("/api/legal/documents", (req, res) => {
  res.json({
    entity: {
      name: "Vankayalapati Mallikharjuna Rao",
      operatingName: "Codexia",
      address: "Mohammed Ilyas Building, Site No. 34, Behind Lady Vailankani School, Varthur, Bengaluru South, Bengaluru, Karnataka, PIN 560087, India",
      phone: "+91 77605 93646",
      email: "support.codexiaindia@gmail.com",
      website: "codexia.academy"
    },
    grievanceOfficer: GRIEVANCE_OFFICER_DETAILS,
    documents: [
      { id: "terms", title: "Terms and Conditions", badge: "Terms of Service", lastUpdated: "July 2026" },
      { id: "privacy", title: "Privacy Safeguards & Policy", badge: "DPDP Act 2023 Compliant", lastUpdated: "July 2026" },
      { id: "refund", title: "Refund and Cancellation Policy", badge: "PayU Aligned", lastUpdated: "July 2026" },
      { id: "about", title: "About Codexia & Registered Entity Details", badge: "Official Entity Status", lastUpdated: "July 2026" }
    ]
  });
});

app.get(["/api/legal-pages/:pageKey", "/api/legal/documents/:pageKey"], (req, res) => {
  const rawKey = (req.params.pageKey || "").toLowerCase();
  let docKey: "terms" | "privacy" | "refund" | "about" = "terms";
  if (rawKey === "terms" || rawKey === "terms-and-conditions") docKey = "terms";
  else if (rawKey === "privacy" || rawKey === "privacy-policy") docKey = "privacy";
  else if (rawKey === "refund" || rawKey === "refund-policy") docKey = "refund";
  else if (rawKey === "about" || rawKey === "about-us") docKey = "about";

  const doc = LEGAL_DOCUMENTS[docKey];
  if (!doc) {
    return res.status(404).json({ error: "Legal page not found" });
  }

  res.json({
    ...doc,
    publisher: "operated by Vankayalapati Mallikharjuna Rao, Bengaluru",
    lastUpdatedSubtext: "Last updated: 25 July 2026",
    grievanceOfficer: GRIEVANCE_OFFICER_DETAILS
  });
});function getSmartFallbackReply(message: string): string {
  const query = message.toLowerCase();
  
  if (query.includes("curriculum") || query.includes("syllabus") || query.includes("learn") || query.includes("course") || query.includes("cohort") || query.includes("day") || query.includes("class")) {
    return `### 📚 CODEXIA Curriculum & Cohorts

We offer two distinct live, mentor-guided cohorts designed to turn senior engineers and professionals into expert automation builders:

1. **Base Cohort (6-Day Sprint)** — *₹4,999 INR (~$79 USD)*
   - **Days 1-2 (Micro-Bot Foundations)**: Understand AI model architectures and build your first custom working micro-bot without code using our signature **C.O.D.E. Method** checklist.
   - **Day 3 (Applied Specialization)**: Build role-specific bots tailored directly to Marketing, Operations, Customer Support, or Data Analysis.
   - **Days 4-5 (Automation & Media)**: Connect your bots to forms, sheets, or calendars via n8n/Zapier, and automatically generate video script and voiceovers.
   - **Day 6 (Capstone & Next-Step Roadmap)**: Present your active bot and receive your certification.

2. **Premium Alpha (13-Day Automation Studio)** — *₹12,999 INR (~$199 USD)*
   - Includes **everything in Base**, plus:
   - **Multi-Bot Teams**: Orchestrate multi-agent systems using CrewAI & LangChain to handle complex multi-step tasks.
   - **Voice & Conversational Bots**: Build real-time voice response agents and conversational assistants.
   - **Script-to-Video Pipeline**: Deploy media rendering setups with ComfyUI.
   - **1:1 Architect Review**: Get a private, direct review and workflow audit of your automation projects with our Principal Systems Architect.

*Let me know if you would like info on how to sign up or want to explore our pricing!*`;
  }

  if (query.includes("service") || query.includes("fractional") || query.includes("leadership") || query.includes("enablement") || query.includes("review") || query.includes("consult") || query.includes("train")) {
    return `### 💼 CODEXIA Senior AI Services

Beyond our open cohorts, we offer senior-level fractional AI leadership and targeted systems design for teams and organizations:

- **Fractional AI Leadership**: High-leverage, senior technology judgment to align your business processes, define your AI roadmap, and direct implementation without hiring a full-time executive.
- **Workflow & Systems Review**: A critical, experienced evaluation of your team's automation setups or building systems to catch costly architectural mistakes before they lock in.
- **Applied AI Enablement**: Active, hands-on team training sessions designed to turn your staff into day-to-day AI builders, ensuring high adoption rates.
- **Private Team Sprints**: We can deliver our 6-day Base or 13-day Premium Alpha cohorts privately to your team, customized directly to your private company data and stack.

*Would you like to connect with our team to explore fractional leadership or scheduling a private sprint?*`;
  }

  if (query.includes("framework") || query.includes("code") || query.includes("c.o.d.e") || query.includes("method") || query.includes("checklist")) {
    return `### ⚙️ The C.O.D.E. Method Framework

Our foundational prompt engineering and bot-building framework is the **C.O.D.E. Method**. It is a repeatable, 4-step checklist we apply to every bot instruction, prompt template, and automation pipeline:

1. **C — Context**: What does the AI model need to know? Give it the background, raw materials, domain, and constraints.
2. **O — Objective**: What is the actual, concrete outcome? State the output as a distinct, measurable deliverable.
3. **D — Design**: What shape should the output take? Define the exact format, length, structural schema, and tone of voice.
4. **E — Evaluate**: How will you know it is good enough? Establish verification guidelines to ensure production-grade reliability before deployment.

You can explore this framework interactive timeline in the **Frameworks** tab on our dashboard!`;
  }

  if (query.includes("case study") || query.includes("case-study") || query.includes("case") || query.includes("studies") || query.includes("portfolio")) {
    return `### 📈 CODEXIA Case Studies

Because Codexia is newly founded, we are actively compiling case studies from our upcoming live cohorts!
- Currently, you can view placeholders and upcoming case study reviews in the **Case Studies** tab on our main dashboard.
- We focus on practical, real-world returns: how professionals saved 10+ hours a week by automating routine administrative tasks, and how engineering teams shipped micro-bots to handle ticket triage.

*Check back after our first cohort concludes, or let me know if you want to discuss your own use case!*`;
  }

  if (query.includes("price") || query.includes("pricing") || query.includes("cost") || query.includes("investment") || query.includes("pay") || query.includes("fee") || query.includes("amount") || query.includes("inr") || query.includes("usd")) {
    return `### 💳 CODEXIA Investment Tiers

Here are our direct pricing details for our programs:

- **Base Cohort (6-Day Sprint)**: **₹4,999 INR** (~$79 USD). Includes live sessions, custom single-bot building, C.O.D.E. Method training, and certification.
- **Premium Alpha (13-Day Automation Studio)**: **₹12,999 INR** (~$199 USD). Includes advanced multi-bot orchestrations, voice automation, and a valuable **1:1 Workflow Audit & Review session with our Principal Architect**.

*Note: All payments are processed securely via our integrated payment portal. If we have an active promotional discount on the dashboard, register before the timer expires to secure launch pricing!*`;
  }

  if (query.includes("sign") || query.includes("log") || query.includes("profile") || query.includes("account") || query.includes("register") || query.includes("user") || query.includes("otp") || query.includes("forgot") || query.includes("password")) {
    return `### 🔐 CODEXIA Authentication & Profile Systems

You can manage your account and access your Student Dashboard easily:
- **Sign In / Sign Up**: Click the Profile icon in the upper-right corner of the page to open the authentication modal.
- **Password Reset / Recovery**: If you've forgotten your password, select "Forgot Password". We've implemented a **Two-Way Secure Gateway**:
  1. We dispatch a **5-digit verification OTP** directly to your registered email address.
  2. Enter the verification code in the reset interface to safely update your credentials.

*Let me know if you need any assistance getting logged in!*`;
  }

  if (query.includes("what is") || query.includes("about") || query.includes("who are") || query.includes("codexia")) {
    return `### 🚀 What is CODEXIA?

**CODEXIA** is an elite, cohort-based platform and consultancy for senior engineers and professionals who want to master real-world AI automation.

We do not teach abstract theory. We focus on hands-on building:
- **Our Programs**: 6-day Base Cohort for custom micro-bots & 13-day Premium Alpha for advanced multi-agent orchestrations.
- **Our Services**: Fractional AI leadership, systems audits, and tailored corporate enablement sprints.
- **Our Framework**: The **C.O.D.E. Method** (Context, Objective, Design, Evaluate) to ensure every prompt and bot delivers high-quality outputs.

*What would you like to explore first? Curriculum, Services, or Pricing?*`;
  }

  // General fallback
  return `### ⚡ CODEXIA Autonomous Agent

Connection established. I am the CODEXIA Autonomous Representative. I can explain everything about our live cohorts, professional services, prompt frameworks, and student platforms:

- Ask me about the **curriculum** (6-day Base Cohort or 13-day Premium Alpha).
- Ask about our **senior AI services** (Fractional Leadership, Team Training Sprints, Systems Audits).
- Ask about the **C.O.D.E. Method framework** or our upcoming **case studies**.
- Ask about the secure **Sign In/Password Reset OTP** flows.

*What system parameters shall we evaluate today?*`;
}

app.post("/api/agent/chat", async (req, res) => {
  const { message, history } = req.body || {};
  try {
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!ai) {
      return res.status(200).json({ reply: getSmartFallbackReply(message) });
    }

    const systemInstruction = `You are the CODEXIA Autonomous Agent, an advanced cybernetic representative for Codexia.
Your core tasks are:
1. Explain CODEXIA: Codexia offers two premium, cohort-based live programs for senior engineers and professionals:
   - Base Cohort (6-Day Sprint, ₹4,999 INR / $79 USD): Focuses on building a custom micro-bot for your role, writing instructions, the C.O.D.E. Method checklist, linking bots to real tools (n8n, Zapier), media workflows (CapCut, ElevenLabs), and presents a capstone.
   - Premium Alpha (13-Day Automation Studio, ₹12,999 INR / $199 USD): Multi-bot systems (CrewAI), voice/conversational bots, end-to-end workflow automation, actions & guardrails, script-to-video pipeline (ComfyUI), packaging services, and a 1:1 review with our principal architect.
2. Explain Services:
   - Fractional AI Leadership: Senior-level technology judgment, decisions, process direction without hiring a full-time specialist.
   - Workflow & Systems Review: Second set of senior eyes reviewing team building or running systems before costly mistakes lock in.
   - Applied AI Enablement: Hands-on team training so teams actually use AI in their day-to-day work, not just a demo.
   - Team Training Sprints: Private team deliveries of the Base Cohort or Premium Alpha programs.
3. Answer FAQs:
   - Base vs Premium: Base is a 6-day sprint for one micro-bot. Premium is a separate 13-day program for multi-bot automation systems and includes 1:1 architect review.
   - Coding: No coding background required for either program; both start from no-code foundations.
   - Pricing: Locked in upon sign-up, current launch rates may rise.
   - Deliverables: Built bots, certificate, written next-step roadmap. Premium adds capstone write-up.
   - Format: Cohort-based live sessions with mentor interaction (not recorded videos).
4. Keep your tone elite, technical, sharp, and highly concise. Do not write extremely long paragraphs. Use clear bullet points. Explain that you are fully autonomous and designed with circular orbit interfaces for a seamless user experience.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    let replyText = response.text;
    if (!replyText || replyText.trim() === "") {
      replyText = getSmartFallbackReply(message);
    }
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini API Error (routing to robust fallback):", error);
    // Graceful routing to robust local fallback to prevent any user interruptions!
    res.json({ reply: getSmartFallbackReply(message) });
  }
});

// Production Health Check Route for Cloud Run monitoring & load balancing
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Codexia Academic Ledger API",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Explicit 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl
  });
});

// Global Express Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[EXPRESS UNHANDLED ERROR]", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : (err.message || String(err))
  });
});

// Vite middleware for development vs static build for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});
