"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  Check, 
  MessageSquare, 
  RefreshCw, 
  X,
  User,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-700 shadow-xs">
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[11px] font-bold tracking-wide">Doubt Sent to Team!</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 font-bold rounded-lg text-[10.5px] uppercase tracking-wider shadow-sm transition-all duration-150 cursor-pointer group mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <RefreshCw className="w-3 h-3 text-[#FF9900] animate-spin" />
      ) : (
        <MessageSquare className="w-3 h-3 text-slate-400 group-hover:text-[#FF9900] transition-colors" />
      )}
      <span>{loading ? "Connecting..." : "Not satisfied? Ask Live Team"}</span>
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
const ChatTab = ({ isMobile }: { isMobile: boolean }) => {
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
      text: "Hi! I'm Chat Box. I can help you with AWS certification questions, study tips, or anything cloud-related. What would you like to know?",
      timestamp: Date.now() - 1000,
      showEscalate: false,
    }
  ]);
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
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
    if (inputRef.current) inputRef.current.style.height = "auto";

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
    <div 
      className="relative flex flex-col overflow-hidden bg-gradient-to-br from-[#FAF8F5] via-[#F4F6F9] to-[#EDF0F5] text-[#1A1C1E] font-sans shadow-lg border border-slate-200/80 rounded-2xl w-full flex-1"
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.985) translateY(5px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes countdown { from { width: 100%; } to { width: 0%; } }
        .animate-fadeIn { animation: fadeIn 0.22s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-slideUp { animation: slideUp 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-countdown { animation: countdown 5s linear forwards; }
        
        .premium-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .premium-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(35, 47, 62, 0.12); border-radius: 99px; }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(35, 47, 62, 0.25); }
      `}</style>

      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.06)_0%,rgba(255,153,0,0.02)_40%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(35,47,62,0.04)_0%,rgba(35,47,62,0.01)_40%,transparent_70%)] pointer-events-none z-0" />

      {/* Main Glass Panel */}
      <div className="relative flex-1 flex flex-col bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden z-10">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 px-6 py-4 border-b border-slate-200/60 bg-white/40 backdrop-blur-xs select-none">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#232F3E] to-[#1A222D] flex items-center justify-center border border-slate-200/50 shadow-xs">
            <AWSBrandLogo className="w-8 h-[19px]" />
          </div>
          <div>
            <h3 className="font-bold text-[#232F3E] text-[15px] tracking-tight leading-none">Cloud Chat Assistant</h3>
            <span className="text-[11px] text-slate-500 font-semibold mt-1.5 inline-block">Online • Powered by AWS Q Agent</span>
          </div>
        </div>

        {/* Content Feed/Chat */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-5 sm:p-6 bg-transparent premium-scrollbar"
          >
            <div className="flex flex-col justify-end min-h-full gap-4">
              {allMessages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "flex flex-col w-full animate-fadeIn",
                      isUser ? "items-end" : "items-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "relative max-w-[78%] px-4 py-3 rounded-2xl shadow-xs text-xs sm:text-[13px] leading-relaxed transition-all",
                        isUser 
                          ? "bg-[#232F3E] text-white rounded-tr-none border border-slate-800" 
                          : cn(
                              "bg-white text-slate-800 rounded-tl-none border border-slate-200/60",
                              m.isAdminReply && "border-l-4 border-l-[#FF9900]"
                            )
                      )}
                    >
                      <div 
                        className={cn(
                          "font-semibold text-[12px] tracking-tight mb-1 font-sans",
                          isUser 
                            ? "text-[#FF9900]" 
                            : m.isAdminReply 
                              ? "text-[#FF9900]" 
                              : "text-[#0073BB]"
                        )}
                      >
                        {isUser ? "You" : m.isAdminReply ? "Core Team" : "Chat Assistant"}
                      </div>
                      <div className="word-break whitespace-pre-wrap">{m.text}</div>
                      
                      <div className="flex items-center justify-end mt-1.5 text-[9px] text-slate-450 gap-1 select-none">
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isUser && (
                          <CheckCheck 
                            className={cn(
                              "w-3.5 h-3.5",
                              m.status === "Sending..." ? "text-slate-400 opacity-50" : "text-sky-450"
                            )} 
                          />
                        )}
                      </div>
                    </div>
                    {m.role === "bot" && m.showEscalate && (
                      <div className="pl-3 mt-1.5 mb-2.5">
                        <LiveChatEscalationBtn 
                          msgTimestamp={m.timestamp} 
                          onEscalate={handleEscalate} 
                          escalated={escalatedMsgs.has(m.timestamp)} 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Guide Dialog Overlay */}
          {showGuideDialog && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-sm bg-[#1A222D]/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700 p-4 animate-slideUp">
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-[#FF9900] w-full animate-countdown" />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF9900]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">Structured Questions Only</span>
                </div>
                <button 
                  onClick={() => { setShowGuideDialog(false); if (guideTimerRef.current) clearTimeout(guideTimerRef.current); }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-350 mt-2 leading-relaxed font-sans">
                Please ask clear, specific questions to get the best answers from the Core team. Avoid vague or one-word messages.
              </p>
              <div className="mt-3 p-2.5 bg-white/5 rounded-lg border border-white/10 font-sans">
                <span className="text-[9px] font-bold text-[#FF9900] uppercase tracking-wider block">Example Query</span>
                <span className="text-xs text-white italic mt-1 block">"What is the difference between Associate and Pro certs?"</span>
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="p-4 border-t border-slate-200/60 bg-white/40 backdrop-blur-xs flex-shrink-0">
            {!isCustomTyping ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {faqChips.map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => handleQueryClick(chip)}
                      disabled={isWaitingForAdmin}
                      className="flex items-start gap-2 px-3.5 py-3 bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-[#FF9900] text-slate-700 hover:text-[#232F3E] rounded-xl text-left text-xs font-bold shadow-xs hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#FF9900] shrink-0 mt-0.5 transition-colors" />
                      <span className="leading-snug">{chip.question}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={openCustomTyping}
                  disabled={isWaitingForAdmin}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-[#232F3E] hover:bg-[#FF9900] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span>Other (Custom Doubt)</span>
                </button>
              </div>
            ) : (
              <form onSubmit={send} className="flex gap-3 items-center">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(e);
                    }
                  }}
                  disabled={isWaitingForAdmin}
                  placeholder={isWaitingForAdmin ? "Waiting for Core response..." : "Type your custom doubt..."}
                  rows={1}
                  className="flex-1 bg-white border border-slate-250/80 focus:border-[#FF9900] rounded-xl px-4 py-2.5 text-xs text-[#232F3E] placeholder-slate-400 shadow-inner focus:outline-none resize-none max-h-36 leading-relaxed transition-all"
                />
                
                <div className="flex gap-2 shrink-0">
                  <button
                    type="submit"
                    disabled={isWaitingForAdmin}
                    className="flex items-center justify-center w-9 h-9 bg-[#232F3E] hover:bg-[#FF9900] text-white rounded-xl shadow-sm hover:shadow transition-all duration-150 disabled:bg-slate-350 disabled:cursor-not-allowed cursor-pointer hover:scale-102"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsCustomTyping(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-sm transition-all duration-150 cursor-pointer uppercase tracking-wider"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const isMobile = useIsMobile();
  return (
    <div className="p-4 md:p-6 h-[calc(100vh-32px)] md:h-[calc(100vh-48px)] w-full box-border select-none flex flex-col overflow-hidden">
      <ChatTab isMobile={isMobile} />
    </div>
  );
}
