"use client";

import React, { useState, useEffect, useRef } from "react";
import { encryptMessage, decryptMessage } from "@/utils/cryptoHelper";

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

interface CrewMessage {
  id: string;
  chatId: string;
  sender: string;
  ciphertext: string;
  iv: string;
  timestamp: string;
  status: string;
}

interface DecryptedMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  status: string;
}

interface E2ECChatPanelProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string | null;
  };
}

export default function E2ECChatPanel({ user }: E2ECChatPanelProps) {
  const [passphrase, setPassphrase] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [rawMessages, setRawMessages] = useState<CrewMessage[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<DecryptedMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatId = "crew_secure_chat_v1";

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/crew/messages?chat_id=${chatId}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const msgs = data.data?.messages ?? data.messages ?? [];
      setRawMessages(msgs);
    } catch (err) {
      console.error("E2EE Chat fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch("/api/crew/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          sender: user.role === "core" ? "core" : "crew",
        }),
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;
    
    fetchMessages();
    markAsRead();

    const interval = setInterval(() => {
      fetchMessages();
      markAsRead();
    }, 3000);

    return () => clearInterval(interval);
  }, [isUnlocked]);

  // Decrypt raw messages whenever they change or passphrase changes
  useEffect(() => {
    const decryptAll = async () => {
      const list: DecryptedMessage[] = [];
      for (const msg of rawMessages) {
        try {
          const plain = await decryptMessage(msg.ciphertext, msg.iv, passphrase);
          list.push({
            id: msg.id,
            sender: msg.sender,
            text: plain,
            timestamp: msg.timestamp,
            status: msg.status,
          });
        } catch (err) {
          list.push({
            id: msg.id,
            sender: msg.sender,
            text: "🔒 [Decryption Error - Key Mismatch]",
            timestamp: msg.timestamp,
            status: msg.status,
          });
        }
      }
      setDecryptedMessages(list);
    };

    if (isUnlocked && rawMessages.length > 0) {
      decryptAll();
    } else {
      setDecryptedMessages([]);
    }
  }, [rawMessages, passphrase, isUnlocked]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [decryptedMessages.length]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphraseInput.trim()) return;
    setPassphrase(passphraseInput.trim());
    setIsUnlocked(true);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPassphrase("");
    setPassphraseInput("");
    setDecryptedMessages([]);
    setRawMessages([]);
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
    if (!inputText.trim() || !user || sending || !isUnlocked) return;
    setSending(true);

    const plain = inputText.trim();
    setInputText("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const encrypted = await encryptMessage(plain, passphrase);
      
      // Send message role (core or crew)
      const senderRoleLabel = user.role === "core" ? "core" : "crew";

      // Optimistic message
      const optimistic: DecryptedMessage = {
        id: `opt_${Date.now()}`,
        sender: senderRoleLabel,
        text: plain,
        timestamp: new Date().toISOString(),
        status: "delivered",
      };
      setDecryptedMessages((prev) => [...prev, optimistic]);

      const res = await fetch("/api/crew/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          sender: senderRoleLabel,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      await fetchMessages();
    } catch (err) {
      console.error("E2EE Send failed:", err);
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

  if (!isUnlocked) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          padding: 40,
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(20px)",
          height: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: 18,
            padding: "30px 40px",
            maxWidth: 400,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: 16,
              fontWeight: 800,
              color: COLORS.sidebar,
            }}
          >
            End-to-End Encrypted Crew Chat
          </h3>
          <p
            style={{
              fontSize: 12,
              color: COLORS.muted,
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            Enter a shared passphrase key to unlock and decrypt messages. 
            All encryption/decryption happens locally in your browser.
          </p>
          <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="password"
              placeholder="Enter secure passphrase key..."
              value={passphraseInput}
              onChange={(e) => setPassphraseInput(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.mint}`,
                fontSize: 13,
                outline: "none",
                background: "#fdfdfd",
                color: COLORS.sidebar,
                textAlign: "center",
              }}
            />
            <button
              type="submit"
              disabled={!passphraseInput.trim()}
              className="btn-3d-pill-accent"
              style={{
                width: "100%",
                padding: "11px",
                fontSize: 13,
                fontWeight: "bold",
                background: COLORS.gold,
                border: "none",
                borderRadius: 9999,
                color: "#fff",
                cursor: passphraseInput.trim() ? "pointer" : "not-allowed",
                opacity: passphraseInput.trim() ? 1 : 0.6,
              }}
            >
              Unlock Secure Chat
            </button>
          </form>
        </div>
      </div>
    );
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
        .e2e-bubble-wrap { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 8px; animation: e2eFadeIn 0.2s ease-out; }
        .e2e-bubble-wrap.sent { flex-direction: row-reverse; }
        .e2e-bubble {
          width: fit-content;
          max-width: 100%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.55;
          word-break: break-word;
          white-space: pre-wrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06);
          position: relative;
        }
        .e2e-bubble.sent {
          background: ${COLORS.sentBg};
          border-bottom-right-radius: 4px;
          color: #1e40af;
          border: 1px solid rgba(37, 99, 235, 0.15);
        }
        .e2e-bubble.recv {
          background: ${COLORS.recvBg};
          border-bottom-left-radius: 4px;
          color: ${COLORS.sidebar};
          border: 1px solid rgba(35, 47, 62, 0.08);
        }
        .e2e-lock-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: ${COLORS.success};
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        @keyframes e2eFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* Lock Bar */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          borderBottom: `1px solid ${COLORS.mint}`,
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="e2e-lock-badge">
          🛡️ E2EE Encryption Active
        </div>
        <button
          onClick={handleLock}
          style={{
            background: "none",
            border: "none",
            fontSize: 11,
            color: COLORS.danger,
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          🔒 Lock & Clear Key
        </button>
      </div>

      {/* Chat body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: COLORS.muted, fontSize: 13, paddingTop: 40 }}>
            Loading encrypted messages...
          </div>
        ) : decryptedMessages.length === 0 ? (
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
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.sidebar, marginBottom: 6 }}>
              No encrypted history
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
              Start an end-to-end encrypted conversation! Only members who enter the correct key can decrypt these messages.
            </div>
          </div>
        ) : (
          decryptedMessages.map((msg) => {
            const isMe = (user.role === "core" && msg.sender === "core") || (user.role !== "core" && msg.sender === "crew");
            return (
              <div key={msg.id} className={`e2e-bubble-wrap ${isMe ? "sent" : ""}`}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                    maxWidth: "65%",
                    width: "fit-content",
                  }}
                >
                  {!isMe && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted }}>
                        {msg.sender === "core" ? "⭐ Core Admin" : "👥 Crew"}
                      </span>
                    </div>
                  )}

                  <div className={`e2e-bubble ${isMe ? "sent" : "recv"}`}>
                    <div>{msg.text}</div>
                    
                    <div
                      style={{
                        fontSize: 9,
                        color: isMe ? "#1e88e5" : COLORS.muted,
                        marginTop: 4,
                        textAlign: "right",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>{formatTime(msg.timestamp)}</span>
                      {isMe && (
                        <span style={{ fontWeight: "bold" }}>
                          {msg.status === "read" ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

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
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a secure message..."
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
          disabled={!inputText.trim() || sending}
          className="gc-send-btn"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: COLORS.purple,
            border: "none",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: !inputText.trim() || sending ? "not-allowed" : "pointer",
            opacity: !inputText.trim() || sending ? 0.55 : 1,
            flexShrink: 0,
            boxShadow: "0 3px 0 #6d5da1",
          }}
        >
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
        </button>
      </form>
    </div>
  );
}
