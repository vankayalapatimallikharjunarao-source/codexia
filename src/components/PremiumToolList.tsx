import React from "react";
import PremiumToolIcon from "./PremiumToolIcon";

interface PremiumToolListProps {
  toolsText: string;
  dayId?: string;
}

// Map parsed lowercase tool tokens to human-readable labels
function getHumanToolLabel(token: string): string {
  switch (token.toLowerCase()) {
    case "openai":
    case "chatgpt":
      return "ChatGPT & OpenAI GPTs";
    case "claude":
      return "Anthropic Claude";
    case "gemini":
      return "Google Gemini / AI Studio";
    case "ollama":
      return "Ollama (Local LLMs)";
    case "vapi":
      return "Vapi Voice AI Agency";
    case "elevenlabs":
      return "ElevenLabs Speech Synthesis";
    case "fal":
      return "fal.ai Fast Media Generation";
    case "heygen":
      return "HeyGen AI Video Avatar Studio";
    case "midjourney":
      return "Midjourney Design Studio";
    case "runway":
      return "Runway Gen-3 Alpha Video";
    case "leonardo":
      return "Leonardo.Ai Creative Studio";
    case "magnific":
      return "Magnific AI Image Upscaler";
    case "topaz":
      return "Topaz Labs Photo & Video AI";
    case "comfyui":
      return "ComfyUI Local Stable Diffusion Nodes";
    case "kling":
      return "Kling AI Video Generator";
    case "make":
      return "Make.com Workflow Automation";
    case "zapier":
      return "Zapier Integration Cloud";
    case "n8n":
      return "n8n Open-Source Workflow Nodes";
    case "relevance":
      return "Relevance AI Agent Platform";
    case "replit":
      return "Replit Workspace Cloud";
    case "lovable":
      return "Lovable.dev Web builder";
    case "supabase":
      return "Supabase Open-Source Postgres";
    case "cursor":
      return "Cursor AI Code Editor";
    case "sheets":
      return "Google Sheets Automation";
    case "gems":
      return "Google Gems Studio";
    case "crewai":
      return "CrewAI Orchestrator";
    case "langchain":
      return "LangChain SDK";
    case "capcut":
      return "CapCut Pro Video Editor";
    case "canva":
      return "Canva Magic Studio";
    default:
      return token.toUpperCase();
  }
}

// 1:1 syllabus day to premium image logo sets (from the uploaded screenshots)
const dayToPremiumToolsMap: Record<string, string[]> = {
  // Base Cohort (6 Days)
  "day-1": ["openai", "gemini", "ollama"], // Image 1
  "day-2": ["openai", "gems"],
  "day-3": ["openai", "sheets"],
  "day-4": ["make", "zapier", "n8n"], // Image 5
  "day-5": ["elevenlabs", "fal", "heygen"], // Image 3
  
  // Premium Alpha Track (13 Days)
  "pday-1": ["openai", "gemini", "claude"], // Systems Mapping
  "pday-2": ["openai", "crewai"],
  "pday-3": ["vapi", "elevenlabs"], // Image 2
  "pday-4": ["make", "zapier", "n8n"], // Image 5
  "pday-5": ["langchain", "n8n"],
  "pday-6": ["crewai", "langchain"],
  "pday-7": ["midjourney", "runway", "leonardo", "magnific", "topaz", "comfyui", "kling"], // Image 4
  "pday-8": ["openai", "gems"],
  "pday-9": ["openai", "gemini", "claude"],
  "pday-10": ["relevance", "zapier"], // Image 6
  "pday-12": ["replit", "lovable", "supabase", "cursor"] // Image 7
};

export default function PremiumToolList({ toolsText, dayId }: PremiumToolListProps) {
  if (!toolsText || toolsText.toLowerCase().includes("none required")) {
    return null;
  }

  let list: string[] = [];

  // If we have a direct day mapping, use it to render the exact logos from the images!
  if (dayId && dayToPremiumToolsMap[dayId]) {
    list = dayToPremiumToolsMap[dayId];
  } else {
    // Fallback parser if not mapped or called without dayId
    const text = toolsText.toLowerCase();
    
    if (text.includes("chatgpt") || text.includes("gpt") || text.includes("openai")) {
      list.push("openai");
    }
    if (text.includes("claude")) {
      list.push("claude");
    }
    if (text.includes("google ai studio") || text.includes("gemini")) {
      list.push("gemini");
    }
    if (text.includes("gems")) {
      list.push("gems");
    }
    if (text.includes("sheets")) {
      list.push("sheets");
    }
    if (text.includes("n8n")) {
      list.push("n8n");
    }
    if (text.includes("zapier")) {
      list.push("zapier");
    }
    if (text.includes("make.com") || text.includes("make")) {
      list.push("make");
    }
    if (text.includes("elevenlabs")) {
      list.push("elevenlabs");
    }
    if (text.includes("canva")) {
      list.push("canva");
    }
    if (text.includes("capcut")) {
      list.push("capcut");
    }
    if (text.includes("crewai")) {
      list.push("crewai");
    }
    if (text.includes("langchain")) {
      list.push("langchain");
    }
    if (text.includes("comfyui")) {
      list.push("comfyui");
    }
  }

  // If list is empty, render the clean tools text nicely
  if (list.length === 0) {
    return (
      <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/5">
        <span className="text-[10px] font-mono font-semibold text-[#A0A2B0]/40 uppercase tracking-wider">
          Syllabus Resources:
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {toolsText}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-3.5 pt-3.5 border-t border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono font-bold text-[#A0A2B0]/40 uppercase tracking-widest">
          COHORT TOOLCHAIN INTEGRATIONS:
        </span>
      </div>
      
      {/* Grid-like tight layout for premium logos that prevents overflowing and scales perfectly */}
      <div className="flex flex-wrap items-center gap-2">
        {list.map((tool, idx) => {
          const label = getHumanToolLabel(tool);
          return (
            <div
              key={idx}
              className="relative group flex items-center justify-center"
            >
              {/* Premium tool rounded-square badge card */}
              <div 
                className="w-10 h-10 rounded-xl bg-[#090A0D] border border-white/5 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.4)] group-hover:border-cyan/30 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all duration-300 transform group-hover:-translate-y-0.5 cursor-help overflow-hidden"
              >
                {/* Embedded custom crisp vector SVG icon */}
                <PremiumToolIcon name={tool} className="w-6 h-6 transition-transform duration-300 group-hover:scale-105" />
                
                {/* Micro premium overlay hover glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan/0 to-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30">
                <div className="bg-[#0b0c10] border border-white/10 text-[9px] font-mono text-white px-2 py-1 rounded shadow-2xl whitespace-nowrap uppercase tracking-wider">
                  {label}
                  {/* Tooltip chevron arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0b0c10]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
