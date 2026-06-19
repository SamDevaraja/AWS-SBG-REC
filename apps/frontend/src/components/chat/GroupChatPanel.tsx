"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Send, Paperclip, FileText, Download, X, CheckCheck, Shield, Wrench, User } from "lucide-react";

const COLORS = {
  bg: "#F8FAFC",
  sidebar: "#232F3E",
  mint: "rgba(35, 47, 62, 0.1)",
  gold: "#FF9900",
  muted: "#475569",
  surface: "#FFFFFF",
  success: "#10b981",
  danger: "#ef4444",
  purple: "#8b5cf6",
  chatBg: "transparent",
  sentBg: "#e8f0fe", // Professional AWS light blue/slate
  recvBg: "#ffffff",
  coreColor: "#FF9900",
  crewColor: "#8b5cf6",
};

const AVATAR_PALETTE = [
  "#232F3E", // Deep Navy
  "#334155", // Slate Blue
  "#475569", // Slate
  "#1A222D", // Dark Slate
  "#64748B", // Cool Grey
  "#161D26", // Dark Navy
  "#4A5568", // Charcoal Grey
  "#718096", // Steel Grey
];

export function getAvatarColor(name: string) {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

interface Attachment {
  type: string;
  url: string;
  name?: string;
  size?: number;
}

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  avatarColor: string;
  avatarInitials: string;
  avatarPhoto?: string | null;
  text: string;
  attachments?: Attachment[];
  timestamp: string;
  optimistic?: boolean;
}

interface AvatarProps {
  initials: string;
  color?: string;
  photo?: string | null;
  size?: number;
  role?: string;
}

function Avatar({ initials, color, photo, size = 36, role }: AvatarProps) {
  const src = typeof photo === 'object' && photo !== null ? (photo as any).photo : photo;

  const isValidPhoto = src && 
                       typeof src === 'string' && 
                       src.trim() !== "" && 
                       src !== "null" && 
                       src !== "undefined" && 
                       src !== "[object Object]";

  if (isValidPhoto) {
    return (
      <img
        src={src}
        alt={initials}
        className="rounded-full object-cover shrink-0 select-none shadow-sm border border-white/80"
        style={{ width: size, height: size }}
      />
    );
  }

  // Use a user/human icon for standard placeholder
  const IconComponent = User;

  const iconSize = Math.floor(size * 0.52);

  return (
    <div
      className="rounded-full flex items-center justify-center text-white shrink-0 select-none shadow-sm border border-white/80"
      style={{
        width: size,
        height: size,
        background: color || "#232F3E",
      }}
    >
      <IconComponent style={{ width: iconSize, height: iconSize }} strokeWidth={2.2} />
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

interface GroupChatPanelProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string | null;
  };
}

export default function GroupChatPanel({ user }: GroupChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/groupchat");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const msgs = data.data?.messages ?? data.messages ?? [];
      setMessages(msgs);
    } catch (err) {
      console.error("GroupChat fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPhotos = async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        const photos: Record<string, string> = {};
        data.users?.forEach((u: any) => {
          if (u.avatar?.photo) {
            photos[`${u.name.toLowerCase()}_${u.role.toLowerCase()}`] = u.avatar.photo;
          }
        });
        setUserPhotos(photos);
      }
    } catch (err) {
      console.error("Failed to fetch user photos:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchUserPhotos();
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max file size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        let fileType = "file";
        if (file.type.startsWith("image/")) fileType = "image";
        else if (file.type.startsWith("video/")) fileType = "video";

        setSelectedFiles((prev) => [
          ...prev,
          {
            file,
            name: file.name,
            type: fileType,
            previewUrl: fileType !== "file" ? URL.createObjectURL(file) : null,
            base64: reader.result as string,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return copy;
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && selectedFiles.length === 0) || !user || sending) return;
    setSending(true);

    const text = inputText.trim();
    const attachments = selectedFiles.map((f) => ({
      type: f.type,
      url: f.base64,
      name: f.name,
      size: f.size,
    }));

    setInputText("");
    setSelectedFiles([]);
    if (inputRef.current) inputRef.current.style.height = "auto";

    const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Optimistic message
    const optimistic: Message = {
      id: `opt_${Date.now()}`,
      senderName: user.fullName,
      senderRole: user.role,
      avatarColor: getAvatarColor(user.fullName),
      avatarInitials: initials,
      avatarPhoto: user.avatar || null,
      text,
      attachments,
      timestamp: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await fetch("/api/groupchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: user.fullName,
          senderRole: user.role,
          avatarColor: getAvatarColor(user.fullName),
          avatarInitials: initials,
          avatarPhoto: user.avatar || null,
          text,
          attachments,
        }),
      });
      await fetchMessages();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const timeStr = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return timeStr;
    } catch {
      return "";
    }
  };

  const formatDateDivider = (iso: string) => {
    try {
      const d = new Date(iso);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return "Today";
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      return d.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Group messages by date for dividers
  const grouped: Array<{ type: "divider"; label: string; key: string } | { type: "msg"; msg: Message }> = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateStr = new Date(msg.timestamp).toDateString();
    if (dateStr !== lastDate) {
      grouped.push({
        type: "divider",
        label: formatDateDivider(msg.timestamp),
        key: `div_${msg.timestamp}`,
      });
      lastDate = dateStr;
    }
    grouped.push({ type: "msg", msg });
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-transparent relative text-[#1A1C1E]">
      <style>{`
        .premium-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .premium-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(35, 47, 62, 0.12); border-radius: 99px; }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(35, 47, 62, 0.25); }
      `}</style>

      {/* Chat body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 premium-scrollbar bg-transparent"
      >
        <div className="flex flex-col justify-end min-h-full gap-4">
          {loading ? (
            <div className="text-center text-slate-500 text-xs font-bold uppercase tracking-wider py-10 animate-pulse">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="self-center bg-white/80 border border-slate-200/50 rounded-2xl p-6 text-center mt-10 max-w-sm shadow-xs backdrop-blur-xs select-none">
              <div className="text-3xl mb-2.5">👋</div>
              <div className="font-extrabold text-[13.5px] text-[#232F3E] mb-1.5 uppercase tracking-wide">
                No messages yet
              </div>
              <div className="text-xs text-slate-500 leading-relaxed font-sans">
                Start the conversation! Core and Crew members can chat here together.
              </div>
            </div>
          ) : (
            grouped.map((item) => {
              if (item.type === "divider") {
                return (
                   <div key={item.key} className="flex items-center gap-4 my-5 justify-center relative select-none">
                     <div className="h-[1px] flex-1 bg-slate-200/60" />
                     <span className="text-[11px] font-semibold text-slate-500 font-sans tracking-wide">
                       {item.label}
                     </span>
                     <div className="h-[1px] flex-1 bg-slate-200/60" />
                   </div>
                );
              }

              const { msg } = item;
              const isMe = user && msg.senderName === user.fullName && msg.senderRole === user.role;
              return (
                <div 
                  key={msg.id} 
                  className="flex gap-4 px-4 py-2 hover:bg-slate-900/[0.03] transition-colors items-start w-full animate-fadeIn group rounded-lg"
                >
                  <Avatar
                    initials={msg.avatarInitials}
                    color={getAvatarColor(msg.senderName)}
                    photo={userPhotos[`${msg.senderName.toLowerCase()}_${msg.senderRole.toLowerCase()}`] || msg.avatarPhoto}
                    size={38}
                    role={msg.senderRole}
                  />

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-baseline gap-2 mb-0.5 select-none">
                      <span className="text-[14px] font-semibold text-slate-900 font-sans tracking-tight">
                        {msg.senderName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium font-sans flex items-center gap-1">
                        {formatDateTime(msg.timestamp)}
                        {isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#34b7f1] shrink-0" />
                        )}
                      </span>
                    </div>

                    {/* Message text */}
                    {msg.text && (
                      <div className="text-[14px] text-slate-850 leading-relaxed font-sans whitespace-pre-wrap break-words">
                        {msg.text}
                      </div>
                    )}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2">
                        {msg.attachments.map((att, attIdx) => (
                          <div
                            key={attIdx}
                            className="rounded-lg overflow-hidden max-w-xs border border-slate-200 bg-white shadow-sm"
                          >
                            {att.type === "image" ? (
                              <img
                                src={att.url}
                                alt="attachment"
                                className="w-full max-h-48 object-contain cursor-zoom-in bg-slate-900/5 hover:opacity-95 transition-opacity"
                                onClick={() => {
                                  const w = window.open();
                                  w?.document.write(`<img src="${att.url}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                }}
                              />
                            ) : att.type === "video" ? (
                              <video src={att.url} controls className="w-full max-h-48" />
                            ) : (
                              <a
                                href={att.url}
                                download={att.name || "file"}
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-750 bg-slate-55 hover:bg-slate-100 transition-all duration-150 select-none"
                              >
                                <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold truncate">{att.name || "Document"}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {att.size ? `${(att.size / 1024).toFixed(1)} KB` : "File"}
                                  </div>
                                </div>
                                <Download className="w-3.5 h-3.5 text-slate-450 hover:text-slate-650 transition-colors shrink-0" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* File Previews Area */}
      {selectedFiles.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xs border-t border-slate-200/60 p-3.5 flex gap-3 flex-wrap">
          {selectedFiles.map((item, idx) => (
            <div
              key={idx}
              className="relative w-16 h-16 rounded-xl border border-slate-200 bg-slate-950 flex items-center justify-center overflow-hidden shadow-sm animate-fadeIn"
            >
              {item.type === "image" ? (
                <img
                  src={item.previewUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : item.type === "video" ? (
                <video src={item.previewUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center p-1.5 text-white text-center">
                  <FileText className="w-6 h-6 text-slate-300 mb-1" />
                  <div className="text-[7.5px] truncate w-12 font-bold font-mono">
                    {item.name}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeSelectedFile(idx)}
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black/60 hover:bg-black/80 border-none text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-slate-200/60 bg-white/40 backdrop-blur-xs flex items-center gap-3.5 shrink-0"
      >
        <Avatar
          initials={user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          color={getAvatarColor(user.fullName)}
          photo={user.avatar}
          size={34}
          role={user.role}
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-slate-400 hover:text-[#FF9900] bg-transparent hover:bg-slate-100/50 p-2 rounded-xl transition-all duration-150 shrink-0 cursor-pointer flex items-center justify-center"
          title="Attach photo or video"
        >
          <Paperclip className="w-4.5 h-4.5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />

        <textarea
          ref={inputRef}
          value={inputText}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-white border border-slate-200 hover:border-slate-350 focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/10 rounded-xl px-4 py-2.5 text-xs sm:text-[13px] text-[#232F3E] placeholder-slate-400 shadow-inner focus:outline-none resize-none max-h-36 leading-relaxed transition-all"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && selectedFiles.length === 0) || sending}
          className="flex items-center justify-center w-9 h-9 bg-[#232F3E] hover:bg-[#FF9900] text-white rounded-xl shadow-sm hover:shadow transition-all duration-150 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer shrink-0 hover:scale-102"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}



