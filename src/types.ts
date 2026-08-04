export interface SyllabusDay {
  id: string;
  dayNumber: string;
  title: string;
  description?: string;
  highlights?: string[];
  bullets?: string[];
  tools?: string;
  durationHours?: number;
  timing?: string;
}

export interface PricingTier {
  id: "standard" | "premium";
  name: string;
  subtitle: string;
  priceINR: number;
  priceUSD: number;
  features: string[];
  isPremium: boolean;
}

export interface WebinarMetrics {
  activeRegistrations: number;
  waitlist: number;
  conversionRate: number;
  capacityPercentage: number;
}

export interface FinancialMetrics {
  totalGrossUSD: number;
  totalGrossINR: number;
  avgOrderValueUSD: number;
  chartData: {
    day: string;
    amount: number;
    isHighlighted?: boolean;
  }[];
}

export interface ComplaintLog {
  id: string;
  studentEntity: {
    initials: string;
    username: string;
  };
  issueDescription: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  timestamp: string;
  status: "UNRESOLVED" | "INVESTIGATING" | "RESOLVED";
}

export interface MeetingReservation {
  id: string;
  studentName: string;
  studentEmail: string;
  dateTime: string;
  topic: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  isMeetingScheduler?: boolean;
}

export interface StudentFeedback {
  id: string;
  rating: number;
  comment: string;
  timestamp: string;
  username: string;
}

export interface CohortDocument {
  id?: string;
  name: string;
  file_url: string;
  fileName?: string;
  mimeType?: string;
  uploaded_at: string;
}

export interface Cohort {
  id: string;
  name: string;
  track: "base" | "premium";
  repo_url: string;
  documents: CohortDocument[];
  next_session_at?: string;
  active_briefing_topic?: string;
  live_meet_url?: string;
  year: number;
  month: number;
  sequence: number;
  start_date: string;
  end_date: string;
  status: "draft" | "enrolling" | "active" | "completed" | "archived";
  syllabus_status?: Record<string, "upcoming" | "active" | "completed">;
  capacity?: number;
}

export interface StudentProfile {
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

export interface GeneratedCertificate {
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

export interface VaultEntry {
  id: string;
  title: string;
  category: "Marketing" | "Operations" | "Support" | "Analyst" | string;
  description: string;
  type: "prompt" | "template";
  content: string; // prompt text or template download URL
  created_at: string;
}

