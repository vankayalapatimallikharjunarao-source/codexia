import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Users, 
  ShieldAlert, 
  Pin, 
  Lock, 
  Sparkles, 
  Trash, 
  UserCheck 
} from "lucide-react";

interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  role: "student" | "admin";
  content: string;
  created_at: string;
}

interface CommunityPost {
  id: string;
  cohort_id: string;
  author_id: string;
  author_name: string;
  role: "student" | "admin";
  content: string;
  is_announcement: boolean;
  created_at: string;
  replies?: CommunityReply[];
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

interface CohortCommunityHubProps {
  cohortId: string;
  userRole: "admin" | "student" | null;
  userTrack: "base" | "premium" | "admin" | null;
  currentUserEmail: string | null;
  sessionToken: string | null;
  showNotification: (msg: string) => void;
}

export default function CohortCommunityHub({
  cohortId,
  userRole,
  userTrack,
  currentUserEmail,
  sessionToken,
  showNotification
}: CohortCommunityHubProps) {
  const isAdmin = userRole === "admin";
  const isPremium = userTrack === "premium" || isAdmin;

  const [activeTab, setActiveTab] = useState<"discussion" | "announcements" | "dms">("discussion");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [dms, setDms] = useState<DirectMessage[]>([]);
  
  // DM Student Selection for Admin
  const [dmRoster, setDmRoster] = useState<string[]>([]);
  const [selectedStudentForDM, setSelectedStudentForDM] = useState<string>("");

  const [newPostContent, setNewPostContent] = useState("");
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [newDmContent, setNewDmContent] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch Community Feed & DMs
  const fetchCommunityAndDMs = async () => {
    if (!cohortId) return;
    const token = sessionToken || sessionStorage.getItem("codexia_session_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      // 1. Fetch posts
      const postsRes = await fetch(`/api/community/${cohortId}`, { headers });
      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data);
      }

      // 2. Fetch DMs
      let dmsUrl = `/api/dms/${cohortId}`;
      if (isAdmin && selectedStudentForDM) {
        dmsUrl += `?student_email=${encodeURIComponent(selectedStudentForDM)}`;
      }
      const dmsRes = await fetch(dmsUrl, { headers });
      if (dmsRes.ok) {
        const data = await dmsRes.json();
        setDms(data);
      }

      // 3. Fetch Admin Roster if Admin
      if (isAdmin) {
        const rosterRes = await fetch(`/api/admin/cohorts/${cohortId}/roster`, { headers });
        if (rosterRes.ok) {
          const rosterData = await rosterRes.json();
          const studentEmails = rosterData.map((s: any) => s.email);
          setDmRoster(studentEmails);
          if (studentEmails.length > 0 && !selectedStudentForDM) {
            setSelectedStudentForDM(studentEmails[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error polling community data:", err);
    }
  };

  useEffect(() => {
    fetchCommunityAndDMs();
    const interval = setInterval(fetchCommunityAndDMs, 4000);
    return () => clearInterval(interval);
  }, [cohortId, selectedStudentForDM]);

  const handleCreatePost = async (e: React.FormEvent, isAnnouncement: boolean = false) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setLoading(true);
    try {
      const token = sessionToken || sessionStorage.getItem("codexia_session_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/community/${cohortId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: newPostContent,
          is_announcement: isAnnouncement
        })
      });

      if (res.ok) {
        setNewPostContent("");
        showNotification("SUCCESS // Post broadcasted to cohort community!");
        fetchCommunityAndDMs();
      } else {
        const err = await res.json();
        showNotification(`ERROR // ${err.error || "Failed to post"}`);
      }
    } catch (err) {
      console.error("Post exception:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const replyText = replyContents[postId];
    if (!replyText || !replyText.trim()) return;

    try {
      const token = sessionToken || sessionStorage.getItem("codexia_session_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/community/${cohortId}/reply`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          post_id: postId,
          content: replyText
        })
      });

      if (res.ok) {
        setReplyContents(prev => ({ ...prev, [postId]: "" }));
        showNotification("SUCCESS // Reply added to thread.");
        fetchCommunityAndDMs();
      } else {
        const err = await res.json();
        showNotification(`ERROR // ${err.error || "Failed to reply"}`);
      }
    } catch (err) {
      console.error("Reply exception:", err);
    }
  };

  const handleModerate = async (action: "remove_post" | "remove_reply", targetId: string, postId?: string) => {
    if (!window.confirm("Are you sure you want to moderate/delete this item?")) return;

    try {
      const token = sessionToken || sessionStorage.getItem("codexia_session_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/community/${cohortId}/moderate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          action,
          target_id: targetId,
          post_id: postId
        })
      });

      if (res.ok) {
        showNotification("SUCCESS // Item moderated successfully.");
        fetchCommunityAndDMs();
      } else {
        const err = await res.json();
        showNotification(`ERROR // ${err.error || "Failed to moderate"}`);
      }
    } catch (err) {
      console.error("Moderate exception:", err);
    }
  };

  const handleSendDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDmContent.trim()) return;

    try {
      const token = sessionToken || sessionStorage.getItem("codexia_session_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/dms/${cohortId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: newDmContent,
          student_email: isAdmin ? selectedStudentForDM : undefined
        })
      });

      if (res.ok) {
        setNewDmContent("");
        showNotification("SUCCESS // Message sent!");
        fetchCommunityAndDMs();
      } else {
        const err = await res.json();
        showNotification(`ERROR // ${err.error || "Failed to send message"}`);
      }
    } catch (err) {
      console.error("DM exception:", err);
    }
  };

  const announcementPosts = posts.filter(p => p.is_announcement);
  const discussionPosts = posts.filter(p => !p.is_announcement);

  return (
    <div id="cohort-community-hub" className="bg-[#16171D]/40 border border-[#2a2c35] p-6 rounded-xl space-y-6 mt-8 relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay pointer-events-none opacity-5"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2a2c35]/60 pb-4 relative z-10">
        <div>
          <span className="text-[8px] text-[#E58A3C] uppercase tracking-widest font-mono font-bold block">
            SECURE CLIENT NETWORK GATEWAY
          </span>
          <h3 className="text-sm font-bold text-white uppercase tracking-[0.1em] flex items-center gap-2 mt-0.5">
            <Users className="w-4 h-4 text-cyan" />
            Cohort Community Mesh Hub // <span className="text-cyan font-mono">{cohortId}</span>
          </h3>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-black/80 border border-[#2a2c35] p-1 rounded-lg text-[9px] font-mono">
          <button
            onClick={() => setActiveTab("discussion")}
            className={`px-3 py-1.5 uppercase rounded font-bold cursor-pointer transition-all ${
              activeTab === "discussion" ? "bg-cyan text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            DISCUSSIONS ({discussionPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-3 py-1.5 uppercase rounded font-bold cursor-pointer transition-all ${
              activeTab === "announcements" ? "bg-[#E58A3C] text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            ANNOUNCEMENTS ({announcementPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("dms")}
            className={`px-3 py-1.5 uppercase rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === "dms"
                ? "bg-purple-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {!isPremium && <Lock className="w-3 h-3 text-red-400 shrink-0" />}
            PRIORITY DM
          </button>
        </div>
      </div>

      {activeTab === "discussion" && (
        <div className="space-y-4 relative z-10">
          {/* Post submission form */}
          <form onSubmit={(e) => handleCreatePost(e, false)} className="space-y-3 bg-black/50 border border-[#2a2c35]/60 p-4 rounded-lg">
            <div className="text-[8px] text-slate-400 font-mono uppercase">
              CREATE_NEW_DISCUSSION_POST // BROADCAST_TO_ROSTER
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind? Discuss code, load balancers, or prompt engineering pipelines..."
              rows={3}
              maxLength={1000}
              className="w-full bg-[#0d0e14] border border-[#2a2c35] rounded-lg p-3 text-[10px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan uppercase resize-none leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-cyan hover:bg-cyan/90 text-black font-bold uppercase tracking-wider text-[9px] rounded transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                {loading ? "TRANSMITTING..." : "BROADCAST POST"}
              </button>
            </div>
          </form>

          {/* Posts list */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {discussionPosts.length > 0 ? (
              discussionPosts.map(post => (
                <div key={post.id} className="bg-black/30 border border-[#2a2c35] rounded-lg p-4 space-y-3 relative">
                  <div className="flex justify-between items-start border-b border-[#2a2c35]/40 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white uppercase">{post.author_name}</span>
                      <span className={`text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        post.role === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-cyan/10 text-cyan border border-cyan/20"
                      }`}>
                        {post.role === "admin" ? "MENTOR" : "STUDENT"}
                      </span>
                      {isAdmin && (
                        <span className="text-[7.5px] font-mono text-slate-500 lowercase">({post.author_id})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[7.5px] text-slate-500 font-mono">{post.created_at}</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleModerate("remove_post", post.id)}
                          className="p-1 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 rounded transition-all cursor-pointer"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 font-mono leading-relaxed select-text uppercase">
                    {post.content}
                  </p>

                  {/* Replies section */}
                  <div className="pl-4 border-l border-cyan/20 space-y-2 mt-3 pt-2">
                    {(post.replies || []).map(reply => (
                      <div key={reply.id} className="bg-[#0D0E12]/50 border border-[#2a2c35]/40 rounded p-2.5 space-y-1 relative">
                        <div className="flex justify-between items-center text-[8px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-200 uppercase">{reply.author_name}</span>
                            <span className={`text-[6.5px] font-bold uppercase px-1 rounded ${
                              reply.role === "admin" ? "bg-red-500/10 text-red-400" : "bg-cyan/10 text-cyan"
                            }`}>
                              {reply.role === "admin" ? "MENTOR" : "STUDENT"}
                            </span>
                            {isAdmin && (
                              <span className="text-[7px] font-mono text-slate-500 lowercase">({reply.author_id})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-mono">{reply.created_at}</span>
                            {isAdmin && (
                              <button
                                onClick={() => handleModerate("remove_reply", reply.id, post.id)}
                                className="p-0.5 hover:bg-red-500/10 text-red-400 rounded transition-all cursor-pointer"
                              >
                                <Trash className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono leading-relaxed select-text uppercase">
                          {reply.content}
                        </p>
                      </div>
                    ))}

                    {/* Add reply form */}
                    <form onSubmit={(e) => handleCreateReply(e, post.id)} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={replyContents[post.id] || ""}
                        onChange={(e) => setReplyContents(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add a reply to this thread..."
                        className="flex-grow bg-[#0d0e14] border border-[#2a2c35]/80 rounded p-2 text-[9px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan uppercase"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-[#16171D] border border-[#2a2c35] hover:border-cyan hover:bg-cyan hover:text-black font-bold uppercase text-[8px] rounded transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-2.5 h-2.5" />
                        REPLY
                      </button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-black/20 border border-dashed border-[#2a2c35] rounded-lg">
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  No discussion nodes broadcasted yet. Start the conversation above!
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="space-y-4 relative z-10">
          {/* Announcements post form (Admin Only) */}
          {isAdmin && (
            <form onSubmit={(e) => handleCreatePost(e, true)} className="space-y-3 bg-red-950/10 border border-red-500/20 p-4 rounded-lg">
              <div className="text-[8px] text-red-400 font-mono uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                CREATE_OFFICIAL_ANNOUNCEMENT // COHORT_MANDATORY_NOTIFICATIONS
              </div>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Broadcast official mandatory cohort notice or scheduling revision update..."
                rows={3}
                className="w-full bg-[#0d0e14] border border-red-500/20 rounded-lg p-3 text-[10px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500 uppercase resize-none leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-black font-bold uppercase tracking-wider text-[9px] rounded transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                >
                  <Pin className="w-3 h-3" />
                  {loading ? "TRANSMITTING..." : "PIN ANNOUNCEMENT"}
                </button>
              </div>
            </form>
          )}

          {/* Announcements list */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {announcementPosts.length > 0 ? (
              announcementPosts.map(post => (
                <div key={post.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-3 relative">
                  <div className="absolute top-4 right-4 text-red-400 flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest">
                    <Pin className="w-2.5 h-2.5" />
                    PINNED NOTICE
                  </div>

                  <div className="flex justify-between items-center border-b border-red-500/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-400 uppercase">{post.author_name}</span>
                      <span className="text-[7.5px] font-mono text-slate-500 lowercase">({post.author_id})</span>
                    </div>
                    <div className="flex items-center gap-2 mr-24">
                      <span className="text-[7.5px] text-slate-500 font-mono">{post.created_at}</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleModerate("remove_post", post.id)}
                          className="p-1 hover:bg-red-500/10 text-red-400 rounded transition-all cursor-pointer"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-200 font-mono leading-relaxed select-text uppercase">
                    {post.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-black/20 border border-dashed border-[#2a2c35] rounded-lg">
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  No official pinned notices found on this cohort stream.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "dms" && (
        <div className="space-y-4 relative z-10">
          {!isPremium ? (
            /* Locked / Gated premium experience */
            <div className="p-8 border border-dashed border-purple-500/30 bg-purple-950/5 rounded-lg text-center space-y-4">
              <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/30 text-purple-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(147,51,234,0.1)]">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] bg-purple-500 text-white font-bold px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                  PREMIUM ALPHA GATED
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Direct Mentor Access Locked
                </h4>
                <p className="text-[9px] text-[#A0A2B0] uppercase leading-relaxed max-w-sm mx-auto font-mono">
                  The direct student-to-mentor messaging system is an exclusive Premium Alpha pipeline. Upgrade your ledger credentials to access direct consulting.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[8px] text-cyan font-bold uppercase tracking-widest animate-pulse">
                  // GO TO PRICING TAB TO RE-SECURE ACQUISITION
                </span>
              </div>
            </div>
          ) : (
            /* Active Premium direct messaging */
            <div className="grid grid-cols-12 gap-4">
              {isAdmin && (
                /* Admin student selector column */
                <div className="col-span-12 md:col-span-4 bg-black/40 border border-[#2a2c35] p-3 rounded-lg flex flex-col space-y-2">
                  <span className="text-[8px] text-slate-400 font-mono uppercase">
                    SELECT_STUDENT_ROSTER:
                  </span>
                  {dmRoster.length > 0 ? (
                    <div className="space-y-1 overflow-y-auto max-h-[250px] pr-1">
                      {dmRoster.map(email => (
                        <button
                          key={email}
                          onClick={() => setSelectedStudentForDM(email)}
                          className={`w-full text-left p-2 rounded text-[8px] font-mono uppercase truncate transition-all cursor-pointer border ${
                            selectedStudentForDM === email
                              ? "bg-purple-600/10 text-white border-purple-500"
                              : "bg-transparent text-slate-400 border-transparent hover:border-[#2a2c35]/60 hover:text-white"
                          }`}
                        >
                          ● {email.split("@")[0]} ({email})
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[8.5px] text-slate-500 text-center py-4 uppercase">
                      No registered students found in cohort roster.
                    </div>
                  )}
                </div>
              )}

              {/* Chat messages viewport */}
              <div className={`col-span-12 ${isAdmin ? "md:col-span-8" : "w-full"} bg-black/60 border border-[#2a2c35] rounded-lg overflow-hidden flex flex-col justify-between h-[350px]`}>
                <div className="p-3 border-b border-[#2a2c35] bg-black/80 flex justify-between items-center">
                  <span className="text-[8.5px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    SECURE DIRECT CONTEXT // {isAdmin ? `STUDENT: ${selectedStudentForDM || "loading..."}` : "MENTOR: MALLIKHARJUNA RAO"}
                  </span>
                  <span className="text-[7.5px] text-emerald-400 font-mono font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    ENCRYPTED NODE
                  </span>
                </div>

                <div className="flex-grow p-4 overflow-y-auto space-y-3">
                  {dms.length > 0 ? (
                    dms.map(dm => {
                      const isMe = dm.sender_name !== "Mallikharjuna Rao (Mentor)" ? !isAdmin : isAdmin;
                      return (
                        <div
                          key={dm.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-xs rounded-lg p-2.5 border uppercase text-[9px] leading-relaxed font-mono ${
                            isMe
                              ? "bg-purple-600/10 border-purple-500/30 text-white text-right"
                              : "bg-white/5 border-[#2a2c35] text-slate-300 text-left"
                          }`}>
                            <div className="flex justify-between gap-4 text-[7px] opacity-70 mb-1">
                              <span className="font-bold">{dm.sender_name}</span>
                              <span>{dm.created_at}</span>
                            </div>
                            <p className="select-text whitespace-pre-wrap">{dm.content}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-[9px] uppercase font-mono">
                      No direct transmission packets synced. Begin secure dialogue below.
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendDm} className="p-2 border-t border-[#2a2c35] bg-black flex gap-2">
                  <input
                    type="text"
                    value={newDmContent}
                    onChange={(e) => setNewDmContent(e.target.value)}
                    placeholder={isAdmin ? `Transmit secure DM response...` : `Transmit priority direct message to Mallikharjuna Rao...`}
                    disabled={isAdmin && !selectedStudentForDM}
                    className="flex-grow bg-[#0d0e14] border border-[#2a2c35] rounded p-2 text-[9px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isAdmin && !selectedStudentForDM}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-[8px] rounded transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    SEND
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
