import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Star, 
  ThumbsUp, 
  Plus, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  User,
  Film,
  Trash2,
  Tv
} from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  cohort: string;
  rating: number;
  comment: string;
  type: "youtube" | "local";
  videoUrl: string; // YouTube video URL or ID, or local identifier
  date: string;
  upvotes: number;
  isCustom?: boolean;
}

const defaultTestimonials: Testimonial[] = [];

// Helper to parse YouTube video ID from various formats
function getYouTubeId(url: string): string {
  if (!url) return "";
  // Check if it's already an ID
  if (url.length === 11 && !url.includes("/") && !url.includes(".")) {
    return url;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

export default function StudentTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  
  // Local video player simulation states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [audioWaves, setAudioWaves] = useState<number[]>([15, 30, 45, 20, 10, 25, 40, 60, 35, 15]);
  
  // Modal / Form state for submitting a new testimonial
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCohort, setNewCohort] = useState("SRE & Swarm Load Balancing");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newType, setNewType] = useState<"youtube" | "local">("local");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and load from Server State
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const data = await res.json();
          if (data.student_testimonials) {
            setTestimonials(data.student_testimonials);
          } else {
            setTestimonials(defaultTestimonials);
          }
        }
      } catch (e) {
        console.error("Failed to load testimonials from server state:", e);
        setTestimonials(defaultTestimonials);
      }
    };
    fetchTestimonials();
    const interval = setInterval(fetchTestimonials, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync testimonials to Server when changed
  const saveTestimonials = async (updatedList: Testimonial[]) => {
    setTestimonials(updatedList);
    try {
      await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_testimonials: updatedList })
      });
    } catch (err) {
      console.error("Failed to save testimonials to server:", err);
    }
  };

  // Local simulator player timer loop
  useEffect(() => {
    if (isPlaying && selectedTestimonial) {
      timerRef.current = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= 60) {
            setIsPlaying(false);
            return 0;
          }
          return prev + (1 * playbackSpeed);
        });
        // Jump some audio meters for visualization
        setAudioWaves(Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 10));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedTestimonial, playbackSpeed]);

  // Handle testimonial select
  const handleSelectTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsPlaying(true); // Autoplay simulated transcription stream
    setPlaybackTime(0);
  };

  const handleClosePlayer = () => {
    setSelectedTestimonial(null);
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvotedIds[id]) return;

    const updated = testimonials.map((t) => {
      if (t.id === id) {
        return { ...t, upvotes: t.upvotes + 1 };
      }
      return t;
    });
    
    setUpvotedIds((prev) => ({ ...prev, [id]: true }));
    saveTestimonials(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = testimonials.filter((t) => t.id !== id);
    saveTestimonials(updated);
    if (selectedTestimonial?.id === id) {
      handleClosePlayer();
    }
  };

  // Submit form handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim() || !newRole.trim()) {
      return;
    }

    const created: Testimonial = {
      id: "custom-" + Date.now(),
      name: newName,
      role: newRole,
      company: newCompany || "Independent",
      cohort: newCohort,
      rating: newRating,
      comment: newComment,
      type: newType,
      videoUrl: newType === "youtube" ? newVideoUrl : "custom-feedback",
      date: new Date().toISOString().split("T")[0],
      upvotes: 0,
      isCustom: true
    };

    const updated = [...testimonials, created];
    saveTestimonials(updated);
    setIsSubmitOpen(false);
    
    // Reset form
    setNewName("");
    setNewRole("");
    setNewCompany("");
    setNewComment("");
    setNewVideoUrl("");
    setNewType("local");
    setNewRating(5);
  };

  // Subtitles generator based on testimonial commentary
  const getSubtitles = (testimonial: Testimonial, time: number) => {
    const words = testimonial.comment.split(". ");
    if (words.length === 0) return "";
    
    const index = Math.min(Math.floor((time / 60) * words.length), words.length - 1);
    return words[index] ? words[index] + "." : testimonial.comment;
  };

  return (
    <section className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl space-y-6">
      {/* Testimonials Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2a2c35]/60 pb-4">
        <div>
          <h3 className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan" />
            STUDENT_TESTIMONIALS_LEDGER
          </h3>
          <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">
            Verified proof of cognitive acceleration &amp; platform-enabled career breakthroughs
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="flex items-center gap-1.5 bg-cyan/10 border border-cyan/30 hover:bg-cyan/20 text-cyan text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          SHARE_YOUR_STORY
        </button>
      </div>



      {/* Grid of Student Cards */}
      {testimonials.length === 0 ? (
        <div className="text-center py-12 border border-[#2a2c35] bg-black/10 rounded-xl flex flex-col items-center justify-center space-y-3">
          <MessageSquare className="w-8 h-8 text-[#8e919e]/40 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">NO_VERIFIED_RECORDS_FOUND</h4>
            <p className="font-mono text-[9px] uppercase text-[#8e919e] max-w-md px-4">
              The student testimonials ledger is currently empty. Initialize a new career breakthrough by submitting your custom record using the button above.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((test) => {
            return (
              <div
                key={test.id}
                className="p-4 border border-[#2a2c35] hover:border-slate-700 bg-black/20 hover:bg-black/40 rounded-xl flex flex-col justify-between group transition-all duration-300 relative"
              >
                {/* Card top row */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan text-[10px] font-bold shadow-md uppercase">
                        {test.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-white uppercase group-hover:text-cyan transition-colors">
                          {test.name}
                        </h4>
                        <p className="text-[8px] text-slate-500 font-mono mt-0.5">
                          {test.role} @ <span className="text-slate-400">{test.company}</span>
                        </p>
                      </div>
                    </div>

                    {/* Rating / Star Indicator */}
                    <div className="flex gap-0.5 text-yellow-500">
                      {Array.from({ length: test.rating }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-[9px] text-[#A0A2B0] font-mono leading-relaxed uppercase line-clamp-3 pl-0.5">
                    "{test.comment}"
                  </p>
                </div>

                {/* Card bottom row */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#2a2c35]/50 font-mono text-[7px] uppercase font-bold text-slate-500">
                  <span className="bg-[#16171D] px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                    {test.cohort}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleUpvote(test.id, e)}
                      className="hover:text-cyan transition-colors cursor-pointer flex items-center gap-0.5"
                      title="Upvote review"
                    >
                      <ThumbsUp className="w-2.5 h-2.5" />
                      <span>({test.upvotes})</span>
                    </button>

                    {test.isCustom && (
                      <button
                        onClick={(e) => handleDelete(test.id, e)}
                        className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                        title="Delete Testimonial"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Submit Testimonial Drawer Form */}
      <AnimatePresence>
        {isSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsSubmitOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div
              className="relative w-full max-w-md bg-[#0D0E12] border-2 border-cyan p-6 font-mono text-[10px] shadow-2xl z-10 rounded-lg"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
            >
              {/* Form Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[#2a2c35] mb-4">
                <span className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan" />
                  SUBMIT_COHORT_TESTIMONIAL
                </span>
                <button
                  onClick={() => setIsSubmitOpen(false)}
                  className="text-on-surface-variant hover:text-cyan cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Satya Nadella"
                      className="w-full bg-[#16171D] border border-slate-800 focus:border-cyan focus:outline-none p-2.5 text-white rounded font-mono text-[9px] uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 uppercase tracking-wider block">Cohort</label>
                    <select
                      value={newCohort}
                      onChange={(e) => setNewCohort(e.target.value)}
                      className="w-full bg-[#16171D] border border-slate-800 focus:border-cyan focus:outline-none p-2.5 text-white rounded font-mono text-[9px] uppercase"
                    >
                      <option value="SRE & Swarm Load Balancing">SRE & Swarm Load Balancing</option>
                      <option value="Multi-Agent Consensus Protocol">Multi-Agent Consensus Protocol</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 uppercase tracking-wider block">Current Role</label>
                    <input
                      type="text"
                      required
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Site Reliability Eng"
                      className="w-full bg-[#16171D] border border-slate-800 focus:border-cyan focus:outline-none p-2.5 text-white rounded font-mono text-[9px] uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-400 uppercase tracking-wider block">Company</label>
                    <input
                      type="text"
                      required
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full bg-[#16171D] border border-slate-800 focus:border-cyan focus:outline-none p-2.5 text-white rounded font-mono text-[9px] uppercase"
                    />
                  </div>
                </div>

                {/* Rating selection (Stars) */}
                <div className="space-y-1.5">
                  <label className="text-[8px] text-slate-400 uppercase tracking-wider block">Rating Score</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer transition-colors"
                      >
                        <Star className={`w-4 h-4 ${newRating >= star ? "text-yellow-500 fill-current" : "text-slate-600"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Comment */}
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-400 uppercase tracking-wider block">Cohort Narrative</label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe how this program enhanced your distributed systems architecture abilities..."
                    className="w-full bg-[#16171D] border border-slate-800 focus:border-cyan focus:outline-none p-2.5 text-white rounded font-mono text-[9px] uppercase resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitOpen(false)}
                    className="flex-1 border border-slate-800 text-slate-400 py-2.5 rounded hover:bg-white/5 transition-all cursor-pointer font-bold uppercase tracking-widest text-[8px]"
                  >
                    ABORT_SUBMISSION
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-cyan text-black py-2.5 rounded hover:opacity-90 transition-all cursor-pointer font-bold uppercase tracking-widest text-[8px] flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    COMPILE_RECORD
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
