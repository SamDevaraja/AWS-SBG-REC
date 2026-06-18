"use client";

import React, { useState, useEffect, useRef } from "react";

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
}

function Avatar({ initials, color, photo, size = 36 }: AvatarProps) {
  // If photo is an object, attempt to extract its photo string
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
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          userSelect: "none",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color || COLORS.gold,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: Math.floor(size * 0.38),
        color: "#fff",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isCore = role === "core" || role === "admin" || role === "super_admin";
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.05em",
        padding: "2px 6px",
        borderRadius: 20,
        background: isCore ? `${COLORS.coreColor}20` : `${COLORS.crewColor}20`,
        color: isCore ? COLORS.coreColor : COLORS.crewColor,
        textTransform: "uppercase",
      }}
    >
      {isCore ? "⭐ Core" : "👥 Crew"}
    </span>
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
      avatarColor: COLORS.gold,
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
          avatarColor: COLORS.gold,
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        background: "transparent",
        position: "relative",
      }}
    >
      <style>{`
        .gc-bubble-wrap {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 4px;
          animation: gcfadeIn 0.2s ease-out;
        }
        .gc-bubble-wrap.sent { flex-direction: row-reverse; }
        .gc-bubble {
          max-width: 100%;
          padding: 9px 13px;
          border-radius: 18px;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
          white-space: pre-wrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .gc-bubble.sent {
          background: #e8f0fe;
          border-bottom-right-radius: 4px;
          color: #1e40af;
          border: 1px solid rgba(37, 99, 235, 0.12);
        }
        .gc-bubble.recv {
          background: #ffffff;
          border-bottom-left-radius: 4px;
          color: ${COLORS.sidebar};
          border: 1px solid rgba(35, 47, 62, 0.09);
        }
        .gc-date-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 16px 0 10px;
        }
        .gc-date-divider::before, .gc-date-divider::after {
          content: ""; flex: 1; height: 1px; background: rgba(0,0,0,0.07);
        }
        .gc-send-btn {
          box-shadow: 0 3px 0 #CC7A00;
          transition: background 0.2s, transform 0.1s, box-shadow 0.1s !important;
          border-radius: 9999px !important;
        }
        .gc-send-btn:hover { background: #e08500 !important; transform: translateY(-1px); box-shadow: 0 4px 0 #CC7A00; }
        .gc-send-btn:active { transform: translateY(2px) !important; box-shadow: 0 1px 0 #CC7A00; }
        .gc-send-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
        .gc-input:focus { border-color: ${COLORS.gold}; box-shadow: 0 0 0 3px ${COLORS.gold}22; }
        @keyframes gcfadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* Chat body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: COLORS.muted, fontSize: 13, paddingTop: 40 }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              alignSelf: "center",
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: 16,
              padding: "20px 28px",
              textAlign: "center",
              marginTop: 40,
              maxWidth: 280,
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>👋</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.sidebar, marginBottom: 6 }}>
              No messages yet
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
              Start the conversation! Core and Crew members can chat here together.
            </div>
          </div>
        ) : (
          grouped.map((item) => {
            if (item.type === "divider") {
              return (
                <div key={item.key} className="gc-date-divider">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: COLORS.muted,
                      background: "rgba(255, 255, 255, 0.75)",
                      padding: "2px 10px",
                      borderRadius: 20,
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            }

            const { msg } = item;
            const isMe = user && msg.senderName === user.fullName && msg.senderRole === user.role;
            return (
              <div key={msg.id} className={`gc-bubble-wrap ${isMe ? "sent" : ""}`}>
                {/* Avatar — only for received messages, aligned to bottom */}
                {!isMe && (
                  <Avatar
                    initials={msg.avatarInitials}
                    color={msg.avatarColor}
                    photo={userPhotos[`${msg.senderName.toLowerCase()}_${msg.senderRole.toLowerCase()}`] || msg.avatarPhoto}
                    size={30}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                    maxWidth: "60%",
                  }}
                >
                  {/* Sender name + role badge — only for received */}
                  {!isMe && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, paddingLeft: 2 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: msg.avatarColor }}>
                        {msg.senderName}
                      </span>
                      <RoleBadge role={msg.senderRole} />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`gc-bubble ${isMe ? "sent" : "recv"}`}>
                    {msg.text && (
                      <span>{msg.text}</span>
                    )}

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: msg.text ? 8 : 0 }}>
                        {msg.attachments.map((att, attIdx) => (
                          <div
                            key={attIdx}
                            style={{
                              borderRadius: 8,
                              overflow: "hidden",
                              maxWidth: 240,
                              border: att.type !== "file" ? "1px solid rgba(0,0,0,0.08)" : "none",
                              background: att.type !== "file" ? "#eee" : "transparent",
                            }}
                          >
                            {att.type === "image" ? (
                              <img
                                src={att.url}
                                alt="attachment"
                                style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "contain", cursor: "zoom-in" }}
                                onClick={() => {
                                  const w = window.open();
                                  w?.document.write(`<img src="${att.url}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                }}
                              />
                            ) : att.type === "video" ? (
                              <video src={att.url} controls style={{ width: "100%", display: "block", maxHeight: 200 }} />
                            ) : (
                              <a
                                href={att.url}
                                download={att.name || "file"}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isMe ? "rgba(0,0,0,0.05)" : "#f0f2f5", borderRadius: 10, textDecoration: "none", color: COLORS.sidebar, border: "1px solid rgba(0,0,0,0.06)", transition: "background 0.2s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = isMe ? "rgba(0,0,0,0.08)" : "#e4e6eb")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = isMe ? "rgba(0,0,0,0.05)" : "#f0f2f5")}
                              >
                                <span style={{ fontSize: 22 }}>📄</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name || "Document"}</div>
                                  <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{att.size ? `${(att.size / 1024).toFixed(1)} KB` : "File"}</div>
                                </div>
                                <span style={{ fontSize: 13, color: COLORS.muted }}>⬇️</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp + read tick — below the bubble */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, paddingLeft: isMe ? 0 : 2, paddingRight: isMe ? 2 : 0 }}>
                    <span style={{ fontSize: 10, color: COLORS.muted }}>{formatTime(msg.timestamp)}</span>
                    {isMe && <span style={{ fontSize: 11, color: "#34b7f1", fontWeight: 700, lineHeight: 1 }}>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* File Previews Area */}
      {selectedFiles.length > 0 && (
        <div
          style={{
            background: COLORS.surface,
            borderTop: `1px solid ${COLORS.mint}`,
            padding: "10px 16px",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {selectedFiles.map((item, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                width: 70,
                height: 70,
                borderRadius: 8,
                border: `1px solid ${COLORS.mint}`,
                overflow: "hidden",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.type === "image" ? (
                <img
                  src={item.previewUrl}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : item.type === "video" ? (
                <video src={item.previewUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 6,
                    color: "#fff",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: 24, marginBottom: 2 }}>📄</span>
                  <div
                    style={{
                      fontSize: 8,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: 60,
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeSelectedFile(idx)}
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: "none",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        style={{
          background: COLORS.surface,
          padding: "12px 16px",
          borderTop: `1px solid ${COLORS.mint}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Avatar
          initials={user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          color={COLORS.gold}
          photo={user.avatar}
          size={34}
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: COLORS.muted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 8,
            borderRadius: "50%",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          title="Attach photo or video"
        >
          <PaperclipIcon />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          style={{ display: "none" }}
        />

        <textarea
          ref={inputRef}
          className="gc-input"
          value={inputText}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={2}
          style={{
            flex: 1,
            padding: "11px 18px",
            borderRadius: 14,
            border: `1.5px solid ${COLORS.mint}`,
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            background: "#f8f8f8",
            color: COLORS.sidebar,
            transition: "border-color 0.2s, box-shadow 0.2s",
            resize: "none",
            maxHeight: 200,
            lineHeight: 1.4,
          }}
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && selectedFiles.length === 0) || sending}
          className="gc-send-btn"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: COLORS.gold,
            border: "none",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor:
              (!inputText.trim() && selectedFiles.length === 0) || sending
                ? "not-allowed"
                : "pointer",
            opacity: (!inputText.trim() && selectedFiles.length === 0) || sending ? 0.55 : 1,
            flexShrink: 0,
            position: "relative",
          }}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
