"use client";

import React, { useState, useEffect, useRef } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const COLORS = {
  bg: "#F8FAFC",          // Clean light slate background
  sidebar: "#232F3E",     // AWS Navy/Charcoal
  sidebarDark: "#1A222D", // Darker AWS charcoal
  teal: "#475569",        // Slate gray for muted labels
  mint: "rgba(255, 255, 255, 0.5)", // White highlight borders
  gold: "#FF9900",        // AWS Orange
  text: "#0F172A",        // Slate-900 for text
  surface: "rgba(255, 255, 255, 0.55)", // Frosted white glass face
  purple: "#7C4DFF",      // Professional purple accent
};

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
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  time: string;
  format: string;
  content: string;
  icon: string;
  registerUrl: string;
}

const Icon = ({ name, size = 16, color = "currentColor" }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    cloud: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
    award: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
    "message-circle": <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 19 12 15 16 19" /><line x1="12" y1="15" x2="12" y2="22" /><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" /></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    mic: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
    code: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    "check-circle": <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    loader: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    "play-circle": <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>,
    "file-text": <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    "book-open": <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
    terminal: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
    circle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>,
    layers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M16.24 7.76a6 6 0 0 1 0 8.49M4.93 4.93a10 10 0 0 0 0 14.14M7.76 7.76a6 6 0 0 0 0 8.49" /></svg>,
    building: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" /><path d="M8 7h8M8 11h8" /></svg>,
    "git-branch": <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>,
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.14Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.14Z" /></svg>,
    database: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
    network: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><line x1="12" y1="12" x2="12" y2="8" /></svg>,
    bot: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  };
  return icons[name] || null;
};

// LiveChat Escalation Button Component
function LiveChatEscalationBtn({ 
  msgTimestamp, 
  onEscalate, 
  escalated 
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
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(46, 125, 50, 0.25)", border: "1px solid rgba(76, 175, 80, 0.5)", width: "fit-content", backdropFilter: "blur(5px)" }}>
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        <span style={{ fontSize: 11, color: "#4caf50", fontWeight: 700 }}>Request Sent to Team!</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-3d-light text-[11px]"
      style={{
        marginTop: 10,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 13px",
        borderRadius: 10,
        cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
            <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Not satisfied? Chat live with Team →
        </>
      )}
    </button>
  );
}

// Structured Announcement Card
const AnnouncementCard = ({ ann }: { ann: Announcement }) => (
  <div
    style={{
      background: "rgba(255, 255, 255, 0.45)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      padding: 16,
      animation: "slideUp 0.3s ease",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
  >
    {/* Card Header */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: "rgba(0, 0, 0, 0.05)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        border: "1px solid rgba(0, 0, 0, 0.08)",
      }}>
        <Icon name={ann.icon} size={18} color={COLORS.sidebar} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 className="text-xs" style={{ margin: 0, fontWeight: 700, color: COLORS.sidebar, lineHeight: 1.3 }}>{ann.title}</h4>
        <span className="text-[10px]" style={{ color: "rgba(0, 0, 0, 0.5)", fontWeight: 600 }}>Posted by Team</span>
      </div>
    </div>

    {/* Date / Time / Format row */}
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10,
    }}>
      <span className="text-[10px]" style={{ padding: "3px 8px", borderRadius: 99, background: "rgba(0, 0, 0, 0.05)", color: COLORS.sidebar, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon name="calendar" size={10} color={COLORS.sidebar} />{ann.date}
      </span>
      <span className="text-[10px]" style={{ padding: "3px 8px", borderRadius: 99, background: "rgba(0, 0, 0, 0.05)", color: COLORS.sidebar, fontWeight: 600 }}>
        🕐 {ann.time}
      </span>
      <span className="text-[10px]" style={{ padding: "3px 8px", borderRadius: 99, background: "rgba(0, 0, 0, 0.08)", color: COLORS.sidebar, fontWeight: 600 }}>
        {ann.format}
      </span>
    </div>

    {/* Description */}
    <p className="text-[11px]" style={{ margin: "0 0 14px", color: COLORS.text, lineHeight: 1.6 }}>{ann.content}</p>

    {/* Register Button */}
    <a href={ann.registerUrl} className="btn-3d text-[11px]" style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 10, padding: "8px 16px", textDecoration: "none", userSelect: "none" }}>
      <Icon name="plus" size={11} color="#000" />
      Register Now
    </a>
  </div>
);

// ChatTab component
const ChatTab = ({ isMobile }: { isMobile: boolean }) => {
  const [activeChannel, setActiveChannel] = useState("announcement");
  const [isCustomTyping, setIsCustomTyping] = useState(false);
  const [escalatedMsgs, setEscalatedMsgs] = useState<Set<number>>(new Set());
  const [isWaitingForAdmin, setIsWaitingForAdmin] = useState(false);
  const [showGuideDialog, setShowGuideDialog] = useState(false);
  const guideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const openCustomTyping = () => {
    setIsCustomTyping(true);
    setShowGuideDialog(true);
    if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    guideTimerRef.current = setTimeout(() => setShowGuideDialog(false), 5000);
  };

  // Persistent session ID
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const sId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    setSessionId(sId);
  }, []);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          if (Array.isArray(list)) {
            const mapped = list.map((ann: any) => {
              const dateObj = new Date(ann.createdAt);
              const dateStr = dateObj.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
              });
              const timeStr = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short"
              }).replace(/([\d]+:[\d]+)\s([AP]M)/, "$1 $2");

              const iconMap: Record<string, string> = {
                UPDATE: "code",
                REMINDER: "calendar",
                SCHEDULE_CHANGE: "calendar",
                URGENT: "shield",
                INFO: "mic"
              };

              return {
                id: ann.id,
                title: ann.title,
                date: dateStr,
                time: timeStr,
                format: ann.event?.mode || ann.type || "Update",
                content: ann.message,
                icon: iconMap[ann.type] || "mic",
                registerUrl: ann.eventId ? `/events` : "#"
              };
            });
            setAnnouncements(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      } finally {
        setAnnouncementsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const fallbackChips: FAQChip[] = [
    { id: "f1", question: "Which AWS certification is best for beginners?", answer: "The AWS Certified Cloud Practitioner is the best starting point for beginners without prior IT or cloud experience." },
    { id: "f2", question: "How should I study for the Cloud Practitioner exam?", answer: "Use the official AWS Skill Builder courses, read the whitepapers, and take practice exams to familiarize yourself with the question formats." },
    { id: "f3", question: "What is the difference between Associate and Pro certs?", answer: "Associate certs cover fundamentals and implementation, while Professional certs require deep expertise in complex, multi-service architectures and optimization." },
    { id: "f4", question: "How long do AWS certifications stay valid?", answer: "AWS certifications are valid for three (3) years from the date you pass the exam." },
    { id: "f5", question: "How can I get free hands-on practice on AWS?", answer: "You can use the AWS Free Tier, which provides free access to 100+ services for 12 months, or use AWS Skill Builder Cloud Quest." }
  ];

  const [faqChips, setFaqChips] = useState<FAQChip[]>(fallbackChips);
  const [faqLoading, setFaqLoading] = useState(true);

  const [systemMessages, setSystemMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm Chat Box 👋 I can help you with AWS certification questions, study tips, or anything cloud-related. What would you like to know?",
      timestamp: Date.now() - 1000,
      showEscalate: false,
    }
  ]);
  const [userPendingMessages, setUserPendingMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingIntervalsRef = useRef<NodeJS.Timeout[]>([]);

  const allMessages = [...systemMessages, ...userPendingMessages].sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (bottomRef.current) {
      const container = bottomRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [allMessages, activeChannel]);

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
          if (data.chips && data.chips.length > 0) {
            setFaqChips(data.chips);
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

  // Polling helper for admin response
  const startAdminReplyPolling = (unhandledId: string) => {
    setIsWaitingForAdmin(true);
    const pollInterval = setInterval(async () => {
      try {
        const pollRes = await fetch(`/api/chat/poll/${unhandledId}`);
        if (!pollRes.ok) {
          clearInterval(pollInterval);
          setIsWaitingForAdmin(false);
          return;
        }
        const pollData = await pollRes.json();
        if (pollData.status === "replied") {
          clearInterval(pollInterval);
          setIsWaitingForAdmin(false);
          setSystemMessages(prev => [
            ...prev,
            {
              role: "bot",
              text: `🧑‍💼 Core replied: ${pollData.answer}`,
              timestamp: Date.now(),
              showEscalate: false,
              isAdminReply: true,
            }
          ]);
        } else if (pollData.status === "dismissed" || pollData.status === "timeout") {
          clearInterval(pollInterval);
          setIsWaitingForAdmin(false);
          setSystemMessages(prev => [
            ...prev,
            {
              role: "bot",
              text: pollData.status === "dismissed"
                ? "Core team dismissed the query. Your question has been saved — we'll follow up via email!"
                : "Core team is currently unavailable. Your question has been saved — we'll follow up via email!",
              timestamp: Date.now(),
              showEscalate: false,
              isConfirmation: true,
            }
          ]);
        }
      } catch (_) {
        clearInterval(pollInterval);
        setIsWaitingForAdmin(false);
      }
    }, 3000);
    pollingIntervalsRef.current.push(pollInterval);
  };

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

    setIsWaitingForAdmin(true);
    setUserPendingMessages(prev => [...prev, newPendingMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, session_id: sessionId, force_live: false })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      setUserPendingMessages(prev => prev.filter(m => m.timestamp !== time));
      setSystemMessages(prev => [...prev, { role: "user", text: msg, timestamp: time }]);

      if (data.status === "answered") {
        setIsWaitingForAdmin(false);
        setSystemMessages(prev => [
          ...prev,
          {
            role: "bot",
            text: data.answer,
            timestamp: Date.now(),
            showEscalate: true
          }
        ]);
      } else if (data.status === "unhandled") {
        setSystemMessages(prev => [
          ...prev,
          {
            role: "bot",
            text: "✅ Your question has been sent to the Core team! A team member will reply here shortly. You can continue browsing while you wait.",
            timestamp: Date.now(),
            showEscalate: false,
            isConfirmation: true
          }
        ]);
        if (data.unhandled_id) {
          startAdminReplyPolling(data.unhandled_id);
        } else {
          setIsWaitingForAdmin(false);
        }
      }
    } catch (err) {
      console.error("Failed to send custom chat message:", err);
      setIsWaitingForAdmin(false);
      setUserPendingMessages(prev =>
        prev.map(m => m.timestamp === time ? { ...m, status: "Failed to send" } : m)
      );
    }
  };

  const handleQueryClick = (chip: FAQChip) => {
    const time = Date.now();
    const botTimestamp = time + 10;
    setSystemMessages(prev => [
      ...prev,
      { role: "user", text: chip.question, timestamp: time },
      { role: "bot", text: chip.answer, timestamp: botTimestamp, showEscalate: true }
    ]);
  };

  const handleEscalate = async (msgTimestamp: number) => {
    const allMsgs = [...systemMessages, ...userPendingMessages].sort((a, b) => a.timestamp - b.timestamp);
    const botIdx = allMsgs.findIndex(m => m.timestamp === msgTimestamp);
    const userMsg = botIdx > 0 ? allMsgs[botIdx - 1] : null;
    const doubt = userMsg ? userMsg.text : "User requested live chat assistance";

    let unhandledId = null;
    setIsWaitingForAdmin(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: doubt, session_id: sessionId, force_live: true })
      });
      if (res.ok) {
        const data = await res.json();
        unhandledId = data.unhandled_id ?? null;
      }
    } catch (_) {
      // ignore
    }

    setEscalatedMsgs(prev => new Set([...prev, msgTimestamp]));

    setSystemMessages(prev => [
      ...prev,
      {
        role: "bot",
        text: "✅ Your question has been sent to the Core team! A team member will reply here shortly. You can continue browsing while you wait.",
        timestamp: Date.now(),
        showEscalate: false,
        isConfirmation: true,
      }
    ]);

    if (unhandledId) {
      startAdminReplyPolling(unhandledId);
    } else {
      setIsWaitingForAdmin(false);
    }
  };

  return (
    <div style={{
      position: "relative",
      height: isMobile ? "calc(100vh - 120px)" : "calc(100vh - 160px)",
      borderRadius: 16,
      overflow: "hidden",
      background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)",
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      color: COLORS.text,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.sidebar}; border-radius: 4px; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes guideSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes countdown {
          from { width: 100%; }
          to   { width: 0%; }
        }

        /* 3D Push Effect */
        .btn-3d {
          transform: translateY(0);
          background: rgba(255, 255, 255, 0.35) !important;
          border: 1px solid rgba(255, 255, 255, 0.6) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: #232F3E !important;
          font-weight: 700 !important;
          box-shadow: 
            0 4px 10px rgba(0, 0, 0, 0.04), 
            0 12px 25px rgba(255, 153, 0, 0.25), 
            inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
          transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer;
        }
        .btn-3d:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.45) !important;
          box-shadow: 
            0 6px 15px rgba(0, 0, 0, 0.06), 
            0 16px 35px rgba(255, 153, 0, 0.35), 
            inset 0 1.5px 0 rgba(255, 255, 255, 0.8) !important;
        }
        .btn-3d:active {
          transform: translateY(1px);
          background: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.04), 
            0 8px 15px rgba(255, 153, 0, 0.2), 
            inset 0 1px 0 rgba(255, 255, 255, 0.55) !important;
        }
        .btn-3d-light {
          transform: translateY(0);
          background: rgba(255, 255, 255, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          color: #232F3E !important;
          font-weight: 600 !important;
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.03), 
            0 10px 20px rgba(35, 47, 62, 0.06), 
            inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
          transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer;
        }
        .btn-3d-light:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.3) !important;
          box-shadow: 
            0 6px 12px rgba(0, 0, 0, 0.05), 
            0 14px 28px rgba(35, 47, 62, 0.12), 
            inset 0 1.5px 0 rgba(255, 255, 255, 0.65) !important;
        }
        .btn-3d-light:active {
          transform: translateY(1px);
          background: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.02), 
            0 6px 12px rgba(35, 47, 62, 0.08), 
            inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
        }
        .chat-input::placeholder {
          color: rgba(35, 47, 62, 0.45) !important;
        }
        @media (max-width: 767px) {
          .query-grid > button { flex: 1 1 100% !important; }
        }
      `}</style>

      {/* Liquid Blobs */}
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "-10%",
        width: "60%",
        height: "60%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255, 153, 0, 0.16) 0%, rgba(255, 153, 0, 0) 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        right: "-10%",
        width: "60%",
        height: "60%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(35, 47, 62, 0.12) 0%, rgba(35, 47, 62, 0) 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        top: "30%",
        left: "30%",
        width: "40%",
        height: "40%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)",
        filter: "blur(30px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Main Glass Panel */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.2) 100%)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: 14,
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
        overflow: "hidden",
        zIndex: 1,
        position: "relative",
        minHeight: 0
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0, 0, 0, 0.08)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255, 255, 255, 0.6)" }}>
            <Icon name="bot" size={18} color={COLORS.sidebar} />
          </div>
          <div>
            <div className="text-xs" style={{ fontWeight: 700, color: COLORS.sidebar }}>Chat Box</div>
            <div className="text-[10px]" style={{ color: "#16a34a", fontWeight: 600 }}>● Online</div>
          </div>
        </div>

        {/* Channel Toggle Tabs */}
        <div style={{ 
          display: "flex", 
          gap: 6,
          padding: "6px", 
          margin: "12px 16px 6px",
          background: "rgba(0, 0, 0, 0.04)",
          borderRadius: 14,
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
        }}>
          <button 
            onClick={() => setActiveChannel("announcement")} 
            className={activeChannel === "announcement" ? "btn-3d text-xs" : "btn-3d-light text-xs"}
            style={{ 
              flex: 1, 
              padding: "10px 16px", 
              borderRadius: 12,
              cursor: "pointer", 
              fontFamily: "inherit",
              ...(activeChannel === "announcement" ? {} : {
                background: "transparent",
                borderColor: "transparent",
                boxShadow: "none",
                color: "rgba(42, 37, 33, 0.65)"
              })
            }}
          >
            Announcement
          </button>
          <button 
            onClick={() => setActiveChannel("doubt")} 
            className={activeChannel === "doubt" ? "btn-3d text-xs" : "btn-3d-light text-xs"}
            style={{ 
              flex: 1, 
              padding: "10px 16px", 
              borderRadius: 12,
              cursor: "pointer", 
              fontFamily: "inherit",
              ...(activeChannel === "doubt" ? {} : {
                background: "transparent",
                borderColor: "transparent",
                boxShadow: "none",
                color: "rgba(42, 37, 33, 0.65)"
              })
            }}
          >
            Core Chat 💬
          </button>
        </div>

        {/* Content Feed/Chat */}
        {activeChannel === "announcement" ? (
          /* Announcement Feed */
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {announcementsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.sidebar} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                </svg>
              </div>
            ) : announcements.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, opacity: 0.6 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.05)",
                  display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: 12
                }}>
                  <Icon name="mic" size={24} color={COLORS.sidebar} />
                </div>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: COLORS.sidebar }}>No Announcements Yet</h4>
                <p style={{ margin: "4px 0 0 0", fontSize: 11, textAlign: "center", color: "rgba(0,0,0,0.5)" }}>Watch this space for the latest updates.</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <AnnouncementCard key={ann.id} ann={ann} />
              ))
            )}
          </div>
        ) : (
          /* Doubt View */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, position: "relative" }}>
            <div
              className="wa-chat-container"
              style={{
                flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0,
                padding: "20px 24px", display: "flex", flexDirection: "column",
                gap: 12, background: "transparent",
              }}
            >
              {allMessages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div key={i} style={{
                    display: "flex", flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    animation: "slideUp 0.3s ease", width: "100%"
                  }}>
                    <div style={{
                      position: "relative", maxWidth: "75%",
                      padding: "8px 12px 14px", borderRadius: "12px",
                      marginBottom: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontSize: "13px", lineHeight: "1.5",
                      background: isUser ? "#e7f3e8" : "#ffffff",
                      backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
                      color: "#1a1a1a", alignSelf: isUser ? "flex-end" : "flex-start",
                      border: isUser ? "1px solid rgba(46, 204, 113, 0.25)" : "1px solid rgba(0, 0, 0, 0.08)",
                      borderTopRightRadius: isUser ? 0 : "12px",
                      borderTopLeftRadius: isUser ? "12px" : 0,
                      borderLeft: m.isAdminReply ? "4px solid #ff9900" : (isUser ? "1px solid rgba(46, 204, 113, 0.25)" : "1px solid rgba(0, 0, 0, 0.08)"),
                    }}>
                      <div style={{ fontWeight: 700, fontSize: "10px", color: isUser ? "#047857" : m.isAdminReply ? "#d97706" : "#6d28d9", marginBottom: 4 }}>
                        {isUser ? "You" : m.isAdminReply ? "Core Team" : "Study Bot"}
                      </div>
                      <div style={{ wordBreak: "break-word" }}>{m.text}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 4, fontSize: "9px", color: "rgba(0, 0, 0, 0.45)", gap: 4 }}>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isUser && (
                          <span style={{ color: m.status === "Sending..." ? "rgba(0, 0, 0, 0.3)" : "#34b7f1", fontSize: "13px", fontWeight: "bold" }}>✓✓</span>
                        )}
                      </div>
                    </div>
                    {m.role === "bot" && m.showEscalate && (
                      <div style={{ paddingLeft: 12, marginTop: 2, marginBottom: 8 }}>
                        <LiveChatEscalationBtn msgTimestamp={m.timestamp} onEscalate={handleEscalate} escalated={escalatedMsgs.has(m.timestamp)} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Guide Dialog Overlay */}
            {showGuideDialog && (
              <div style={{
                position: "absolute", bottom: 70, left: "50%",
                transform: "translateX(-50%)", zIndex: 200,
                width: "calc(100% - 48px)", maxWidth: 420,
                animation: "guideSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
                pointerEvents: "all",
              }}>
                <div style={{ background: "rgba(23, 34, 48, 0.96)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.4)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ height: "100%", background: COLORS.gold, width: "100%", animation: "countdown 5s linear forwards", borderRadius: 2 }} />
                  </div>
                  <div style={{ padding: "16px 18px 14px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.gold}, #ff6b35)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: `0 3px 10px ${COLORS.gold}44` }}>💡</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: "#ffffff", lineHeight: 1.2 }}>Structured Questions Only</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>For the best response from the Core team</div>
                        </div>
                      </div>
                      <button onClick={() => { setShowGuideDialog(false); if (guideTimerRef.current) clearTimeout(guideTimerRef.current); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 17, cursor: "pointer", padding: "0 2px", lineHeight: 1, flexShrink: 0 }}>✕</button>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "10px 0" }} />
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 10 }}>
                      Please ask clear, specific questions to get the best answers from the Core team. Avoid vague or one-word messages.
                    </div>
                    <div style={{ background: "rgba(255,153,0,0.12)", border: "1px solid rgba(255,153,0,0.3)", borderRadius: 10, padding: "10px 13px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>✅</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#ffb74d", letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase" }}>Example of a good question</div>
                        <div style={{ fontSize: 12, color: "#ffffff", fontWeight: 600, lineHeight: 1.5, fontStyle: "italic" }}>"What is the difference between Associate and Pro certs?"</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 10 }}>⏱ This notice will disappear in 5 seconds</div>
                  </div>
                </div>
              </div>
            )}

            {/* Input bar */}
            <div style={{
              padding: !isCustomTyping ? 16 : 0,
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
              background: "transparent",
              flexShrink: 0
            }}>
              {!isCustomTyping ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="query-grid" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {faqChips.map((chip) => (
                      <button key={chip.id} onClick={() => handleQueryClick(chip)} disabled={isWaitingForAdmin} className="btn-3d-light text-[11px]"
                        style={{ flex: "1 1 calc(50% - 4px)", minWidth: 0, borderRadius: 14, padding: "10px 12px", cursor: isWaitingForAdmin ? "not-allowed" : "pointer", opacity: isWaitingForAdmin ? 0.5 : 1, textAlign: "left", fontFamily: "inherit" }}>
                        {chip.question}
                      </button>
                    ))}
                  </div>
                  <button onClick={openCustomTyping} disabled={isWaitingForAdmin} className="btn-3d text-xs"
                    style={{ width: "100%", borderRadius: 12, padding: "12px", cursor: isWaitingForAdmin ? "not-allowed" : "pointer", opacity: isWaitingForAdmin ? 0.5 : 1, textAlign: "center", fontFamily: "inherit" }}>
                    Other (Custom Doubt)
                  </button>
                </div>
              ) : (
                <form onSubmit={send} style={{ display: "flex", gap: 10, background: "rgba(0, 0, 0, 0.02)", padding: "12px 18px 16px", borderRadius: "0 0 14px 14px", alignItems: "center" }}>
                  <div style={{ fontSize: "18px", color: COLORS.teal, cursor: "pointer" }}>😊</div>
                  <input className="text-xs chat-input" value={input} onChange={e => setInput(e.target.value)} disabled={isWaitingForAdmin}
                    placeholder={isWaitingForAdmin ? "Waiting for Core response..." : "Type a doubt to Core..."}
                    style={{ flex: 1, background: "rgba(255, 255, 255, 0.75)", border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: 20, padding: "10px 16px", color: COLORS.text, outline: "none", fontFamily: "inherit", cursor: isWaitingForAdmin ? "not-allowed" : "text", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)" }}
                  />
                  <button type="submit" disabled={isWaitingForAdmin} className="btn-3d"
                    style={{ borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: isWaitingForAdmin ? "not-allowed" : "pointer", opacity: isWaitingForAdmin ? 0.5 : 1, padding: 0 }}>
                    <Icon name="send" size={16} color="#000" />
                  </button>
                  <button type="button" onClick={() => setIsCustomTyping(false)} className="btn-3d-light text-[11px]"
                    style={{ borderRadius: 20, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                    Back
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChatPage() {
  const isMobile = useIsMobile();
  return (
    <div style={{ padding: isMobile ? "12px" : "24px", height: "100%", width: "100%", boxSizing: "border-box" }}>
      <ChatTab isMobile={isMobile} />
    </div>
  );
}
