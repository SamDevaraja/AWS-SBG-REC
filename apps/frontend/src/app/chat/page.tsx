"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SendHorizontal,
  HelpCircle,
  Check,
  MessageSquare,
  RefreshCw,
  User,
  ChevronDown,
  MoreVertical,
  Flag,
  Trash2,
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";


interface FAQChip {
  id: string;
  question: string;
  answer: string;
}

interface Message {
  role: "bot" | "user";
  text: string;
  timestamp: number;
  showEscalate?: boolean;
  isAdminReply?: boolean;
  isConfirmation?: boolean;
  status?: string;
  escalated?: boolean;
  adminName?: string;
}

function LiveChatEscalationBtn({
  msgTimestamp,
  onEscalate,
  escalated,
}: {
  msgTimestamp: number;
  onEscalate: (ts: number) => Promise<void>;
  escalated: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (escalated || loading) return;
    setLoading(true);
    await onEscalate(msgTimestamp);
    setLoading(false);
  };

  if (escalated) {
    return (
      <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-semibold">
        <Check className="w-3 h-3" />
        Sent to Core Team!
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-white/60 hover:text-white text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-40"
    >
      {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
      {loading ? "Connecting..." : "Still confused? Ask Core Team"}
    </button>
  );
}


// AWS Brand Logo Component (Standalone Orange Smile)
const AWSBrandLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 120 503 240" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="matrix(1.672925,0,0,1.668521,-2.790411,-1.835373)" fill="#FF9900">
      <path d="M273.5,143.7C240.6,168 192.8,180.9 151.7,180.9C94.1,180.9 42.2,159.6 3,124.2C-0.1,121.4 2.7,117.6 6.4,119.8C48.8,144.4 101.1,159.3 155.2,159.3C191.7,159.3 231.8,151.7 268.7,136.1C274.2,133.6 278.9,139.7 273.5,143.7Z" />
      <path d="M287.2,128.1C283,122.7 259.4,125.5 248.7,126.8C245.5,127.2 245,124.4 247.9,122.3C266.7,109.1 297.6,112.9 301.2,117.3C304.8,121.8 300.2,152.7 282.6,167.5C279.9,169.8 277.3,168.6 278.5,165.6C282.5,155.7 291.4,133.4 287.2,128.1Z" />
    </g>
  </svg>
);

// ChatTab component
const ChatTab = () => {
  const [isCustomTyping, setIsCustomTyping] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [systemMessages, setSystemMessages] = useState<Message[]>([]);
  const [activePollsCount, setActivePollsCount] = useState(0);
  const isWaitingForAdmin = activePollsCount > 0;

  useEffect(() => {
    let currentUser = null;
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        currentUser = JSON.parse(raw);
        setUser(currentUser);
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }

    const userIdKey = currentUser ? currentUser.id : "guest";
    
    // Set stable session ID
    let sId = "";
    if (currentUser) {
      sId = `session_user_${currentUser.id}`;
    } else {
      const savedGuestSession = localStorage.getItem("aws_sgb_rec_guest_session_id");
      if (savedGuestSession) {
        sId = savedGuestSession;
      } else {
        sId = `session_guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem("aws_sgb_rec_guest_session_id", sId);
      }
    }
    setSessionId(sId);

    // Load Chat History
    const historyKey = `aws_sgb_rec_chat_messages_${userIdKey}`;
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        setSystemMessages(JSON.parse(savedHistory));
      } catch {
        setSystemMessages([
          {
            role: "bot",
            text: "Hi! I'm Chat Box. I can help you with AWS certification questions, study tips, or anything cloud-related. What would you like to know?",
            timestamp: Date.now() - 1000,
            showEscalate: false,
          }
        ]);
      }
    } else {
      setSystemMessages([
        {
          role: "bot",
          text: "Hi! I'm Chat Box. I can help you with AWS certification questions, study tips, or anything cloud-related. What would you like to know?",
          timestamp: Date.now() - 1000,
          showEscalate: false,
        }
      ]);
    }

    setUserLoaded(true);
  }, []);

  // Save Chat History whenever it changes
  useEffect(() => {
    if (!userLoaded) return;
    const userIdKey = user ? user.id : "guest";
    const historyKey = `aws_sgb_rec_chat_messages_${userIdKey}`;
    localStorage.setItem(historyKey, JSON.stringify(systemMessages));
  }, [systemMessages, user, userLoaded]);

  // Fetch resolved/replied session queries from backend to merge into history on load
  useEffect(() => {
    if (!userLoaded || !sessionId) return;

    const fetchSessionReplies = async () => {
      try {
        const res = await fetch(`/api/chat/session-queries/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        const queriesList = data.data?.queries ?? data.queries ?? [];
        if (queriesList && queriesList.length > 0) {
          setSystemMessages(prev => {
            // Filter out any "Your question has been sent..." confirmation messages since we have replies
            const hasAnyReply = queriesList.some((q: any) => q.adminReply);
            const baseMsgs = hasAnyReply ? prev.filter(m => !m.isConfirmation) : prev;
            const updated = [...baseMsgs];
            let changed = hasAnyReply;
            queriesList.forEach((q: any) => {
              const hasQuestion = updated.some(m => m.role === "user" && m.text === q.message);
              const replyText = q.adminReply;
              const formattedReply = replyText;
              const hasReply = updated.some(m => 
                m.role === "bot" && 
                (m.text === formattedReply || m.text.includes(replyText) || replyText.includes(m.text))
              );

              if (!hasQuestion) {
                updated.push({
                  role: "user" as const,
                  text: q.message,
                  timestamp: new Date(q.timestamp).getTime(),
                });
                changed = true;
              }
              if (replyText && !hasReply) {
                updated.push({
                  role: "bot" as const,
                  text: formattedReply,
                  timestamp: q.resolvedAt ? new Date(q.resolvedAt).getTime() : Date.now(),
                  isAdminReply: true,
                  adminName: q.adminName,
                });
                changed = true;
              }
            });
            if (changed) {
              const sorted = updated.sort((a, b) => a.timestamp - b.timestamp);
              // Deduplicate admin replies to avoid duplicates from legacy local storage prefixes
              const unique: Message[] = [];
              const seenReplies = new Set<string>();
              sorted.forEach(m => {
                if (m.role === "bot" && m.isAdminReply) {
                  const cleanText = m.text.replace(/[\s\p{Emoji}]/gu, '').toLowerCase();
                  if (seenReplies.has(cleanText)) return;
                  seenReplies.add(cleanText);
                }
                unique.push(m);
              });
              return unique;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Error fetching session replies:", err);
      }
    };

    fetchSessionReplies();
  }, [userLoaded, sessionId]);

  const fallbackChips: FAQChip[] = [
    { id: "f1", question: "Which AWS certification is best for beginners?", answer: "The AWS Certified Cloud Practitioner is the best starting point for beginners without prior IT or cloud experience." },
    { id: "f2", question: "How should I study for the Cloud Practitioner exam?", answer: "Use the official AWS Skill Builder courses, read the whitepapers, and take practice exams to familiarize yourself with the question formats." },
    { id: "f3", question: "What is the difference between Associate and Pro certs?", answer: "Associate certs cover fundamentals and implementation, while Professional certs require deep expertise in complex, multi-service architectures and optimization." },
    { id: "f4", question: "How long do AWS certifications stay valid?", answer: "AWS certifications are valid for three (3) years from the date you pass the exam." },
    { id: "f5", question: "How can I get free hands-on practice on AWS?", answer: "You can use the AWS Free Tier, which provides free access to 100+ services for 12 months, or use AWS Skill Builder Cloud Quest." }
  ];

  const [faqChips, setFaqChips] = useState<FAQChip[]>(fallbackChips);
  const [faqLoading, setFaqLoading] = useState(true);

  const [userPendingMessages, setUserPendingMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };
  const pollingIntervalsRef = useRef<NodeJS.Timeout[]>([]);

  const allMessages = [...systemMessages, ...userPendingMessages].sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    const scrollToBottom = () => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      } else if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    };
    // Fire immediately and again after paint to handle async height changes
    scrollToBottom();
    const t = setTimeout(scrollToBottom, 60);
    return () => clearTimeout(t);
  }, [allMessages]);


  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach(clearInterval);
    };
  }, []);

  // Fetch FAQ chips from backend
  useEffect(() => {
    const fetchFaqChips = async () => {
      try {
        const res = await fetch("/api/faq-chips");
        if (res.ok) {
          const data = await res.json();
          const chipsList = data.data?.chips ?? data.chips ?? [];
          if (chipsList && chipsList.length > 0) {
            setFaqChips(chipsList);
          }
        }
      } catch (err) {
        console.error("Failed to fetch FAQ chips:", err);
      } finally {
        setFaqLoading(false);
      }
    };
    fetchFaqChips();
  }, []);

  const addPendingQuery = (unhandledId: string) => {
    const userIdKey = user ? user.id : "guest";
    const key = `aws_sgb_rec_pending_queries_${userIdKey}`;
    try {
      const existing = localStorage.getItem(key);
      const list = existing ? JSON.parse(existing) : [];
      if (!list.includes(unhandledId)) {
        list.push(unhandledId);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removePendingQuery = (unhandledId: string) => {
    const userIdKey = user ? user.id : "guest";
    const key = `aws_sgb_rec_pending_queries_${userIdKey}`;
    try {
      const existing = localStorage.getItem(key);
      if (existing) {
        const list = JSON.parse(existing);
        const filtered = list.filter((id: string) => id !== unhandledId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Polling helper for admin response
  const startAdminReplyPolling = (unhandledId: string) => {
    setActivePollsCount(c => c + 1);
    const pollInterval = setInterval(async () => {
      try {
        const pollRes = await fetch(`/api/chat/poll/${unhandledId}`);
        if (!pollRes.ok) {
          clearInterval(pollInterval);
          setActivePollsCount(c => Math.max(0, c - 1));
          removePendingQuery(unhandledId);
          return;
        }
        const pollResData = await pollRes.json();
        const pollData = pollResData.data ?? pollResData;
        if (pollData.status === "replied") {
          clearInterval(pollInterval);
          setActivePollsCount(c => Math.max(0, c - 1));
          removePendingQuery(unhandledId);
          setSystemMessages(prev => {
            const filtered = prev.filter(m => !m.isConfirmation);
            return [
              ...filtered,
              {
                role: "bot" as const,
                text: pollData.answer,
                timestamp: Date.now(),
                showEscalate: false,
                isAdminReply: true,
                adminName: pollData.adminName,
              }
            ];
          });
        } else if (pollData.status === "dismissed" || pollData.status === "timeout") {
          clearInterval(pollInterval);
          setActivePollsCount(c => Math.max(0, c - 1));
          removePendingQuery(unhandledId);
          setSystemMessages(prev => {
            const filtered = prev.filter(m => !m.isConfirmation);
            return [
              ...filtered,
              {
                role: "bot" as const,
                text: pollData.status === "dismissed"
                  ? "Core team dismissed the query. Your question has been saved — we'll follow up via email!"
                  : "Core team is currently unavailable. Your question has been saved — we'll follow up via email!",
                timestamp: Date.now(),
                showEscalate: false,
                isConfirmation: true,
              }
            ];
          });
        }
      } catch (_) {
        // ignore transient errors
      }
    }, 3000);
    pollingIntervalsRef.current.push(pollInterval);
  };

  // Resume polling for existing pending queries on load or user change
  useEffect(() => {
    if (!userLoaded) return;
    pollingIntervalsRef.current.forEach(clearInterval);
    pollingIntervalsRef.current = [];
    setActivePollsCount(0);

    const userIdKey = user ? user.id : "guest";
    const key = `aws_sgb_rec_pending_queries_${userIdKey}`;
    try {
      const existing = localStorage.getItem(key);
      if (existing) {
        const list = JSON.parse(existing);
        list.forEach((unhandledId: string) => {
          startAdminReplyPolling(unhandledId);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [userLoaded, user]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || isWaitingForAdmin) return;

    const time = Date.now();
    const newPendingMsg: Message = {
      role: "user",
      text: msg,
      status: "Sending...",
      timestamp: time
    };

    setUserPendingMessages(prev => [...prev, newPendingMsg]);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, session_id: sessionId, force_live: false })
      });

      if (!res.ok) throw new Error("Server error");
      const resData = await res.json();
      const data = resData.data ?? resData;

      setUserPendingMessages(prev => prev.filter(m => m.timestamp !== time));

      setSystemMessages(prev => {
        const nextMsgs: Message[] = [...prev, { role: "user" as const, text: msg, timestamp: time }];
         if (data.status === "answered") {
          nextMsgs.push({
            role: "bot" as const,
            text: data.answer,
            timestamp: Date.now(),
            showEscalate: true,
            isAdminReply: data.source === "admin_answer",
            adminName: data.adminName,
          });
        } else if (data.status === "unhandled") {
          nextMsgs.push({
            role: "bot" as const,
            text: "✅ Your question has been sent to the Core team! A team member will reply here shortly. You can continue browsing while you wait.",
            timestamp: Date.now(),
            showEscalate: false,
            isConfirmation: true
          });
        }
        return nextMsgs;
      });

      if (data.status === "unhandled") {
        if (data.unhandled_id) {
          addPendingQuery(data.unhandled_id);
          startAdminReplyPolling(data.unhandled_id);
        }
      }
    } catch (err) {
      console.error("Failed to send custom chat message:", err);
      setUserPendingMessages(prev => prev.filter(m => m.timestamp !== time));
      setSystemMessages(prev => [
        ...prev,
        { role: "user" as const, text: msg, timestamp: time, status: "Failed to send" }
      ]);
    }
  };

  const handleQueryClick = (chip: FAQChip) => {
    const time = Date.now();
    const botTimestamp = time + 10;
    setSystemMessages(prev => [
      ...prev,
      { role: "user" as const, text: chip.question, timestamp: time },
      { role: "bot" as const, text: chip.answer, timestamp: botTimestamp, showEscalate: true }
    ]);
  };

  const handleEscalate = async (msgTimestamp: number) => {
    const allMsgs = [...systemMessages, ...userPendingMessages].sort((a, b) => a.timestamp - b.timestamp);
    const botIdx = allMsgs.findIndex(m => m.timestamp === msgTimestamp);
    const userMsg = botIdx > 0 ? allMsgs[botIdx - 1] : null;
    const doubt = userMsg ? userMsg.text : "User requested live chat assistance";

    let unhandledId = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: doubt, session_id: sessionId, force_live: true })
      });
      if (res.ok) {
        const resData = await res.json();
        const data = resData.data ?? resData;
        unhandledId = data.unhandled_id ?? null;
      }
    } catch (_) {
      // ignore
    }

    setSystemMessages(prev => {
      const updated = prev.map(m => m.timestamp === msgTimestamp ? { ...m, escalated: true } : m);
      return [
        ...updated,
        {
          role: "bot" as const,
          text: "✅ Your question has been sent to the Core team! A team member will reply here shortly. You can continue browsing while you wait.",
          timestamp: Date.now(),
          showEscalate: false,
          isConfirmation: true,
        }
      ];
    });

    if (unhandledId) {
      addPendingQuery(unhandledId);
      startAdminReplyPolling(unhandledId);
    }
  };

  const [showFaqs, setShowFaqs] = useState(false);

  // ── Three-dot menu state ──────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // ── Report modal state ─────────────────────────────────────────────────────
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportToast, setReportToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setReportToast({ type, msg });
    setTimeout(() => setReportToast(null), 4000);
  };

  const submitReport = async () => {
    if (!reportReason) return;
    setReportSubmitting(true);
    try {
      const res = await fetch("/api/chat/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId || `session_anon_${Date.now()}`,
          reason: reportReason,
          details: reportDetails.trim() || undefined,
          user_agent: navigator.userAgent,
        }),
      });
      if (res.ok) {
        setShowReportModal(false);
        setReportReason("");
        setReportDetails("");
        showToast("success", "Report submitted — thank you! The Core team will review it.");
      } else {
        const err = await res.json().catch(() => ({}));
        showToast("error", err?.error || err?.message || "Failed to submit report. Please try again.");
      }
    } catch {
      showToast("error", "Network error. Please check your connection and try again.");
    } finally {
      setReportSubmitting(false);
    }
  };

  // ── Clear chat ────────────────────────────────────────────────────────────
  const clearChat = () => {
    const userIdKey = user ? user.id : "guest";
    const historyKey = `aws_sgb_rec_chat_messages_${userIdKey}`;
    localStorage.removeItem(historyKey);
    setSystemMessages([
      {
        role: "bot",
        text: "Chat history cleared. How can I help you?",
        timestamp: Date.now(),
        showEscalate: false,
      },
    ]);
    setUserPendingMessages([]);
    setMenuOpen(false);
  };

  // ── New conversation ──────────────────────────────────────────────────────
  const newConversation = () => {
    const userIdKey = user ? user.id : "guest";
    const historyKey = `aws_sgb_rec_chat_messages_${userIdKey}`;
    localStorage.removeItem(historyKey);
    // Fresh session ID for guest
    let newSid = sessionId;
    if (!user) {
      newSid = `session_guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem("aws_sgb_rec_guest_session_id", newSid);
      setSessionId(newSid);
    }
    setSystemMessages([
      {
        role: "bot",
        text: "Hi! I'm Chat Box. I can help you with AWS certification questions, study tips, or anything cloud-related. What would you like to know?",
        timestamp: Date.now(),
        showEscalate: false,
      },
    ]);
    setUserPendingMessages([]);
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @keyframes msgIn { from { opacity:0; transform:translateY(6px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .msg-in { animation: msgIn 0.18s cubic-bezier(0.2,0.8,0.2,1) both; }
        .chat-light-scroll::-webkit-scrollbar { width: 4px; }
        .chat-light-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-light-scroll::-webkit-scrollbar-thumb { background: rgba(35,47,62,0.12); border-radius: 99px; }
        .chat-light-scroll::-webkit-scrollbar-thumb:hover { background: rgba(35,47,62,0.25); }
      `}</style>

      {/* ── TOAST ── */}
      {reportToast && (
        <div
          className={`absolute top-14 right-4 z-50 flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12.5px] font-medium max-w-xs animate-in ${
            reportToast.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {reportToast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          )}
          <span>{reportToast.msg}</span>
        </div>
      )}

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <Flag className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 leading-none">Report an Issue</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Help us improve Chat Assistant</p>
                </div>
              </div>
              <button
                onClick={() => { setShowReportModal(false); setReportReason(""); setReportDetails(""); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reason Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Reason *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {["Bad Response", "Inappropriate Content", "Not Helpful", "Technical Issue", "Other"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setReportReason(r)}
                    className={`px-3 py-2 rounded-lg text-[12px] font-medium border transition-all text-left cursor-pointer ${
                      reportReason === r
                        ? "bg-[#FF9900]/10 border-[#FF9900] text-[#FF9900]"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Details <span className="normal-case font-normal">(optional)</span></label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe what happened..."
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#FF9900]/60 resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowReportModal(false); setReportReason(""); setReportDetails(""); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason || reportSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] disabled:bg-slate-200 disabled:text-slate-400 text-white disabled:cursor-not-allowed text-[13px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {reportSubmitting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting…</> : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="relative flex items-center gap-2.5 px-5 py-3 bg-white shrink-0 select-none z-10 border-b border-slate-200">
        <div className="relative w-9 h-9 rounded-full bg-[#232F3E] flex items-center justify-center shrink-0 shadow-xs">
          <AWSBrandLogo className="w-6 h-[14.5px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-[17px] font-bold text-slate-900 leading-none tracking-tight">Cloud Chat Assistant</p>
        </div>
        {isWaitingForAdmin && (
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-[9.5px] font-bold uppercase tracking-wider shrink-0">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            Core Team Replying...
          </div>
        )}

        {/* Three-dot menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            id="chat-menu-btn"
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Chat options"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 overflow-hidden" style={{ animation: 'menuDrop 0.15s cubic-bezier(0.2,0.8,0.2,1) both' }}>
              <style>{`@keyframes menuDrop { from { opacity:0; transform:translateY(-6px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

              {/* Report */}
              <button
                id="chat-menu-report"
                onClick={() => { setMenuOpen(false); setShowReportModal(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[13px] text-slate-700 hover:text-red-600 transition-colors cursor-pointer group"
              >
                <Flag className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                <div className="text-left">
                  <p className="font-medium leading-none">Report an Issue</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Flag a problem to Core team</p>
                </div>
              </button>

              <div className="h-px bg-slate-100 mx-3 my-0.5" />

              {/* Clear Chat */}
              <button
                id="chat-menu-clear"
                onClick={clearChat}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[13px] text-slate-700 transition-colors cursor-pointer group"
              >
                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                <div className="text-left">
                  <p className="font-medium leading-none">Clear Chat</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Remove this chat history</p>
                </div>
              </button>

              {/* New Conversation */}
              <button
                id="chat-menu-new"
                onClick={newConversation}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-[13px] text-slate-700 transition-colors cursor-pointer group"
              >
                <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-[#FF9900] transition-colors" />
                <div className="text-left">
                  <p className="font-medium leading-none">New Conversation</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Start fresh with a new session</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MESSAGE FEED ── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto chat-light-scroll bg-[#F0F2F5] min-h-0">
        <div className="px-4 sm:px-6 py-5 flex flex-col gap-1.5">
          {allMessages.map((m, i) => {
            const isUser = m.role === "user";
            const prevMsg = allMessages[i - 1];
            const showSenderLabel = !isUser && (!prevMsg || prevMsg.role === "user" || prevMsg.isAdminReply !== m.isAdminReply);
            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col msg-in",
                  isUser ? "items-end" : "items-start",
                  prevMsg && prevMsg.role !== m.role ? "mt-3" : "mt-0.5"
                )}
              >
                {showSenderLabel && (
                  <span className={cn("text-[11px] font-semibold mb-1 ml-1", m.isAdminReply ? "text-[#FF9900]" : "text-slate-500")}>
                    {m.isAdminReply
                      ? m.adminName && m.adminName !== "Core Team"
                        ? `${m.adminName} (Core Team)`
                        : "Core Team"
                      : "Chat Assistant"}
                  </span>
                )}
                <div className={cn(
                  "relative max-w-[75%] sm:max-w-[60%] px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm",
                  isUser
                    ? "bg-[#232F3E] text-white rounded-[12px] rounded-tr-[4px]"
                    : m.isAdminReply
                      ? "bg-white text-slate-800 rounded-[12px] rounded-tl-[4px] border border-slate-200 border-l-[3px] border-l-[#FF9900]"
                      : m.isConfirmation
                        ? "bg-white text-slate-800 rounded-[12px] rounded-tl-[4px] border border-emerald-200"
                        : "bg-white text-slate-800 rounded-[12px] rounded-tl-[4px] border border-slate-200"
                )}>
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div className={cn("flex items-center gap-1 mt-1.5 select-none", isUser ? "justify-end" : "justify-start")}>
                    <span className={cn("text-[10px]", isUser ? "text-white/50" : "text-slate-400")}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isUser && (
                      m.status === "Sending..."
                        ? <span className="text-[9px] text-white/40">sending</span>
                        : <Check className="w-3.5 h-3.5 text-white/60" />
                    )}
                  </div>
                </div>
                {m.role === "bot" && m.showEscalate && (
                  <div className="ml-1">
                    <LiveChatEscalationBtn msgTimestamp={m.timestamp} onEscalate={handleEscalate} escalated={!!m.escalated} />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── FAQ CHIPS (collapsible) ── */}
      <div className="shrink-0 bg-[#F0F2F5] border-t border-slate-200">
        <button
          onClick={() => setShowFaqs(v => !v)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Quick Questions</span>
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showFaqs && "rotate-180")} />
        </button>
        {showFaqs && (
          <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {faqChips.map((chip) => (
              <button
                key={chip.id}
                onClick={(e) => { (e.currentTarget as HTMLButtonElement).blur(); setShowFaqs(false); handleQueryClick(chip); }}
                disabled={isWaitingForAdmin}
                className="flex items-start gap-2 px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#FF9900]/50 text-left text-[12px] text-slate-700 hover:text-slate-900 rounded-[8px] transition-all duration-150 focus:outline-none focus:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#FF9900] shrink-0 mt-0.5 transition-colors" />
                <span className="leading-snug">{chip.question}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── INPUT BAR ── */}
      <div className="shrink-0 bg-[#F0F2F5] px-3 py-3 flex items-end gap-2">
        <div className="flex-1 flex items-end bg-white rounded-full px-4 py-2.5 border border-slate-200 focus-within:border-[#FF9900]/60 focus-within:shadow-sm transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }}
            disabled={isWaitingForAdmin}
            placeholder={isWaitingForAdmin ? "Waiting for Core Team..." : "Type a message"}
            rows={1}
            className="flex-1 bg-transparent text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none resize-none max-h-36 leading-relaxed py-0"
          />
        </div>
        <button
          onClick={send as any}
          disabled={isWaitingForAdmin || !input.trim()}
          className="group w-11 h-11 rounded-full bg-[#232F3E] hover:bg-[#FF9900] flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 disabled:bg-slate-200 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md"
        >
          <SendHorizontal className="w-5 h-5 text-white transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </>
  );
};

export default function ChatPage() {
  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-white">
      <ChatTab />
    </div>
  );
}
