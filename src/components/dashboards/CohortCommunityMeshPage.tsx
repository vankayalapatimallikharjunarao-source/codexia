import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, MessageSquare, Send, Megaphone, Users, User, Shield, Trash2, 
  Pin, Check, CheckCircle2, AtSign, Bookmark, Hash, HelpCircle, Bold, 
  Italic, Underline, Strikethrough, Link, Smile, Paperclip, Mic, X, 
  Volume2, Play, Square, Sparkles, Download, Lock
} from "lucide-react";
import { Cohort } from "../../types";

interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  role: "student" | "admin";
  content: string;
  is_accepted?: boolean;
  is_own?: boolean;
  reactions?: Record<string, string[]>;
  created_at: string;
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
  is_own?: boolean;
  reactions?: Record<string, string[]>;
  created_at: string;
  replies: CommunityReply[];
  attachment?: { name: string; url: string; size?: string };
  voice_note?: { url: string; duration?: string };
}

interface CohortMember {
  name: string;
  email?: string;
}

interface CohortCommunityMeshPageProps {
  cohortId: string;
  cohortData: Cohort | null;
  isAdmin: boolean;
  sessionToken?: string | null;
  currentUserEmail?: string | null;
  onBack: () => void;
  showNotification: (msg: string) => void;
}

const COMMON_EMOJIS = ["👍", "🔥", "🚀", "💡", "👑", "❤️", "👏", "👀"];

export default function CohortCommunityMeshPage({
  cohortId,
  cohortData,
  isAdmin,
  sessionToken,
  currentUserEmail,
  onBack,
  showNotification
}: CohortCommunityMeshPageProps) {
  // Navigation & UI States
  const [activeChannel, setActiveChannel] = useState<"announcements" | "discussions" | "question-answer">("discussions");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"cohort" | "mentions" | "bookmarks">("cohort");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CohortMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Composer Input States
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null); // post ID or "composer"
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  // Composer Attachment States
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; size: string } | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Composer Voice Note States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [simulatedVoiceNote, setSimulatedVoiceNote] = useState<{ url: string; duration: string } | null>(null);
  const recordingTimerRef = useRef<any>(null);

  const getHeaders = () => {
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      const headers = getHeaders();
      // 1. Fetch Posts
      const postsRes = await fetch(`/api/community/${cohortId}`, { headers });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }

      // 2. Fetch Members
      const membersRes = await fetch(`/api/cohorts/${cohortId}/members`, { headers });
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }
    } catch (err) {
      console.error("Failed to load community mesh data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
    // Poll every 5 seconds for live community sync
    const interval = setInterval(fetchCommunityData, 5000);
    return () => clearInterval(interval);
  }, [cohortId]);

  // Voice Note Simulation Recording Lock
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Handle Composer Text Formatting Decorators
  const applyTextFormat = (decorator: string) => {
    const textarea = document.getElementById("community-post-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    if (start === undefined || end === undefined) return;

    const selectedText = text.substring(start, end);
    let wrappedText = "";

    if (decorator === "bold") wrappedText = `**${selectedText}**`;
    else if (decorator === "italic") wrappedText = `*${selectedText}*`;
    else if (decorator === "underline") wrappedText = `_${selectedText}_`;
    else if (decorator === "strikethrough") wrappedText = `~~${selectedText}~~`;
    else if (decorator === "link") wrappedText = `[${selectedText}](https://)`;

    const newContent = text.substring(0, start) + wrappedText + text.substring(end);
    setNewPostContent(newContent);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + decorator.length + 1, start + decorator.length + 1 + selectedText.length);
    }, 10);
  };

  // Handle Voice Note Toggle Trigger
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording and generate fake node URL
      setIsRecording(false);
      const formattedDuration = `${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, "0")}`;
      setSimulatedVoiceNote({
        url: "#simulated-voice-note-" + Date.now(),
        duration: formattedDuration || "0:12"
      });
      showNotification("SUCCESS // Cryptographic voice telemetry packet captured");
    } else {
      setSimulatedVoiceNote(null);
      setIsRecording(true);
    }
  };

  // Handle Composer File Attachment Upload
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAttachment(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: base64Data
      });
      setIsUploadingAttachment(false);
      showNotification(`SUCCESS // Attachment registered: ${file.name.toUpperCase()}`);
    };
    reader.onerror = () => {
      setIsUploadingAttachment(false);
      showNotification("ERROR // Failed to parse local attachment block");
    };
    reader.readAsDataURL(file);
  };

  // Handle Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !attachedFile && !simulatedVoiceNote) return;

    // Validate permission for announcements
    if (activeChannel === "announcements" && !isAdmin) {
      showNotification("ERROR // Security Violation: Only Academy mentors can write announcements.");
      return;
    }

    setIsSubmittingPost(true);
    try {
      const res = await fetch(`/api/community/${cohortId}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          content: newPostContent || (attachedFile ? `Shared file attachment: ${attachedFile.name}` : `Sent a voice telemetry packet`),
          channel: activeChannel,
          attachment: attachedFile ? { name: attachedFile.name, url: attachedFile.url, size: attachedFile.size } : undefined,
          voice_note: simulatedVoiceNote ? { url: simulatedVoiceNote.url, duration: simulatedVoiceNote.duration } : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(prev => [data, ...prev]);
        setNewPostContent("");
        setAttachedFile(null);
        setSimulatedVoiceNote(null);
        showNotification(`SUCCESS // Broadcast transmitted to #${activeChannel}`);
      } else {
        const err = await res.json();
        showNotification(`ERROR // Broadcast failure: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Transmission failure: ${err.message || err}`);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Handle Reply Creation
  const handleCreateReply = async (postId: string) => {
    const replyText = replyContents[postId];
    if (!replyText || !replyText.trim()) return;

    setSubmittingReplyId(postId);
    try {
      const res = await fetch(`/api/community/${cohortId}/reply`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          post_id: postId,
          content: replyText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              replies: [...(p.replies || []), data]
            };
          }
          return p;
        }));
        setReplyContents(prev => ({ ...prev, [postId]: "" }));
        showNotification("SUCCESS // Reply successfully recorded to ledger node");
      } else {
        const err = await res.json();
        showNotification(`ERROR // Reply transmission failed: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection failure: ${err.message || err}`);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  // Handle Emoji Toggle Reaction
  const handleEmojiReaction = async (postId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/community/${cohortId}/posts/${postId}/react`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ emoji })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              reactions: data.reactions
            };
          }
          return p;
        }));
        setShowEmojiPicker(null);
      }
    } catch (err: any) {
      console.error("Reaction sync failed", err);
    }
  };

  // Handle Moderation Action (Delete / Pin / Toggle Accepted Answer)
  const handleModeratePost = async (action: "remove_post" | "pin_post", targetId: string) => {
    if (action === "remove_post" && !window.confirm("ARE YOU ABSOLUTELY SURE YOU WANT TO DELETE THIS COMMUNITY MESSAGE?")) {
      return;
    }

    try {
      const res = await fetch(`/api/community/${cohortId}/moderate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action, target_id: targetId })
      });

      if (res.ok) {
        if (action === "remove_post") {
          setPosts(prev => prev.filter(p => p.id !== targetId));
          showNotification("SUCCESS // Deleted post message from ledger node");
        } else if (action === "pin_post") {
          fetchCommunityData();
          showNotification("SUCCESS // Toggled message pin coordinate");
        }
      } else {
        const err = await res.json();
        showNotification(`ERROR // Moderation rejected: ${err.error || "Unknown"}`);
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection failure: ${err.message || err}`);
    }
  };

  const handleModerateReply = async (postId: string, replyId: string) => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE YOU WANT TO REMOVE THIS REPLY?")) {
      return;
    }

    try {
      const res = await fetch(`/api/community/${cohortId}/moderate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "remove_reply", target_id: replyId, post_id: postId })
      });

      if (res.ok) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              replies: (p.replies || []).filter(r => r.id !== replyId)
            };
          }
          return p;
        }));
        showNotification("SUCCESS // Deleted reply item successfully");
      }
    } catch (err: any) {
      showNotification(`ERROR // Failed to delete reply: ${err.message || err}`);
    }
  };

  const handleToggleAcceptAnswer = async (postId: string, replyId: string) => {
    try {
      const res = await fetch(`/api/community/${cohortId}/posts/${postId}/replies/${replyId}/accept`, {
        method: "POST",
        headers: getHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              replies: data.post.replies
            };
          }
          return p;
        }));
        showNotification("SUCCESS // Accepted solution updated in question ledger");
      }
    } catch (err: any) {
      showNotification(`ERROR // Connection error: ${err.message || err}`);
    }
  };

  // Filter posts based on current active channel and sorting options
  const channelPosts = posts
    .filter(p => {
      const chan = p.channel || (p.is_announcement ? "announcements" : "discussions");
      return chan === activeChannel;
    })
    // Sort pinned posts first, then newest first
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return b.created_at.localeCompare(a.created_at);
    });

  // Dynamic cohort tag resolver
  const cohortDisplayName = cohortData?.name || (cohortId.includes("PREMIUM") ? "PREMIUM ALPHA" : "BASE TRACK");

  return (
    <div className="font-mono text-xs max-w-7xl mx-auto py-2 px-1 space-y-4">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#16171D]/40 border border-[#2a2c35] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-black border border-[#2a2c35] hover:border-cyan text-white hover:text-cyan rounded-lg transition-all cursor-pointer"
            title="Back to Dashboard"
            id="back-to-dashboard-community-mesh-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                COMMUNITY MESH HUB V3.0
              </span>
              <span className="text-[9px] text-slate-500">{cohortId}</span>
            </div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider mt-1">
              COHORT COMMUNITY DISCUSSION MESH
            </h1>
          </div>
        </div>

        <div className="text-[9px] text-slate-400 uppercase tracking-widest bg-black/40 border border-[#2a2c35]/40 px-3 py-1.5 rounded flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-cyan animate-pulse" />
          {members.length} MESH CLIENTS ONLINE
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-12 gap-5 h-[760px] border border-[#2a2c35] bg-black/40 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Left Column Sidebar (3/12 cols) */}
        <div className="col-span-12 md:col-span-3 border-r border-[#2a2c35] bg-[#111217]/90 flex flex-col justify-between p-4">
          <div className="space-y-6">
            
            {/* Header: Cohort Details */}
            <div className="space-y-1 bg-black/40 p-3 rounded-lg border border-[#2a2c35]/40">
              <span className="text-[8px] text-cyan uppercase font-bold tracking-widest block">SECURED ENROLLED COHORT</span>
              <span className="text-[10px] font-bold text-white uppercase tracking-wide truncate block">
                {cohortDisplayName}
              </span>
              <span className="text-[8px] text-slate-500 block truncate leading-none uppercase font-mono">{cohortId}</span>
            </div>

            {/* Personal Items Navigation */}
            <div className="space-y-1.5">
              <span className="text-[8.5px] text-slate-500 uppercase tracking-widest font-bold">PERSONAL MESH</span>
              <button
                onClick={() => setActiveSidebarTab("mentions")}
                className={`w-full flex items-center justify-between p-2 rounded transition-all text-left uppercase text-[9px] cursor-pointer ${
                  activeSidebarTab === "mentions" 
                    ? "bg-cyan/10 border border-cyan/30 text-white" 
                    : "bg-transparent border border-transparent hover:bg-black/40 text-slate-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <AtSign className="w-3.5 h-3.5 text-cyan" />
                  Mentions Ledger
                </span>
                <span className="text-[7.5px] font-mono bg-black/60 px-1 py-0.5 rounded text-slate-400">0</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab("bookmarks")}
                className={`w-full flex items-center justify-between p-2 rounded transition-all text-left uppercase text-[9px] cursor-pointer ${
                  activeSidebarTab === "bookmarks" 
                    ? "bg-cyan/10 border border-cyan/30 text-white" 
                    : "bg-transparent border border-transparent hover:bg-black/40 text-slate-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-cyan" />
                  Bookmarks Archive
                </span>
                <span className="text-[7.5px] font-mono bg-black/60 px-1 py-0.5 rounded text-slate-400">0</span>
              </button>
            </div>

            {/* Cohort Channels Navigation */}
            <div className="space-y-1.5">
              <span className="text-[8.5px] text-slate-500 uppercase tracking-widest font-bold">COHORT CHANNELS</span>
              
              <button
                onClick={() => { setActiveChannel("announcements"); setActiveSidebarTab("cohort"); }}
                className={`w-full flex items-center justify-between p-2 rounded transition-all text-left uppercase text-[9px] cursor-pointer ${
                  activeSidebarTab === "cohort" && activeChannel === "announcements"
                    ? "bg-cyan/10 border border-cyan/30 text-white font-extrabold" 
                    : "bg-transparent border border-transparent hover:bg-black/40 text-slate-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Megaphone className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                  <span className="truncate"># Announcements</span>
                </span>
                <span className="text-[7px] border border-yellow-500/20 text-yellow-500 bg-yellow-500/5 px-1 rounded font-extrabold text-[6.5px]">LOCK</span>
              </button>

              <button
                onClick={() => { setActiveChannel("discussions"); setActiveSidebarTab("cohort"); }}
                className={`w-full flex items-center justify-between p-2 rounded transition-all text-left uppercase text-[9px] cursor-pointer ${
                  activeSidebarTab === "cohort" && activeChannel === "discussions"
                    ? "bg-cyan/10 border border-cyan/30 text-white font-extrabold" 
                    : "bg-transparent border border-transparent hover:bg-black/40 text-slate-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Hash className="w-3.5 h-3.5 text-cyan" />
                  <span className="truncate"># Discussions</span>
                </span>
              </button>

              <button
                onClick={() => { setActiveChannel("question-answer"); setActiveSidebarTab("cohort"); }}
                className={`w-full flex items-center justify-between p-2 rounded transition-all text-left uppercase text-[9px] cursor-pointer ${
                  activeSidebarTab === "cohort" && activeChannel === "question-answer"
                    ? "bg-cyan/10 border border-cyan/30 text-white font-extrabold" 
                    : "bg-transparent border border-transparent hover:bg-black/40 text-slate-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate"># Question-Answer</span>
                </span>
              </button>
            </div>

          </div>

          {/* Connected roster footer */}
          <div className="pt-4 border-t border-[#2a2c35]/40 space-y-2">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold block">SYNCHRONIZATION LEDGER</span>
            <div className="flex items-center gap-2 text-slate-400 text-[8.5px]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>DIRECT ENDPOINT ONLINE</span>
            </div>
          </div>
        </div>

        {/* Center Panel (6/12 cols if desktop, 9/12 if sidebar hidden or full width) */}
        <div className="col-span-12 md:col-span-6 border-r border-[#2a2c35] bg-black/20 flex flex-col justify-between h-full relative">
          
          {/* Thread Header */}
          <div className="p-3 bg-[#111217]/80 border-b border-[#2a2c35] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeChannel === "announcements" ? (
                <Megaphone className="w-4 h-4 text-yellow-500" />
              ) : activeChannel === "question-answer" ? (
                <HelpCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Hash className="w-4 h-4 text-cyan" />
              )}
              <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                {activeSidebarTab === "cohort" ? `# ${activeChannel}` : activeSidebarTab.toUpperCase()}
              </span>
            </div>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-black/50 border border-[#2a2c35]/40 px-2 py-1 rounded">
              {channelPosts.length} TRANSACTION{channelPosts.length !== 1 ? "S" : ""} LISTED
            </span>
          </div>

          {/* Messages Feed View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[580px]">
            {isLoading && posts.length === 0 ? (
              <div className="py-24 text-center text-slate-500 uppercase animate-pulse">
                DECRYPTING ENCRYPTED DATASTREAM CHANNELS...
              </div>
            ) : activeSidebarTab !== "cohort" ? (
              <div className="py-28 text-center border border-dashed border-[#2a2c35]/60 bg-black/40 rounded-xl px-4 space-y-3">
                <Lock className="w-6 h-6 mx-auto text-slate-600 animate-pulse" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">PERSONAL TELEMETRY OFFLINE</p>
                <p className="text-[8px] text-slate-500 uppercase font-mono max-w-sm mx-auto leading-relaxed">
                  No mentions or bookmarks archived in this simulation session. Return to #channels to access collaborative streams.
                </p>
              </div>
            ) : channelPosts.length === 0 ? (
              <div className="py-28 text-center border border-dashed border-[#2a2c35]/60 bg-black/40 rounded-xl px-4 space-y-2">
                {activeChannel === "announcements" ? (
                  <Megaphone className="w-6 h-6 mx-auto text-yellow-500/50 animate-pulse" />
                ) : (
                  <MessageSquare className="w-6 h-6 mx-auto text-cyan/50 animate-bounce" />
                )}
                <p className="text-slate-400 font-bold uppercase tracking-widest">STREAM LEDGER EMPTY</p>
                <p className="text-[8px] text-slate-500 uppercase font-mono max-w-xs mx-auto leading-relaxed">
                  {activeChannel === "announcements" 
                    ? "Academy mentors have not broadcated any general announcements to this channel ledger node." 
                    : "Transmission ledger is clean. Be the first to broadcast a communication block."}
                </p>
              </div>
            ) : (
              channelPosts.map((post) => {
                const isAnn = post.is_announcement || post.channel === "announcements";
                return (
                  <div
                    key={post.id}
                    className={`p-4 rounded-xl border transition-all ${
                      post.is_pinned
                        ? "bg-cyan-950/10 border-cyan/40 shadow-[0_0_15px_rgba(34,211,238,0.06)]"
                        : isAnn
                          ? "bg-yellow-950/10 border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.04)]"
                          : "bg-[#16171D]/40 border-[#2a2c35]/80 hover:border-slate-800"
                    }`}
                  >
                    {/* Post Top bar */}
                    <div className="flex justify-between items-start gap-4 pb-2 border-b border-[#2a2c35]/40 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded bg-black border ${isAnn ? "border-yellow-500/30 text-yellow-500" : "border-slate-700 text-slate-400"} flex items-center justify-center font-bold`}>
                          {post.role === "admin" ? <Shield className="w-3.5 h-3.5 text-cyan" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white text-[9.5px] uppercase">
                              {post.author_name}
                            </span>
                            {post.role === "admin" && (
                              <span className="text-[6.5px] bg-cyan/10 text-cyan border border-cyan/30 px-1 py-0.2 rounded font-extrabold uppercase">
                                MENTOR
                              </span>
                            )}
                          </div>
                          <span className="text-[7.5px] text-slate-500 font-mono uppercase block leading-none mt-0.5">{post.created_at}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Pin control status badge */}
                        {post.is_pinned && (
                          <span className="bg-cyan/10 text-cyan border border-cyan/30 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5 text-cyan" />
                            PINNED
                          </span>
                        )}

                        {/* Moderation Controls (Admins, or owner student) */}
                        <div className="flex items-center gap-1">
                          {/* Pin Toggle Button (Admin only) */}
                          {isAdmin && (
                            <button
                              onClick={() => handleModeratePost("pin_post", post.id)}
                              className={`p-1 border rounded transition-all cursor-pointer ${
                                post.is_pinned 
                                  ? "bg-cyan/10 border-cyan text-cyan" 
                                  : "border-[#2a2c35] text-slate-500 hover:text-cyan hover:border-cyan/30"
                              }`}
                              title={post.is_pinned ? "Unpin message" : "Pin message"}
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                          )}

                          {/* Delete control button */}
                          {(isAdmin || post.is_own) && (
                            <button
                              onClick={() => handleModeratePost("remove_post", post.id)}
                              className="p-1 border border-transparent hover:border-red-500/30 text-slate-500 hover:text-red-400 rounded transition-all cursor-pointer"
                              title="Delete communication entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post content */}
                    <div className="text-[10px] text-slate-200 uppercase leading-relaxed tracking-wide break-words whitespace-pre-wrap mb-3.5 font-sans font-medium">
                      {post.content}
                    </div>

                    {/* Attachment Render Node */}
                    {post.attachment && (
                      <div className="mb-4 bg-black/50 border border-cyan/20 p-2.5 rounded-lg flex items-center justify-between gap-3 max-w-md">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-4 h-4 text-cyan shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-white uppercase tracking-wider text-[8.5px] block truncate">{post.attachment.name}</span>
                            <span className="text-[7.5px] text-slate-500 font-mono block uppercase">{post.attachment.size || "Unknown Size"}</span>
                          </div>
                        </div>
                        <a
                          href={post.attachment.url}
                          download={post.attachment.name}
                          className="p-1.5 bg-[#16171D] hover:bg-slate-800 border border-[#2a2c35] hover:border-cyan text-cyan hover:text-white rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title="Download binary asset"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Simulated Voice Note Render Node */}
                    {post.voice_note && (
                      <div className="mb-4 bg-black/50 border border-[#2a2c35] p-2.5 rounded-lg flex items-center gap-3 max-w-xs">
                        <Volume2 className="w-4 h-4 text-cyan animate-bounce shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className="font-bold text-white text-[8px] uppercase tracking-wider">AUDIO VOICE LINK</span>
                            <span className="text-[7px] text-slate-500 font-mono">{post.voice_note.duration}</span>
                          </div>
                          {/* Pulsing Audio Track Indicator */}
                          <div className="h-1 bg-[#2a2c35] rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-cyan w-1/3 animate-pulse"></div>
                          </div>
                        </div>
                        <button
                          onClick={() => showNotification("PLAYBACK TELEMETRY // Streaming play simulation initiated")}
                          className="p-1 bg-cyan text-black rounded hover:opacity-80 transition-all cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-black" />
                        </button>
                      </div>
                    )}

                    {/* Reactions Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4 border-t border-[#2a2c35]/20 pt-3">
                      {/* Existing Reactions */}
                      {post.reactions && (Object.entries(post.reactions) as [string, string[]][]).map(([emoji, users]) => {
                        if (!users || users.length === 0) return null;
                        const hasReacted = users.includes(isAdmin ? "Mallikharjuna Rao" : currentUserEmail?.split("@")[0].split(".")[0].replace(/^\w/, c => c.toUpperCase()) || "");
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiReaction(post.id, emoji)}
                            className={`px-2 py-1 rounded-full border transition-all text-[9px] flex items-center gap-1.5 cursor-pointer ${
                              hasReacted
                                ? "bg-cyan/15 border-cyan text-cyan"
                                : "bg-black/60 border-[#2a2c35] text-slate-300 hover:text-white hover:border-slate-700"
                            }`}
                            title={`Reacted by: ${users.join(", ")}`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[7.5px] font-bold font-mono">{users.length}</span>
                          </button>
                        );
                      })}

                      {/* Add Reaction Toggle */}
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === post.id ? null : post.id)}
                          className="p-1 px-2 border border-[#2a2c35] hover:border-slate-600 bg-black/40 hover:bg-black text-slate-400 hover:text-white rounded-full transition-all text-[8px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <Smile className="w-3 h-3 text-slate-500" />
                          React
                        </button>

                        {showEmojiPicker === post.id && (
                          <div className="absolute bottom-7 left-0 bg-[#16171D] border border-[#2a2c35] p-1.5 rounded-lg flex items-center gap-1.5 shadow-xl z-55">
                            {COMMON_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleEmojiReaction(post.id, emoji)}
                                className="p-1 text-xs hover:scale-125 transition-transform cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Replies Container block */}
                    <div className="space-y-3.5 pl-3 border-l border-[#2a2c35]/50">
                      {(post.replies || []).map((reply) => (
                        <div 
                          key={reply.id} 
                          className={`p-3 rounded-lg border transition-all space-y-2 relative ${
                            reply.is_accepted
                              ? "bg-emerald-950/10 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
                              : "bg-black/20 border-[#2a2c35]/40"
                          }`}
                        >
                          <div className="flex justify-between items-center pb-1.5 border-b border-[#2a2c35]/20">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-300 text-[8.5px] uppercase">
                                {reply.author_name}
                              </span>
                              {reply.role === "admin" && (
                                <span className="text-[6.5px] bg-cyan/10 text-cyan border border-cyan/20 px-1 py-0.2 rounded font-extrabold uppercase">
                                  MENTOR
                                </span>
                              )}
                              
                              {/* Accepted Solution Badge */}
                              {reply.is_accepted && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded text-[6px] font-extrabold uppercase tracking-widest flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                  ACCEPTED SOLUTION
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[7px] text-slate-500 font-mono uppercase">{reply.created_at}</span>
                              
                              {/* Delete Control (Admin or owner student) */}
                              {(isAdmin || reply.is_own) && (
                                <button
                                  onClick={() => handleModerateReply(post.id, reply.id)}
                                  className="p-0.5 text-slate-600 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded transition-all cursor-pointer"
                                  title="Delete reply"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Reply content text */}
                          <div className="text-[9.5px] text-slate-300 uppercase leading-relaxed font-sans break-words whitespace-pre-wrap">
                            {reply.content}
                          </div>

                          {/* Accept Solution Button (Admin-only, under #question-answer) */}
                          {isAdmin && activeChannel === "question-answer" && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleToggleAcceptAnswer(post.id, reply.id)}
                                className={`px-2 py-0.5 rounded border text-[7.5px] font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-all ${
                                  reply.is_accepted
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                    : "bg-black/40 border-[#2a2c35] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
                                }`}
                              >
                                <Check className="w-2.5 h-2.5" />
                                {reply.is_accepted ? "Deselect Solution" : "Accept as Solution"}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Reply Input Box */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          required
                          placeholder="WRITE A SECURED REPLY TRANSITION..."
                          value={replyContents[post.id] || ""}
                          onChange={(e) => setReplyContents(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="flex-1 bg-black border border-[#2a2c35]/60 focus:border-cyan rounded-lg px-3 py-1.5 text-white outline-none text-[9px] uppercase tracking-wide"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateReply(post.id);
                          }}
                        />
                        <button
                          onClick={() => handleCreateReply(post.id)}
                          disabled={submittingReplyId === post.id || !(replyContents[post.id] || "").trim()}
                          className="px-3.5 bg-[#16171D] hover:bg-slate-800 border border-[#2a2c35] hover:border-cyan text-white hover:text-cyan font-bold uppercase text-[8px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-45"
                        >
                          <Send className="w-2.5 h-2.5" />
                          {submittingReplyId === post.id ? "REPLYING..." : "REPLY"}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Composer Footer Form */}
          <div className="p-3 bg-[#111217]/90 border-t border-[#2a2c35] space-y-2">
            
            {/* Show selection preview if any */}
            {(attachedFile || simulatedVoiceNote) && (
              <div className="flex items-center gap-2.5 bg-black/40 border border-[#2a2c35]/60 p-2 rounded-lg max-w-sm">
                {attachedFile ? (
                  <>
                    <Paperclip className="w-3.5 h-3.5 text-cyan animate-pulse shrink-0" />
                    <span className="text-[8.5px] uppercase truncate flex-1">{attachedFile.name}</span>
                    <button onClick={() => setAttachedFile(null)} className="text-slate-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-cyan animate-bounce shrink-0" />
                    <span className="text-[8.5px] uppercase truncate flex-1">Voice Telemetry Packet ({simulatedVoiceNote?.duration})</span>
                    <button onClick={() => setSimulatedVoiceNote(null)} className="text-slate-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Composer Box Controls */}
            {activeChannel === "announcements" && !isAdmin ? (
              <div className="p-3 border border-dashed border-yellow-500/30 bg-yellow-950/5 text-yellow-500/80 rounded-xl text-center text-[8.5px] tracking-widest uppercase font-extrabold flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5 text-yellow-500/75 animate-pulse" />
                ONLY ACADEMY MENTORS MAY PUBLISH BROADCASTS IN THIS CHANNEL
              </div>
            ) : (
              <form onSubmit={handleCreatePost} className="space-y-2">
                
                {/* Composer Text Input Area */}
                <textarea
                  required={!attachedFile && !simulatedVoiceNote}
                  rows={2}
                  id="community-post-textarea"
                  placeholder={
                    isRecording 
                      ? "TELEMETRY CAPTURE IN PROGRESS... SPEAK SECURELY..." 
                      : `TYPE MESSAGE BROADCAST COORDINATES FOR #${activeChannel.toUpperCase()}...`
                  }
                  disabled={isRecording}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-black border border-[#2a2c35] focus:border-cyan text-white p-3 rounded-lg outline-none uppercase text-[9.5px] resize-none tracking-wide disabled:opacity-50"
                />

                {/* Composer Tool Belt Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  
                  {/* Tool Belt Formatting Triggers */}
                  <div className="flex flex-wrap items-center gap-2 bg-black/60 border border-[#2a2c35]/60 p-1 rounded-lg">
                    {/* Formatting */}
                    <button
                      type="button"
                      onClick={() => applyTextFormat("bold")}
                      className="p-1 text-slate-400 hover:text-cyan rounded hover:bg-[#16171D] transition-all cursor-pointer"
                      title="Bold markdown"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTextFormat("italic")}
                      className="p-1 text-slate-400 hover:text-cyan rounded hover:bg-[#16171D] transition-all cursor-pointer"
                      title="Italic markdown"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTextFormat("underline")}
                      className="p-1 text-slate-400 hover:text-cyan rounded hover:bg-[#16171D] transition-all cursor-pointer"
                      title="Underline markdown"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTextFormat("strikethrough")}
                      className="p-1 text-slate-400 hover:text-cyan rounded hover:bg-[#16171D] transition-all cursor-pointer"
                      title="Strikethrough markdown"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTextFormat("link")}
                      className="p-1 text-slate-400 hover:text-cyan rounded hover:bg-[#16171D] transition-all cursor-pointer"
                      title="Insert Link markdown"
                    >
                      <Link className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-[#2a2c35] mx-1"></div>

                    {/* Emoji Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(showEmojiPicker === "composer" ? null : "composer")}
                        className="p-1 text-slate-400 hover:text-cyan rounded hover:bg-[#16171D] transition-all cursor-pointer"
                        title="Add emoji"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                      {showEmojiPicker === "composer" && (
                        <div className="absolute bottom-7 left-0 bg-[#16171D] border border-[#2a2c35] p-1.5 rounded-lg flex items-center gap-1.5 shadow-xl z-55">
                          {COMMON_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setNewPostContent(prev => prev + emoji);
                                setShowEmojiPicker(null);
                              }}
                              className="p-1 text-xs hover:scale-125 transition-transform cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* File Picker input attachment link */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleAttachmentUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAttachment}
                      className="p-1 text-slate-400 hover:text-cyan rounded hover:bg-[#16171D] transition-all cursor-pointer disabled:opacity-40"
                      title="Attach file binary document"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>

                    {/* Recording telemetry simulation */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceRecording}
                      className={`p-1 rounded transition-all cursor-pointer ${
                        isRecording 
                          ? "text-red-400 bg-red-950/20 animate-pulse border border-red-500/20" 
                          : "text-slate-400 hover:text-cyan hover:bg-[#16171D]"
                      }`}
                      title="Record Voice note Telemetry"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Send Action Trigger */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isRecording && (
                      <span className="text-[8.5px] text-red-500 font-extrabold animate-pulse uppercase tracking-widest font-mono">
                        ● RECORDING CAPTURE [{recordingSeconds}s]
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmittingPost || isUploadingAttachment || (!newPostContent.trim() && !attachedFile && !simulatedVoiceNote)}
                      className="px-5 py-2.5 bg-cyan text-black font-extrabold uppercase text-[9px] tracking-widest rounded hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                      id="submit-community-post-btn"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmittingPost ? "TRANSMITTING..." : "BROADCAST"}
                    </button>
                  </div>

                </div>

              </form>
            )}

          </div>

        </div>

        {/* Right Sidebar Column: Connected active roster (3/12 cols) */}
        <div className="col-span-12 md:col-span-3 bg-[#111217]/90 flex flex-col justify-between p-4 h-full">
          <div className="space-y-4 h-full flex flex-col">
            
            <h2 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-[#2a2c35]/60 pb-3 font-mono shrink-0">
              <Users className="w-4 h-4 text-cyan" />
              COHORT ROSTER ACTIVE CLIENTS
            </h2>

            {/* Scrollable list of roster */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[640px]">
              {members.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-mono uppercase">
                  No active mesh clients synced.
                </div>
              ) : (
                members.map((mem, idx) => {
                  const isMentor = mem.name.includes("Mentor") || mem.name === "Mallikharjuna Rao";
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isMentor 
                          ? "bg-cyan-950/5 border-cyan/20" 
                          : "bg-black/40 border-[#2a2c35]/40 hover:border-[#2a2c35]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-[8.5px] ${
                          isMentor 
                            ? "bg-cyan/15 text-cyan border border-cyan/30 animate-pulse" 
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}>
                          {mem.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-white text-[9px] block uppercase truncate">
                            {mem.name}
                          </span>
                          {!isMentor && mem.email && isAdmin && (
                            <span className="text-[7px] text-cyan font-mono block truncate lowercase select-all">
                              {mem.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`text-[6.5px] border px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider ${
                        isMentor 
                          ? "border-cyan/30 text-cyan bg-cyan/5" 
                          : "border-[#2a2c35] text-slate-400"
                      }`}>
                        {isMentor ? "MENTOR" : "CLIENT"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
