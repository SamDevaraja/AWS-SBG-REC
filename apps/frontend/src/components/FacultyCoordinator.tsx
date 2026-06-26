"use client";

import React, { useState } from "react";

const DESCRIPTION = `The driving force behind the AWS Student Builder Group at Rajalakshmi Engineering College, he has played a pivotal role in establishing and nurturing the community since its inception. By mentoring the core and crew teams, reviewing ideas, monitoring progress, providing valuable feedback, and ensuring the successful execution of every initiative, he has fostered a culture of innovation, collaboration, and continuous learning. Through his unwavering guidance and commitment to excellence, he empowers students to grow, lead impactful initiatives, and contribute to the sustained success of the AWS Student Builder Group.`;

export default function FacultyCoordinator() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shouldGlow = isHovered && !isFlipped;

  return (
    <section
      id="faculty-coordinator"
      style={{
        width: "100%",
        background: "#f8fafc",
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(255, 153, 0, 0.04) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(0, 115, 187, 0.04) 0%, transparent 45%), radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "100% 100%, 100% 100%, 24px 24px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        borderTop: "1px solid #e2e8f0",
        scrollMarginTop: "100px",
      }}
    >
      {/* Radial fade mask */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at center, transparent 60%, #f8fafc 95%)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: 24 }}>
        <span style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#FF9900", display: "block", marginBottom: 6,
        }}>
          FACULTY ADVISOR
        </span>
        <h2 style={{
          fontSize: "clamp(24px, 2.5vw, 32px)", fontWeight: 800,
          color: "#0f172a", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.2,
        }}>
          Meet Our Faculty Coordinator
        </h2>
      </div>

      {/* Flip card container — height fits back face content */}
      <div
        style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 680,
          height: 200,
          perspective: "1200px",
          cursor: "pointer",
        }}
        onClick={() => setIsFlipped((f) => !f)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Inner flip wrapper */}
        <div style={{
          position: "relative", width: "100%", height: "100%",
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>

          {/* ── FRONT FACE ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            display: "flex", flexDirection: "row", alignItems: "stretch",
            background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
            borderRadius: 8,
            border: shouldGlow ? "1px solid #FF9900" : "1px solid rgba(15, 23, 42, 0.12)",
            boxShadow: shouldGlow
              ? "0 12px 24px -6px rgba(255, 153, 0, 0.16), 0 4px 12px -4px rgba(255, 153, 0, 0.12)"
              : "0 1px 3px rgba(15, 23, 42, 0.015), 0 1px 2px rgba(15, 23, 42, 0.01)",
            overflow: "hidden",
            transform: shouldGlow ? "translateY(-6px)" : "translateY(0px)",
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            {/* Photo */}
            <div style={{ width: 180, flexShrink: 0, overflow: "hidden", position: "relative" }}>
              <img
                src="/images/faculty_bhuvaneswaran.jpg"
                alt="Bhuvaneswaran B."
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "top center", display: "block",
                  transform: shouldGlow ? "scale(1.05)" : "scale(1)",
                  transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: 36, height: "100%",
                background: "linear-gradient(to right, transparent, #f8fafc)",
              }} />
            </div>

            {/* Info — vertically centered */}
            <div style={{
              flex: 1, padding: "0 24px",
              display: "flex", flexDirection: "column",
              justifyContent: "center", gap: 8,
            }}>
              {/* Badge */}
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "#FF9900",
                background: "rgba(255, 153, 0, 0.08)",
                border: "1px solid rgba(255, 153, 0, 0.2)",
                borderRadius: 4, padding: "3px 8px", alignSelf: "flex-start",
              }}>
                Faculty Coordinator
              </span>

              {/* Name */}
              <h3 style={{
                fontSize: 20, fontWeight: 800,
                color: shouldGlow ? "#FF9900" : "#0f172a",
                margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2,
                transition: "color 0.3s ease",
              }}>
                Bhuvaneswaran B.
              </h3>

              {/* Role */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: "#334155",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#0073BB", flexShrink: 0 }} />
                  Asst. Professor (Senior Grade) &amp; Training Manager
                </span>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400, paddingLeft: 11 }}>
                  Dept. of CSE &middot; Rajalakshmi Engineering College
                </span>
              </div>

              {/* Actions row */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 2 }}>
                <a
                  href="https://www.linkedin.com/in/bhuvaneswaranrec/"
                  target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 11, fontWeight: 700, color: "#0073BB",
                    textDecoration: "none",
                    background: "rgba(0, 115, 187, 0.06)",
                    border: "1px solid rgba(0, 115, 187, 0.16)",
                    borderRadius: 6, padding: "5px 11px",
                    transition: "background 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 115, 187, 0.12)";
                    e.currentTarget.style.borderColor = "rgba(0, 115, 187, 0.32)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 115, 187, 0.06)";
                    e.currentTarget.style.borderColor = "rgba(0, 115, 187, 0.16)";
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  View LinkedIn
                </a>

                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                  </svg>
                  Click card for bio
                </span>
              </div>
            </div>
          </div>

          {/* ── BACK FACE ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
            borderRadius: 8,
            border: "1px solid rgba(255, 153, 0, 0.2)",
            boxShadow: "0 12px 24px -6px rgba(255, 153, 0, 0.16), 0 4px 12px -4px rgba(255, 153, 0, 0.12)",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
          }}>
            {/* Decorative glows */}
            <div style={{
              position: "absolute", top: -50, right: -50,
              width: 180, height: 180, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,153,0,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -30, left: -30,
              width: 140, height: 140, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,115,187,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Back header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "rgba(255,153,0,0.15)", border: "1px solid rgba(255,153,0,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF9900" }}>
                  Faculty Coordinator – AWS SBG REC
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginTop: 1 }}>
                  Bhuvaneswaran B.
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{
              fontSize: 11.5, lineHeight: 1.7, color: "#cbd5e1",
              margin: 0, fontWeight: 400,
              position: "relative", zIndex: 2,
            }}>
              {DESCRIPTION}
            </p>

            {/* Flip back hint */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, position: "relative", zIndex: 2 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
              <span style={{ fontSize: 10, color: "#475569", fontWeight: 500 }}>Click to flip back</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
