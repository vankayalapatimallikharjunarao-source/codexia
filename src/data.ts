import { SyllabusDay, PricingTier, ComplaintLog } from "./types";

export const initialSyllabus: SyllabusDay[] = [
  {
    id: "day-1",
    dayNumber: "01",
    title: "AI Basics & the Micro-Bot Idea",
    description: "A plain-language walkthrough of how a model turns a prompt into an answer — enough to use AI with real confidence, not a lecture on math",
    highlights: [
      "AI walkthrough without math",
      "Focused micro-bots vs giant models",
      "Mapping repetitive jobs to bots"
    ],
    bullets: [
      "A plain-language walkthrough of how a model turns a prompt into an answer — enough to use AI with real confidence, not a lecture on math",
      "Why one small, focused micro-bot built for a single task usually beats one giant do-everything assistant",
      "Mapping your own week: which repetitive parts of your job could become a micro-bot"
    ],
    tools: "ChatGPT, Claude, Google AI Studio (Gemini) — free tiers",
    durationHours: 2,
    timing: "10:00 AM - 12:00 PM"
  },
  {
    id: "day-2",
    dayNumber: "02",
    title: "Building Your First Micro-Bot",
    description: "Hands-on build of a working micro-bot using Custom GPTs or Gems — no code required",
    highlights: [
      "Build a custom GPT or Gem",
      "Write reliable instructions",
      "Intro to C.O.D.E. Method checklist"
    ],
    bullets: [
      "Hands-on build of a working micro-bot using Custom GPTs or Gems — no code required",
      "Writing instructions that keep the bot reliable and on-topic every time, not just on the first try",
      "Introduction to the C.O.D.E. Method (Context → Objective → Design → Evaluate) — the four-question checklist you'll use every time you write or refine instructions for any bot"
    ],
    tools: "Custom GPTs, Google Gems",
    durationHours: 2.5,
    timing: "10:00 AM - 12:30 PM"
  },
  {
    id: "day-3",
    dayNumber: "03",
    title: "Micro-Bots for Your Profession",
    description: "Role-specific build session for marketers, ops/admin, support teams, and analysts",
    highlights: [
      "Role-specific custom bot build",
      "Content/caption, meeting-notes, or FAQ bots",
      "Direct professional application"
    ],
    bullets: [
      "Role-specific build session: marketers build a content/caption bot, ops/admin build a meeting-notes or task-tracker bot, support teams build an FAQ-answering bot, analysts build a data-summary bot",
      "Everyone leaves with a bot customized for the work they actually do"
    ],
    tools: "role-based prompt templates, Google Sheets",
    durationHours: 3,
    timing: "10:00 AM - 01:00 PM"
  },
  {
    id: "day-4",
    dayNumber: "04",
    title: "Connecting Your Bot to Real Tools",
    description: "Linking a micro-bot to a form, spreadsheet, or calendar so it reacts automatically",
    highlights: [
      "Form, sheet, or calendar link",
      "Auto-reaction setup",
      "Where simple automation works"
    ],
    bullets: [
      "Linking a micro-bot to a form, spreadsheet, or calendar so it reacts automatically instead of only on request",
      "Where a simple automation earns its keep, and where you genuinely don't need one"
    ],
    tools: "n8n (free/self-hosted), Zapier free tier",
    durationHours: 2,
    timing: "10:00 AM - 12:00 PM"
  },
  {
    id: "day-5",
    dayNumber: "05",
    title: "Making It Visual: Quick Video & Image Content",
    description: "Turning a bot's output into a short video, voiceover, or graphic using AI tools",
    highlights: [
      "AI video, voice & graphic flow",
      "Script to voiceover & visuals",
      "CapCut, ElevenLabs & Canva"
    ],
    bullets: [
      "Turning a bot's output into a short video, voiceover, or graphic using AI tools built for exactly this — no professional editing software needed",
      "A simple end-to-end flow: script → voice → visuals → short video"
    ],
    tools: "CapCut AI tools, ElevenLabs free tier, Canva AI",
    durationHours: 2.5,
    timing: "10:00 AM - 12:30 PM"
  },
  {
    id: "day-6",
    dayNumber: "06",
    title: "Capstone: Ship Your Micro-Bot",
    description: "Present the micro-bot you built across the week to the group and get direct feedback",
    highlights: [
      "Micro-bot group presentation",
      "Direct mentor feedback",
      "Written roadmap & certificate"
    ],
    bullets: [
      "Present the micro-bot you built across the week to the group",
      "Direct, specific feedback from a senior mentor",
      "A simple written roadmap for what to build next, plus your completion certificate"
    ],
    tools: "none required — this is a presentation session",
    durationHours: 3,
    timing: "10:00 AM - 01:00 PM"
  }
];

export const premiumSyllabus: SyllabusDay[] = [
  {
    id: "pday-1",
    dayNumber: "01",
    title: "Systems Thinking: Mapping a Workflow to Bots",
    bullets: [
      "Taking a whole process (handling inquiries, producing weekly content, a sales follow-up sequence) and breaking it into stages bots could handle",
      "Deciding which stages genuinely need AI, and which don't"
    ],
    tools: "Google AI Studio, Claude",
    durationHours: 2,
    timing: "02:00 PM - 04:00 PM"
  },
  {
    id: "pday-2",
    dayNumber: "02",
    title: "Designing Multiple Bots That Work Together",
    bullets: [
      "Building 2–3 small bots that hand work to each other (one drafts, one checks, one formats)",
      "Keeping each bot narrow and reliable rather than one bot trying to do everything",
      "Applying the C.O.D.E. Method at the system level — each bot gets its own Context, Objective, Design, and Evaluate pass before being connected to the others"
    ],
    tools: "Custom GPTs, CrewAI (open-source)",
    durationHours: 3,
    timing: "02:00 PM - 05:00 PM"
  },
  {
    id: "pday-3",
    dayNumber: "03",
    title: "Voice & Conversational Bots",
    bullets: [
      "Building a bot that holds a spoken conversation, not just text",
      "Where a voice interface genuinely helps vs. where it's just a gimmick"
    ],
    tools: "ElevenLabs",
    durationHours: 2,
    timing: "02:00 PM - 04:00 PM"
  },
  {
    id: "pday-4",
    dayNumber: "04",
    title: "Automating a Full Workflow End-to-End",
    bullets: [
      "Connecting triggers, bots, and existing tools into one continuous workflow — not a single manual step",
      "Testing the workflow against real, messy inputs, not just the demo case"
    ],
    tools: "n8n, Zapier, Make.com (free tiers)",
    durationHours: 3,
    timing: "02:00 PM - 05:00 PM"
  },
  {
    id: "pday-5",
    dayNumber: "05",
    title: "Bots That Take Action, Not Just Respond",
    bullets: [
      "Designing a bot that can actually do something (send an email, update a sheet, create a task) with checks in place before it acts",
      "Deciding on purpose where to keep a human in the loop"
    ],
    tools: "LangChain (open-source), n8n",
    durationHours: 2.5,
    timing: "02:00 PM - 04:30 PM"
  },
  {
    id: "pday-6",
    dayNumber: "06",
    title: "Coordinating a Small Team of Bots",
    bullets: [
      "Assigning roles across bots (planner, builder, reviewer) on one shared task",
      "Handling hand-offs so nothing gets lost or looped"
    ],
    tools: "CrewAI, LangChain",
    durationHours: 3,
    timing: "02:00 PM - 05:00 PM"
  },
  {
    id: "pday-7",
    dayNumber: "07",
    title: "Full AI Video & Content Production Pipeline",
    bullets: [
      "A full script-to-final-video flow — multiple scenes, consistent voice and style",
      "Producing something you'd actually publish, not just a demo clip"
    ],
    tools: "CapCut, ComfyUI (open-source, local), ElevenLabs",
    durationHours: 3.5,
    timing: "02:00 PM - 05:30 PM"
  },
  {
    id: "pday-8",
    dayNumber: "08",
    title: "Building a Bot in Your Own Voice",
    bullets: [
      "Training a bot to write or respond in a specific person's tone or style — useful for a founder's content bot or a support team's voice",
      "Being upfront about where this needs disclosure, and where it doesn't"
    ],
    tools: "Custom GPTs, Gems",
    durationHours: 2,
    timing: "02:00 PM - 04:00 PM"
  },
  {
    id: "pday-9",
    dayNumber: "09",
    title: "1:1 Review Clinic",
    bullets: [
      "A dedicated session reviewing the bots or workflow you or your company are actually building",
      "Concrete, prioritized fixes — not generic slides"
    ],
    tools: "whatever you're already using — bring your own setup",
    durationHours: 2,
    timing: "02:00 PM - 04:00 PM"
  },
  {
    id: "pday-10",
    dayNumber: "10",
    title: "Keeping Bots Reliable",
    bullets: [
      "Simple ways to test a bot before it goes live, and catch it quietly breaking afterward",
      "Basic guardrails so a bot can't do something it shouldn't"
    ],
    tools: "manual test-case checklists, your automation tool's built-in logging",
    durationHours: 2.5,
    timing: "02:00 PM - 04:30 PM"
  },
  {
    id: "pday-11",
    dayNumber: "11",
    title: "Turning Your Bots Into a Real Offering",
    bullets: [
      "Packaging what you've built as a service or product you could actually sell — for freelancers, consultants, or small teams",
      "Scoping and pricing it honestly"
    ],
    tools: "none required — this is a planning session",
    durationHours: 2,
    timing: "02:00 PM - 04:00 PM"
  },
  {
    id: "pday-12",
    dayNumber: "12",
    title: "Sharing Bots Safely With Others",
    bullets: [
      "Basic access control and privacy practices before handing a bot to teammates or clients",
      "What to check before connecting a bot to anything sensitive"
    ],
    tools: "your automation tool's standard access controls",
    durationHours: 2,
    timing: "02:00 PM - 04:00 PM"
  },
  {
    id: "pday-13",
    dayNumber: "13",
    title: "Capstone Defense & Certification",
    bullets: [
      "Present your finished multi-bot system to a senior reviewer",
      "A simple written roadmap for what to build next, plus your completion certificate"
    ],
    tools: "none required — this is a presentation and review session",
    durationHours: 3,
    timing: "02:00 PM - 05:00 PM"
  }
];

export const pricingTiers: PricingTier[] = [
  {
    id: "standard",
    name: "Base Cohort",
    subtitle: "Standard Entry",
    priceINR: 4999,
    priceUSD: 79,
    features: [
      "6-day live curriculum access",
      "Digital interactive documentation",
      "Community access",
      "Hands-on project: build and demo one real AI-powered tool",
      "Completion certificate"
    ],
    isPremium: false
  },
  {
    id: "premium",
    name: "Premium Alpha",
    subtitle: "Executive Track",
    priceINR: 12999,
    priceUSD: 199,
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
  }
];

export const initialComplaintLogs: ComplaintLog[] = [
  {
    id: "BUG-4091",
    studentEntity: {
      initials: "JD",
      username: "john_doe_99"
    },
    issueDescription: "Payment processed but course access not granted in dashboard.",
    severity: "HIGH",
    timestamp: "2024.10.27 13:45",
    status: "UNRESOLVED"
  },
  {
    id: "BUG-4088",
    studentEntity: {
      initials: "AS",
      username: "alice_sys"
    },
    issueDescription: "Video lesson #4 buffering repeatedly on 5G connection.",
    severity: "MEDIUM",
    timestamp: "2024.10.27 12:12",
    status: "UNRESOLVED"
  },
  {
    id: "BUG-4085",
    studentEntity: {
      initials: "MK",
      username: "mark_dev"
    },
    issueDescription: "Spelling error in 'Advanced Microservices' title name.",
    severity: "LOW",
    timestamp: "2024.10.27 10:30",
    status: "UNRESOLVED"
  },
  {
    id: "BUG-4082",
    studentEntity: {
      initials: "SL",
      username: "sarah_l"
    },
    issueDescription: "Profile picture upload fails if image is exactly 2MB.",
    severity: "LOW",
    timestamp: "2024.10.27 09:15",
    status: "UNRESOLVED"
  }
];
