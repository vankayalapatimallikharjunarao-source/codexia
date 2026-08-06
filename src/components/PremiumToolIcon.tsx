import React from "react";

interface ToolIconProps {
  name: string;
  className?: string;
}

export default function PremiumToolIcon({ name, className = "w-5 h-5" }: ToolIconProps) {
  switch (name.toLowerCase()) {
    case "chatgpt":
    case "openai":
    case "openai playground":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>OpenAI / ChatGPT</title>
          <rect width="24" height="24" rx="6" fill="#000000" />
          <path
            d="M17.1 10.5c.3-.5.4-1.1.2-1.6-.2-.5-.5-.9-1.0-1.2-.4-.2-.9-.3-1.4-.2-.5.1-.9.4-1.2.8l-.4.6c-.1.3-.4.5-.8.5s-.6-.2-.8-.5l-.5-.7c-.3-.4-.8-.6-1.3-.6-.5.1-.9.3-1.2.7-.3.4-.4.9-.3 1.4.1.5.4.9.8 1.2l.5.3c.3.2.4.5.4.8s-.2.6-.4.8l-.6.3c-.5.3-.8.8-.9 1.3 0 .5.2.9.5 1.2.3.3.8.5 1.3.4.5-.1.9-.4 1.2-.8l.3-.6c.1-.3.4-.5.8-.5s.6.2.8.5l.5.7c.3.4.8.6 1.3.6h.2c.5-.1.9-.3 1.2-.7.3-.4.4-.9.3-.1.4.1-.5-.4-.9-.8-1.2l-.5-.3c-.3-.2-.4-.5-.4-.8s.2-.6.4-.8l.6-.3z"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "gemini":
    case "google ai studio":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Google Gemini</title>
          <defs>
            <linearGradient id="gemini-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="gemini-star" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#gemini-bg)" />
          <path
            d="M12 4.5c0 3.2-2 5.5-5.5 5.5 3.5 0 5.5 2.3 5.5 5.5 0-3.2 2-5.5 5.5-5.5-3.5 0-5.5-2.3-5.5-5.5z"
            fill="url(#gemini-star)"
          />
          <path
            d="M17.5 14.5c0 1.2-.8 2-2 2 1.2 0 2 .8 2 2 0-1.2.8-2 2-2-1.2 0-2-.8-2-2z"
            fill="#FFFFFF"
            opacity="0.8"
          />
        </svg>
      );

    case "ollama":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Ollama</title>
          <rect width="24" height="24" rx="6" fill="#111111" />
          <path
            d="M8 9v4.5c0 1.5 1 2.5 2.5 2.5h3c1.5 0 2.5-1 2.5-2.5V9M8 10l-1.2-2.5 1.8.5L10 9.5M16 10l1.2-2.5-1.8.5-1.4 1.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10.5" cy="12.5" r="0.75" fill="white" />
          <circle cx="13.5" cy="12.5" r="0.75" fill="white" />
          <path d="M11.2 14.5h1.6" stroke="white" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case "vapi":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>VAPI</title>
          <rect width="24" height="24" rx="6" fill="#0A0A0A" />
          <path d="M4.5 8.5h2.2l1.2 3.8 1.2-3.8h2.2L9.1 14.5H7.1L4.5 8.5z" fill="white" />
          <path d="M11.8 14.5l2.2-6h1.8l2.2 6H16.1l-.4-1.2h-1.8l-.4 1.2h-1.9zm2.4-2.5h1.2L14.8 10l-.6 2z" fill="#FFFBEB" />
          <path d="M18.8 8.5h2.5c.8 0 1.4.6 1.4 1.3v1c0 .8-.6 1.3-1.4 1.3h-1.1V14.5h-1.4V8.5zm1.4 2.3h1.1c.2 0 .4-.2.4-.4v-.3c0-.2-.2-.4-.4-.4h-1.1v1.1z" fill="white" />
          <rect x="21.5" y="8.5" width="1.4" height="6" fill="white" />
        </svg>
      );

    case "elevenlabs":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>ElevenLabs</title>
          <rect width="24" height="24" rx="6" fill="#0F1012" />
          <g transform="translate(6, 7)" fill="white">
            <rect x="2" y="1" width="2.5" height="8" rx="0.5" />
            <rect x="6.5" y="1" width="2.5" height="8" rx="0.5" />
          </g>
        </svg>
      );

    case "fal":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>fal.ai</title>
          <rect width="24" height="24" rx="6" fill="#0A0A0A" />
          <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.5" fill="white" />
        </svg>
      );

    case "heygen":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>HeyGen</title>
          <defs>
            <linearGradient id="heygen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#0E0F14" />
          <path d="M8 8.5c0-1.5 1.5-2.5 3-2.5s3 1.5 3 3v4c0 1.5-1.5 2.5-3 2.5s-3-1.5-3-3v-4z" fill="url(#heygen-grad)" opacity="0.8" />
          <path d="M11 9.5c0-1.5 1.5-2.5 3-2.5s3 1.5 3 3v4c0 1.5-1.5 2.5-3 2.5s-3-1.5-3-3v-4z" fill="url(#heygen-grad)" />
        </svg>
      );

    case "midjourney":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Midjourney</title>
          <defs>
            <linearGradient id="rainbow-sail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="33%" stopColor="#F59E0B" />
              <stop offset="66%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#101114" />
          <path d="M5 15.5c4-1 10-1 14 0l-1 2H6l-1-2z" fill="#FFFFFF" />
          <path d="M11.5 6v9h1V6h-1z" fill="#CCCCCC" />
          <path d="M12 7c-2 2-3 4.5-3 7h3V7z" fill="url(#rainbow-sail)" />
          <path d="M13 8c1.5 1.5 2.5 3.5 2.5 6H13V8z" fill="#FFFFFF" opacity="0.9" />
        </svg>
      );

    case "runway":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Runway</title>
          <rect width="24" height="24" rx="6" fill="#0D0D0D" />
          <path d="M7 7.5c0-.8.7-1.5 1.5-1.5h3.5c2 0 3.5 1.2 3.5 3s-1.2 2.5-2.5 2.8l2.5 4.7c.2.4-.1.9-.6.9h-1.8l-2.2-4.2H9.5v3.7c0 .3-.2.5-.5.5H7.5c-.3 0-.5-.2-.5-.5v-9.4zm2.5 3.8h3c.8 0 1.5-.5 1.5-1.2s-.7-1.2-1.5-1.2h-3v2.4z" fill="white" />
        </svg>
      );

    case "leonardo":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Leonardo.Ai</title>
          <defs>
            <linearGradient id="leo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#121318" />
          <circle cx="12" cy="12" r="7" stroke="url(#leo-grad)" strokeWidth="1" />
          <path d="M12 7l1.5 2.5h-3L12 7z" fill="url(#leo-grad)" />
          <path d="M9.5 11c1-1 4-1 5 0M10.5 13h3M12 14.5l-1.5 2.5h3L12 14.5z" stroke="white" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case "magnific":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Magnific AI</title>
          <defs>
            <linearGradient id="mag-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="25%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="75%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#09090C" />
          <path d="M12 5.5l7 12.5H5l7-12.5z" stroke="url(#mag-grad)" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 8.5l4.5 8H7.5l4.5-8z" fill="url(#mag-grad)" opacity="0.3" />
        </svg>
      );

    case "topaz":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Topaz Labs</title>
          <rect width="24" height="24" rx="6" fill="#1A1B1F" />
          <g fill="white">
            <rect x="6" y="14" width="3" height="3" />
            <rect x="10" y="10" width="3" height="3" />
            <rect x="14" y="6" width="3" height="3" />
          </g>
        </svg>
      );

    case "comfyui":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>ComfyUI</title>
          <defs>
            <linearGradient id="comfy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#07090E" />
          <circle cx="12" cy="12" r="7" stroke="url(#comfy-grad)" strokeWidth="1.8" />
          <path d="M11 9.5l3.5 2.5-3.5 2.5v-5z" fill="url(#comfy-grad)" />
        </svg>
      );

    case "kling":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Kling AI</title>
          <defs>
            <linearGradient id="kling-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#0A0F11" />
          <circle cx="12" cy="12" r="6" stroke="url(#kling-grad)" strokeWidth="2.2" strokeDasharray="30 10" />
          <circle cx="12" cy="12" r="3" fill="url(#kling-grad)" opacity="0.5" />
        </svg>
      );

    case "make":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Make.com</title>
          <defs>
            <linearGradient id="make-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#A21CAF" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#1E1B4B" />
          {/* Make triple pill diagonal dots logo */}
          <g transform="translate(6, 6)" fill="url(#make-grad)">
            <rect x="0" y="0" width="3" height="8" rx="1.5" transform="rotate(-30)" />
            <rect x="4" y="1" width="3" height="8" rx="1.5" transform="rotate(-30)" />
            <rect x="8" y="2" width="3" height="8" rx="1.5" transform="rotate(-30)" />
          </g>
        </svg>
      );

    case "zapier":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Zapier</title>
          <rect width="24" height="24" rx="6" fill="#FFF5F0" />
          {/* Bold bright orange dash/underscore */}
          <rect x="6" y="10" width="12" height="4" rx="1" fill="#FF4F00" />
        </svg>
      );

    case "n8n":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>n8n</title>
          <rect width="24" height="24" rx="6" fill="#FFF1F2" />
          {/* Branching nodes */}
          <g transform="translate(5, 5)" stroke="#FF6D5A" strokeWidth="1.8" fill="none">
            <circle cx="4" cy="4" r="2.5" />
            <circle cx="10" cy="10" r="2.5" />
            <path d="M5.5 5.5l3 3" strokeLinecap="round" />
            <circle cx="10" cy="4" r="1.5" fill="#FF6D5A" />
          </g>
        </svg>
      );

    case "relevance":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Relevance AI</title>
          <rect width="24" height="24" rx="6" fill="#0F131E" />
          <circle cx="10" cy="12" r="4.5" fill="#3B82F6" opacity="0.6" />
          <circle cx="14" cy="12" r="4.5" fill="#2563EB" />
        </svg>
      );

    case "replit":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Replit</title>
          <rect width="24" height="24" rx="6" fill="#0D0E12" />
          <g fill="#F97316">
            <rect x="6" y="7" width="4" height="4" rx="0.8" />
            <rect x="10" y="10" width="4" height="4" rx="0.8" />
            <rect x="6" y="13" width="4" height="4" rx="0.8" />
          </g>
        </svg>
      );

    case "lovable":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Lovable</title>
          <defs>
            <linearGradient id="lovable-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="30%" stopColor="#EC4899" />
              <stop offset="60%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#13141C" />
          <path
            d="M12 17.5l-1.35-1.22C6 11.9 3 9.17 3 5.83 3 3.1 5.1 1 7.83 1c1.54 0 3.02.72 4 1.85A5.93 5.93 0 0115.83 1c2.73 0 4.83 2.1 4.83 4.83 0 3.34-3 6.07-7.65 10.45L12 17.5z"
            fill="url(#lovable-grad)"
            transform="scale(0.8) translate(3, 3)"
          />
        </svg>
      );

    case "supabase":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Supabase</title>
          <rect width="24" height="24" rx="6" fill="#1C1C1C" />
          <path d="M13.5 4l-6 8h5l-1 8 8-10h-6l1-6z" fill="#3ECF8E" />
        </svg>
      );

    case "cursor":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Cursor</title>
          <rect width="24" height="24" rx="6" fill="#0A0B0E" />
          <g transform="translate(6, 6)" stroke="white" strokeWidth="1.2" strokeLinejoin="round">
            <path d="M6 1l5 3v5l-5 3-5-3V4l5-3z" fill="#1F2937" />
            <path d="M6 1v11M1 4l5 3 5-3" />
          </g>
        </svg>
      );

    case "sheets":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Google Sheets</title>
          <rect width="24" height="24" rx="6" fill="#10B981" />
          <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.5" />
          <line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
          <line x1="12" y1="7" x2="12" y2="17" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
        </svg>
      );

    case "gems":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Google Gems</title>
          <rect width="24" height="24" rx="6" fill="#3B82F6" />
          <path
            d="M12 6L17 10.5L14.5 18H9.5L7 10.5L12 6Z"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "claude":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Claude</title>
          <rect width="24" height="24" rx="6" fill="#D97706" />
          <path
            d="M12 6.5v11M7.5 9.5l9 5M16.5 9.5l-9 5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "crewai":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>CrewAI</title>
          <rect width="24" height="24" rx="6" fill="#BE123C" />
          <circle cx="12" cy="7" r="2" fill="white" />
          <circle cx="7" cy="15" r="2" fill="white" />
          <circle cx="17" cy="15" r="2" fill="white" />
          <line x1="12" y1="8" x2="8.5" y2="13.5" stroke="white" strokeWidth="1.2" />
          <line x1="12" y1="8" x2="15.5" y2="13.5" stroke="white" strokeWidth="1.2" />
        </svg>
      );

    case "langchain":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>LangChain</title>
          <rect width="24" height="24" rx="6" fill="#4D7C0F" />
          <rect x="7" y="10" width="7" height="4" rx="1.5" transform="rotate(-45 7 10)" stroke="white" strokeWidth="1.8" />
          <rect x="11.5" y="14.5" width="7" height="4" rx="1.5" transform="rotate(-45 11.5 14.5)" stroke="white" strokeWidth="1.8" />
        </svg>
      );

    case "canva":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Canva</title>
          <rect width="24" height="24" rx="6" fill="#7D2AE8" />
          <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.8" />
        </svg>
      );

    case "capcut":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>CapCut</title>
          <rect width="24" height="24" rx="6" fill="#00F2FE" />
          <path d="M8 8L17 12L8 16V8Z" fill="white" />
        </svg>
      );

    case "lm studio":
    case "lmstudio":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>LM Studio</title>
          <defs>
            <linearGradient id="lmstudio-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="#0C0D12" />
          <circle cx="12" cy="12" r="7" stroke="url(#lmstudio-grad)" strokeWidth="1.5" />
          <path d="M9 10v4h3M15 10v4h-3M12 10v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "hugging face":
    case "huggingface":
    case "hugging face spaces":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>Hugging Face</title>
          <rect width="24" height="24" rx="6" fill="#FFD21E" />
          <circle cx="12" cy="11" r="5" fill="#FFF5C3" />
          <circle cx="10" cy="10" r="0.75" fill="#2D2D2D" />
          <circle cx="14" cy="10" r="0.75" fill="#2D2D2D" />
          <path d="M10.5 13c.5.5 1.5.5 2 0" stroke="#2D2D2D" strokeWidth="1" strokeLinecap="round" />
          <path d="M6.5 15c.5-1 1.5-1.5 2.5-1.2M17.5 15c-.5-1-1.5-1.5-2.5-1.2" stroke="#2D2D2D" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <title>{name}</title>
          <rect width="24" height="24" rx="6" fill="#334155" />
          <path
            d="M12 8V16M8 12H16"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
