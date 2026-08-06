import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Info, 
  Send, 
  Orbit, 
  User, 
  X, 
  Terminal,
  Radio,
  Volume2,
  VolumeX,
  Cpu,
  Users,
  Activity,
  Sliders,
  Link,
  Video,
  BookOpen
} from "lucide-react";
import { ChatMessage, MeetingReservation } from "../types";

interface CircularAgentProps {
  onNewLog?: (logDescription: string, severity: "HIGH" | "MEDIUM" | "LOW") => void;
  onNewMeeting?: (meeting: MeetingReservation) => void;
  activeSyllabusId?: string | null;
  setActiveSyllabusId?: (id: string | null) => void;
}

export default function CircularAgent({ 
  onNewLog, 
  onNewMeeting,
  activeSyllabusId = "day-1",
  setActiveSyllabusId
}: CircularAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "radar" | "about">("chat");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null);

  const playSynthNote = (frequency: number) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio Context not allowed by browser autoplay policy yet:", e);
    }
  };

  const radarOrbits = [
    { 
      id: "day-1", 
      dayNumber: "01", 
      title: "AI Basics & Idea", 
      freq: 261.63,
      radius: "w-[70px] h-[70px]",
      borderStyle: "border-indigo-500",
      icon: Cpu,
      summary: "Understand AI models and map out which repetitive parts of your job can be automated."
    },
    { 
      id: "day-2", 
      dayNumber: "02", 
      title: "First Micro-Bot", 
      freq: 293.66,
      radius: "w-[105px] h-[105px]",
      borderStyle: "border-emerald-500",
      icon: BookOpen,
      summary: "Build your first custom GPT or Gem using reliable instructions and the C.O.D.E. checklist."
    },
    { 
      id: "day-3", 
      dayNumber: "03", 
      title: "Role Specialization", 
      freq: 329.63,
      radius: "w-[140px] h-[140px]",
      borderStyle: "border-cyan-500",
      icon: Users,
      summary: "Construct custom bots tailored directly to your professional role (marketing, support, ops)."
    },
    { 
      id: "day-4", 
      dayNumber: "04", 
      title: "Tool Connection", 
      freq: 349.23,
      radius: "w-[175px] h-[175px]",
      borderStyle: "border-amber-500",
      icon: Link,
      summary: "Link your bots to real-world forms, spreadsheets, or calendars automatically using n8n and Zapier."
    },
    { 
      id: "day-5", 
      dayNumber: "05", 
      title: "Visuals & Media AI", 
      freq: 392.00,
      radius: "w-[210px] h-[210px]",
      borderStyle: "border-rose-500",
      icon: Video,
      summary: "Convert text outputs into voiceovers, graphics, and short video clips using CapCut & ElevenLabs."
    },
    { 
      id: "day-6", 
      dayNumber: "06", 
      title: "Ship Your Micro-Bot", 
      freq: 440.00,
      radius: "w-[245px] h-[245px]",
      borderStyle: "border-violet-500",
      icon: Sliders,
      summary: "Present your fully working micro-bot to peers, get expert review, and receive your certification."
    }
  ];

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Connection secure. I am the CODEXIA Autonomous Agent. I am here to detail our 6-day Base Cohort, explain our 13-day Premium Alpha automation program, review our senior AI services, or answer any FAQs. What system parameters shall we evaluate?",
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isThinking) return;

    const userMsgText = chatInput.trim();
    setChatInput("");

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: userMsgText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Map message history into backend-friendly schema
      const history = messages.slice(-8).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgText, history })
      });

      const data = await res.json();
      
      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        role: "model",
        text: data.reply || "Connection interrupted. Failed to synthesize token stream.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "model",
        text: "ALERT: Communication link offline. Fallback simulated matrix online: CODEXIA represents state-of-the-art AI enablement training. Please explore our syllabus or services on the main dashboard.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Preset quick instructions to prompt the chatbot
  const quickPrompts = [
    { label: "What is Codexia?", text: "What is Codexia and what do I get?" },
    { label: "Base vs Premium?", text: "What's the difference between Base Cohort and Premium Alpha?" },
    { label: "Senior AI services?", text: "What senior AI services and team training do you offer?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="agent-trigger-circle"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 group rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer overflow-visible"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Outer Spinning Concentric Orbit 1 */}
            <motion.div
              className="absolute inset-0 border border-dashed border-indigo-500/40 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]" />
            </motion.div>
            {/* Outer Spinning Concentric Orbit 2 */}
            <motion.div
              className="absolute -inset-2 border border-dotted border-emerald-500/20 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
            </motion.div>
            {/* Inner Pulsating Wave */}
            <motion.div
              className="absolute inset-1 bg-indigo-500/5 rounded-full border border-indigo-500/30"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
            
            {/* Core Circular AI Node */}
            <div className="relative flex items-center justify-center w-14 h-14 bg-slate-900 border-2 border-indigo-500/40 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              <Orbit className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>

            {/* Float Tooltip */}
            <div className="absolute right-24 bg-slate-900/90 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-widest text-indigo-400 px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg shadow-lg">
              CODEXIA_AGENT // ACTIVE
            </div>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            id="agent-chat-overlay"
            className="relative w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[620px] bg-slate-950/80 backdrop-blur-3xl border border-white/25 flex flex-col overflow-hidden rounded-[32px] shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
          >
            {/* Futuristic Grid Overlay inside Agent */}
            <div className="grid-overlay absolute inset-0 pointer-events-none opacity-10"></div>

            {/* Circular Agent Title Area */}
            <div className="relative flex items-center justify-between p-4 bg-white/5 border-b border-white/10 z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 bg-slate-900 border border-white/10 rounded-full">
                  <motion.div
                    className="absolute inset-0.5 border border-dashed border-indigo-400/50 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  />
                  <Orbit className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-mono text-xs uppercase text-white tracking-widest flex items-center gap-1.5">
                    CORE_AGENT_V2
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                    AUTONOMOUS COGNITIVE CONSTRUCT
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-indigo-400 border border-transparent hover:border-white/10 bg-white/5 rounded-xl transition-all cursor-pointer"
                title="Deactivate Interface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs (Brutalist style) */}
            <div className="grid grid-cols-3 border-b border-white/10 z-10 bg-black/40 text-[10px] font-mono font-bold tracking-wider uppercase">
              <button
                onClick={() => setActiveTab("chat")}
                className={`py-3 text-center border-r border-white/10 cursor-pointer flex items-center justify-center gap-0.5 transition-all ${
                  activeTab === "chat" ? "bg-white/5 text-indigo-400 border-b-2 border-b-indigo-500 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab("radar")}
                className={`py-3 text-center border-r border-white/10 cursor-pointer flex items-center justify-center gap-0.5 transition-all ${
                  activeTab === "radar" ? "bg-white/5 text-indigo-400 border-b-2 border-b-indigo-500 font-bold" : "text-slate-400 hover:text-white"
                }`}
                title="Syllabus Radar Grid"
              >
                <Radio className="w-3 h-3 flex-shrink-0 animate-pulse text-indigo-400" />
                Radar
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`py-3 text-center cursor-pointer flex items-center justify-center gap-0.5 transition-all ${
                  activeTab === "about" ? "bg-white/5 text-indigo-400 border-b-2 border-b-indigo-500 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <Info className="w-3 h-3 flex-shrink-0" />
                Entity
              </button>
            </div>

            {/* Core Tab Screen View */}
            <div className="flex-1 overflow-y-auto p-4 z-10 flex flex-col bg-black/40">
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col justify-between h-full">
                  {/* Messages Stream */}
                  <div className="space-y-4 flex-1 overflow-y-auto mb-4 scrollbar-thin">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {m.role !== "user" && (
                          <div className="flex-shrink-0 w-7 h-7 bg-slate-900 border border-white/10 flex items-center justify-center rounded-lg">
                            <Orbit className="w-4 h-4 text-indigo-400" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-3 font-mono text-[11px] leading-relaxed select-text ${
                            m.role === "user"
                              ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-right rounded-2xl rounded-tr-none"
                              : "bg-white/5 border border-white/10 text-slate-100 rounded-2xl rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-1 text-[9px] opacity-50 uppercase tracking-widest justify-between">
                            <span>{m.role === "user" ? "USER_LINK" : "AGENT_ENGINE"}</span>
                            <span>
                              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap">{m.text}</div>
                        </div>
                        {m.role === "user" && (
                          <div className="flex-shrink-0 w-7 h-7 bg-[#1c1e26] border border-white/10 flex items-center justify-center rounded-lg">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isThinking && (
                      <div className="flex gap-2.5 justify-start">
                        <div className="flex-shrink-0 w-7 h-7 bg-slate-900 border border-indigo-500/30 flex items-center justify-center animate-spin rounded-lg">
                          <Orbit className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 text-slate-400 font-mono text-[10px] italic flex items-center gap-2 rounded-2xl rounded-tl-none">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                          Synthesizing context vector tokens...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Preset Buttons */}
                  {messages.length === 1 && (
                    <div className="mb-3 space-y-1.5">
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                        Quick telemetry prompt links:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setChatInput(p.text);
                            }}
                            className="bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 text-slate-300 hover:text-white rounded-lg transition-all py-1 px-2.5 text-[9px] font-mono uppercase cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/10 pt-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type parameters to evaluate..."
                      className="flex-1 bg-black/60 text-white font-mono text-xs border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/35 rounded-xl focus:outline-none p-2.5 uppercase tracking-wide"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isThinking}
                      className="bg-indigo-600 border border-indigo-500 text-white hover:bg-indigo-500 transition-all p-2.5 disabled:opacity-40 cursor-pointer rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/35"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "radar" && (
                <div className="flex-1 flex flex-col h-full justify-between">
                  {/* Top Bar Controls */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      COGNITIVE_RADAR_FEED
                    </span>
                    <button 
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        if (!soundEnabled) {
                          playSynthNote(349.23); // F4
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 border border-white/10 hover:border-indigo-500/40 bg-white/5 hover:text-white rounded transition-all cursor-pointer"
                      title={soundEnabled ? "Mute audio synthesizer pings" : "Unmute audio synthesizer pings"}
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2 className="w-3 h-3 text-indigo-400 animate-bounce" />
                          <span>SYNTH: ON</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3 h-3 text-slate-500" />
                          <span>SYNTH: OFF</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Interactive Haptic Radar Stage */}
                  <div className="relative flex items-center justify-center h-[230px] my-3 border border-white/10 bg-slate-950/60 rounded-2xl overflow-hidden shadow-inner">
                    {/* Concentric Grid lines and Radar sweeps */}
                    <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />
                    
                    {/* Rotating Radar Sweep Beam */}
                    <motion.div 
                      className="absolute w-[300px] h-[300px] bg-gradient-to-tr from-transparent via-indigo-500/5 to-transparent rounded-full pointer-events-none"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    />

                    {/* Central Glowing Processor Core */}
                    <div className="absolute z-20 flex items-center justify-center w-8 h-8 bg-slate-950 border border-indigo-500/50 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                      <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-ping" />
                      <div className="absolute w-2 h-2 bg-indigo-500 rounded-full" />
                    </div>

                    {/* Render Interactive Concentric Orbits */}
                    {radarOrbits.map((orbit) => {
                      const isSelected = activeSyllabusId === orbit.id;
                      const isHovered = hoveredOrbit === orbit.id;
                      
                      return (
                        <div
                          key={orbit.id}
                          className={`absolute rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer ${orbit.radius} ${
                            isSelected 
                              ? `${orbit.borderStyle} border-2 shadow-[0_0_15px_rgba(99,102,241,0.25)]` 
                              : isHovered 
                              ? `${orbit.borderStyle} border border-dashed shadow-[0_0_8px_rgba(99,102,241,0.15)] scale-[1.02]` 
                              : "border-white/10 border-dashed hover:border-white/20"
                          }`}
                          onMouseEnter={() => setHoveredOrbit(orbit.id)}
                          onMouseLeave={() => setHoveredOrbit(null)}
                          onClick={() => {
                            if (setActiveSyllabusId) {
                              setActiveSyllabusId(orbit.id);
                            }
                            playSynthNote(orbit.freq);
                            if (onNewLog) {
                              onNewLog(`SYSTEM CHIP EVAL // Synchronized to Syllabus Node Day ${orbit.dayNumber}.`, "LOW");
                            }
                          }}
                        >
                          {/* Visual Indicator node on each ring */}
                          <div className={`absolute top-0 w-2.5 h-2.5 rounded-full ${
                            isSelected ? "bg-indigo-400 scale-125 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-white/20"
                          }`} />
                        </div>
                      );
                    })}

                    {/* Non-verbal holographic ring identifiers */}
                    <div className="absolute bottom-2 left-4 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                      R-MESH // 8-DAY RANGE
                    </div>
                  </div>

                  {/* Compact Orbit Node Selector Beacons (Great for Touch / Mobile responsive clicks) */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {radarOrbits.map((orbit) => {
                      const isSelected = activeSyllabusId === orbit.id;
                      const IconComponent = orbit.icon;
                      
                      return (
                        <button
                          key={orbit.id}
                          className={`p-2 border font-mono rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                            isSelected 
                              ? "bg-indigo-600/10 border-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                              : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                          }`}
                          onMouseEnter={() => setHoveredOrbit(orbit.id)}
                          onMouseLeave={() => setHoveredOrbit(null)}
                          onClick={() => {
                            if (setActiveSyllabusId) {
                              setActiveSyllabusId(orbit.id);
                            }
                            playSynthNote(orbit.freq);
                            if (onNewLog) {
                              onNewLog(`CONSOLE SIGNAL // Linked syllabus core to day_node_${orbit.dayNumber}.`, "LOW");
                            }
                          }}
                        >
                          <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                          <span className="text-[9px] uppercase tracking-tighter">NODE {orbit.dayNumber}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Details Display with Non-Textual progress meters */}
                  {(() => {
                    const activeOrbit = radarOrbits.find(o => o.id === (hoveredOrbit || activeSyllabusId)) || radarOrbits[0];
                    const IconComp = activeOrbit.icon;
                    
                    let progressString = "░ ░ ░ ░ ░ ░";
                    let progressPercent = 0;
                    if (activeOrbit.id === "day-1") { progressString = "▰ ░ ░ ░ ░ ░"; progressPercent = 16.6; }
                    else if (activeOrbit.id === "day-2") { progressString = "▰ ▰ ░ ░ ░ ░"; progressPercent = 33.3; }
                    else if (activeOrbit.id === "day-3") { progressString = "▰ ▰ ▰ ░ ░ ░"; progressPercent = 50.0; }
                    else if (activeOrbit.id === "day-4") { progressString = "▰ ▰ ▰ ▰ ░ ░"; progressPercent = 66.6; }
                    else if (activeOrbit.id === "day-5") { progressString = "▰ ▰ ▰ ▰ ▰ ░"; progressPercent = 83.3; }
                    else if (activeOrbit.id === "day-6") { progressString = "▰ ▰ ▰ ▰ ▰ ▰"; progressPercent = 100.0; }

                    return (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1 border border-white/10 bg-slate-900 rounded-lg">
                              <IconComp className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-[10px] uppercase tracking-wider">
                                DAY {activeOrbit.dayNumber} // {activeOrbit.title.toUpperCase()}
                              </h4>
                              <p className="text-[8px] text-indigo-400 uppercase tracking-widest font-mono">
                                SYNTH BEACON // {activeOrbit.freq} HZ
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[8px] font-mono text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${activeSyllabusId === activeOrbit.id ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
                            <span>{activeSyllabusId === activeOrbit.id ? "SYNC" : "STALE"}</span>
                          </div>
                        </div>

                        <p className="text-[9px] font-mono text-slate-300 leading-relaxed uppercase">
                          {activeOrbit.summary}
                        </p>

                        <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[9px] font-mono">
                          <span className="text-slate-400 uppercase">CURRICULUM IMPACT WEIGHT:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-400 font-bold tracking-widest text-[10px]">{progressString}</span>
                            <span className="text-slate-500 text-[8px]">({progressPercent}%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === "about" && (
                <div className="font-mono text-[11px] space-y-4 leading-relaxed text-slate-300 select-text">
                  <div className="p-3.5 border border-white/10 bg-white/5 rounded-2xl">
                    <h4 className="text-white font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      ENTITY SPECIFICATIONS
                    </h4>
                    <p className="text-[10px] uppercase text-slate-300">
                      NAME: CODEXIA SYSTEM COGNITIVE ACCELERATOR<br />
                      TYPE: RECURSIVE DEEP-THINKING FULL-STACK ORBITAL<br />
                      VERSION: 2.0.4 // PRODUCTION LATEST<br />
                      ACTIVE MODEL: gemini-3.5-flash
                    </p>
                  </div>

                  <p className="uppercase text-[10px] text-slate-400">
                    I am an autonomous node designed directly into the CODEXIA global mesh network. Rather than serving text files, I analyze live server-side variables to answer core integration issues, program schedules, and configure telemetry logs in real-time.
                  </p>

                  <div className="space-y-1.5">
                    <div className="h-0.5 w-full bg-white/10" />
                    <h5 className="text-white font-bold uppercase tracking-widest text-[10px]">
                      CORE PROTOCOLS INSTANTIATED:
                    </h5>
                    <ul className="list-disc pl-4 space-y-1 uppercase text-[10px] text-slate-400">
                      <li>REAL-TIME SECURE SOCKET CHAT WITH CONTEXT EVAL</li>
                      <li>DIRECT COMPLAINT & FEEDBACK TELEMETRY LOGGING</li>
                      <li>DYNAMIC INR/USD COHORT REGISTRATION TRANSACTIONS</li>
                    </ul>
                  </div>

                  <div className="text-[9px] border border-indigo-500/20 bg-indigo-500/5 p-2.5 text-indigo-400 uppercase text-center tracking-widest rounded-xl">
                    ALL INTERFACES FULLY COMPLIANT WITH SENIOR DESIGN ARCHITECTURE STANDARDS
                  </div>
                </div>
              )}
            </div>

            {/* Footer indicator bar */}
            <div className="bg-white/5 border-t border-white/10 p-2.5 font-mono text-[9px] uppercase tracking-widest text-slate-400 flex justify-between z-10">
              <span>ORBIT STATUS: ONLINE</span>
              <span>GRID COORDS // SECURE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
