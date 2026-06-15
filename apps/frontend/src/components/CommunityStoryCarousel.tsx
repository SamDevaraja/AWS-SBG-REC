"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  focusAreas: string[];
  linkedin: string;
  github: string;
  email: string;
  accent: string;
  accentB: string;
  glowColor: string;
  icon: string;
  gradient: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "01",
    name: "Aravind Swaminathan",
    role: "Cloud Lead",
    department: "AWS Student Builders Group",
    bio: "Passionate about building scalable architectures and mentoring students in AWS technologies. Certified Solutions Architect with a love for serverless computing.",
    focusAreas: ["Serverless Architecture", "Cloud Mentorship", "AWS Lambda"],
    linkedin: "#", github: "#", email: "#",
    accent: "#0073BB", accentB: "#00A3E0", glowColor: "rgba(0,115,187,0.25)",
    icon: "👨‍💻", gradient: "linear-gradient(135deg,#E8F4FD 0%,#DBEAFE 55%,#EFF6FF 100%)",
  },
  {
    id: "02",
    name: "Meera Krishnan",
    role: "Community Manager",
    department: "Events & Outreach",
    bio: "Dedicated to organizing impactful events, bootcamps, and hackathons. She ensures every member feels welcome and has the resources they need to succeed.",
    focusAreas: ["Community Growth", "Event Management", "Student Engagement"],
    linkedin: "#", github: "#", email: "#",
    accent: "#FF9900", accentB: "#FFB84D", glowColor: "rgba(255,153,0,0.25)",
    icon: "👩‍💼", gradient: "linear-gradient(135deg,#FFF8EC 0%,#FFF3E0 55%,#FFFBF0 100%)",
  },
  {
    id: "03",
    name: "Rahul Siddharth",
    role: "Technical Lead",
    department: "Projects & Innovation",
    bio: "Full-stack developer turning cloud concepts into real-world applications. Rahul leads the technical hands-on sessions and guides project teams.",
    focusAreas: ["Full-Stack Dev", "Docker & Kubernetes", "CI/CD"],
    linkedin: "#", github: "#", email: "#",
    accent: "#0073BB", accentB: "#38BDF8", glowColor: "rgba(56,189,248,0.2)",
    icon: "👨‍🔧", gradient: "linear-gradient(135deg,#E0F2FE 0%,#E8F4FD 55%,#F0F9FF 100%)",
  },
  {
    id: "04",
    name: "Sneha Ramachandran",
    role: "Events Coordinator",
    department: "Events & Outreach",
    bio: "The creative force behind our workshops and tech talks. Sneha bridges the gap between industry experts and student learners.",
    focusAreas: ["Workshop Planning", "Speaker Outreach", "Logistics"],
    linkedin: "#", github: "#", email: "#",
    accent: "#059669", accentB: "#34D399", glowColor: "rgba(5,150,105,0.18)",
    icon: "👩‍🏫", gradient: "linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 55%,#ECFDF5 100%)",
  },
  {
    id: "05",
    name: "Vikram Sethuraman",
    role: "DevOps Engineer",
    department: "Projects & Innovation",
    bio: "Specializes in CI/CD pipelines, containerization, and infrastructure as code. Vikram loves automating the boring stuff so we can focus on building.",
    focusAreas: ["Terraform", "GitHub Actions", "AWS CloudFormation"],
    linkedin: "#", github: "#", email: "#",
    accent: "#FF9900", accentB: "#F59E0B", glowColor: "rgba(255,153,0,0.2)",
    icon: "👨‍🚀", gradient: "linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 55%,#FFFBF0 100%)",
  },
  {
    id: "06",
    name: "Shreya Venkat",
    role: "Content Strategist",
    department: "Marketing & Media",
    bio: "Crafts engaging tutorials, documentation, and social media content to share our community's cloud journey with the world.",
    focusAreas: ["Technical Writing", "Social Media", "Brand Identity"],
    linkedin: "#", github: "#", email: "#",
    accent: "#6366F1", accentB: "#818CF8", glowColor: "rgba(99,102,241,0.2)",
    icon: "👩‍🎨", gradient: "linear-gradient(135deg,#EEF2FF 0%,#E0E7FF 55%,#F5F3FF 100%)",
  },
];

export default function OurTeamShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  const total = TEAM_MEMBERS.length;

  const next = useCallback(() => setActiveIndex((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActiveIndex((p) => (p - 1 + total) % total), [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedMember) {
        if (e.key === "Escape") setSelectedMember(null);
        return;
      }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMember, next, prev]);

  // Auto-slide every 4s, pauses on hover or when modal is open
  useEffect(() => {
    if (isHovered || selectedMember) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [isHovered, selectedMember, next]);

  // Calculate shortest path diff for infinite circular behavior
  const getDiff = (idx: number) => {
    let d = idx - activeIndex;
    const half = Math.floor(total / 2);
    if (d > half) d -= total;
    if (d < -half) d += total;
    return d;
  };

  const activeMember = TEAM_MEMBERS[activeIndex];

  return (
    <section
      id="team"
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F7F9FC 50%, #EEF3FA 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 0",
        scrollMarginTop: "100px",
      }}
    >
      {/* ── BACKGROUND ── */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        fontSize: "clamp(80px, 15vw, 240px)", fontWeight: 900, fontFamily: "'Anton', sans-serif, system-ui",
        color: "#1E293B", opacity: 0.02, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 0, letterSpacing: "0.05em",
      }}>
        OUR TEAM
      </div>

      <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,115,187,0.05) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,153,0,0.05) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Radial spotlight behind the active center card */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "40vw", height: "40vw", borderRadius: "50%",
          background: `radial-gradient(circle, ${activeMember.glowColor} 0%, transparent 60%)`,
          filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
        }}
      />

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: 60, position: "relative", zIndex: 10, padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 2.5, borderRadius: 2, background: "#FF9900" }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", color: "#FF9900" }}>
            AWS SBG REC
          </span>
          <div style={{ width: 28, height: 2.5, borderRadius: 2, background: "#FF9900" }} />
        </div>

        <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 900, color: "#1E293B", margin: "0 0 16px", letterSpacing: "-1.5px", lineHeight: 1.1 }}>
          Our Team
        </h2>
        <p style={{ fontSize: 16, color: "#64748B", margin: 0, fontWeight: 400, maxWidth: 500, lineHeight: 1.6 }}>
          Meet the students driving innovation, events, projects, and community growth at AWS SBG REC.
        </p>
      </div>

      {/* ── CAROUSEL STAGE ── */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "relative",
          width: "100%",
          height: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {TEAM_MEMBERS.map((member, idx) => {
          const diff = getDiff(idx);
          const isActive = diff === 0;
          
          // Progressive scale and opacity
          const absDiff = Math.abs(diff);
          let scale = 1;
          let opacity = 1;
          let xOffset = diff * 220; // base offset
          let blur = 0;
          let zIndex = 10 - absDiff;

          if (isActive) {
            scale = 1.08;
            opacity = 1;
          } else {
            scale = Math.max(0.7, 1 - absDiff * 0.12);
            opacity = Math.max(0, 1 - absDiff * 0.35);
            blur = absDiff * 2;
            
            // Add extra push away from center to create space
            if (diff > 0) xOffset += 60;
            if (diff < 0) xOffset -= 60;
          }

          return (
            <motion.div
              key={member.id}
              onClick={() => isActive ? setSelectedMember(member) : setActiveIndex(idx)}
              initial={false}
              animate={{
                x: xOffset,
                scale: scale,
                opacity: opacity,
                zIndex: zIndex,
                filter: `blur(${blur}px)`,
              }}
              transition={{
                type: "spring",
                stiffness: 110,
                damping: 22,
                mass: 0.9,
              }}
              style={{
                position: "absolute",
                width: 280,
                height: 320,
                borderRadius: 24,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "linear-gradient(145deg,rgba(255,255,255,0.98) 0%,rgba(248,250,252,0.94) 100%)",
                backdropFilter: "blur(24px)",
                border: isActive ? `1.5px solid ${member.accent}40` : "1px solid rgba(255,255,255,0.8)",
                boxShadow: isActive
                  ? `0 32px 80px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,1) inset, 0 12px 40px ${member.glowColor}`
                  : "0 12px 32px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.6) inset",
              }}
              whileHover={isActive ? {
                y: -6,
                scale: 1.1,
                boxShadow: `0 40px 100px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,1) inset, 0 20px 50px ${member.glowColor}`,
              } : undefined}
            >
              {/* IMAGE / ICON AREA */}
              <div style={{
                width: "100%",
                flex: "0 0 65%",
                background: member.gradient,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(0,0,0,0.04) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
                
                <div style={{
                  width: 90, height: 90, borderRadius: "50%",
                  background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
                  border: `1.5px solid ${member.accent}30`, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 8px 32px ${member.glowColor}, inset 0 1px 0 rgba(255,255,255,1)`,
                  position: "relative", zIndex: 2,
                }}>
                  <span style={{ fontSize: 40 }}>{member.icon}</span>
                </div>
              </div>

              {/* DIVIDER */}
              <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${member.accent}20,transparent)` }} />

              {/* CONTENT */}
              <div style={{
                flex: "1 1 0%", padding: "16px 20px", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", textAlign: "center",
                background: "linear-gradient(180deg,rgba(255,255,255,0.8) 0%,rgba(255,255,255,1) 100%)",
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
                  {member.name}
                </h3>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                  color: member.accent, background: `${member.accent}12`, border: `1px solid ${member.accent}20`,
                  borderRadius: 100, padding: "3px 12px",
                }}>
                  {member.role}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* ── ARROWS ── */}
        <button
          onClick={prev}
          style={{
            position: "absolute", left: "clamp(16px, 4vw, 60px)", top: "50%", transform: "translateY(-50%)",
            zIndex: 20, width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(0,115,187,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
            color: "#0073BB", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#0073BB"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#0073BB"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        <button
          onClick={next}
          style={{
            position: "absolute", right: "clamp(16px, 4vw, 60px)", top: "50%", transform: "translateY(-50%)",
            zIndex: 20, width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(0,115,187,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
            color: "#0073BB", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#0073BB"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#0073BB"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* ── PAGINATION DOTS ── */}
      <div style={{ display: "flex", gap: 8, marginTop: 40, position: "relative", zIndex: 10, alignItems: "center" }}>
        {TEAM_MEMBERS.map((card, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            style={{
              width: activeIndex === idx ? 32 : 8, height: 8, borderRadius: 100, border: "none", cursor: "pointer", padding: 0,
              background: activeIndex === idx ? card.accent : "rgba(0,115,187,0.15)",
              boxShadow: activeIndex === idx ? `0 0 12px ${card.accent}66` : "none",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ── PREMIUM FLOATING PROFILE MODAL ── */}
      <AnimatePresence>
        {selectedMember && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              onClick={() => setSelectedMember(null)}
              style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "rgba(15, 23, 42, 0.4)",
              }}
            />

            {/* Modal Container */}
            <div style={{ position: "fixed", inset: 0, zIndex: 101, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  width: "100%", maxWidth: 840,
                  background: "linear-gradient(145deg,rgba(255,255,255,0.98) 0%,rgba(248,250,252,0.96) 100%)",
                  backdropFilter: "blur(32px)",
                  borderRadius: 32,
                  border: `1.5px solid ${selectedMember.accent}40`,
                  boxShadow: `0 40px 100px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,1) inset, 0 20px 80px ${selectedMember.glowColor}`,
                  display: "flex",
                  flexDirection: "row",
                  overflow: "hidden",
                  pointerEvents: "auto",
                  margin: "0 20px",
                  position: "relative",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMember(null)}
                  style={{
                    position: "absolute", top: 20, right: 20, zIndex: 10,
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#64748B", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#0F172A"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.8)"; e.currentTarget.style.color = "#64748B"; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                {/* Modal Left: Image */}
                <div style={{
                  flex: "0 0 40%",
                  background: selectedMember.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                  borderRight: "1px solid rgba(0,0,0,0.05)",
                }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(0,0,0,0.04) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div style={{
                    width: 140, height: 140, borderRadius: "50%",
                    background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
                    border: `2px solid ${selectedMember.accent}30`, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 12px 40px ${selectedMember.glowColor}, inset 0 1px 0 rgba(255,255,255,1)`,
                    position: "relative", zIndex: 2,
                  }}>
                    <span style={{ fontSize: 64 }}>{selectedMember.icon}</span>
                  </div>
                </div>

                {/* Modal Right: Details */}
                <div style={{ flex: "1 1 0%", padding: "48px 40px" }}>
                  <span style={{
                    display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase",
                    color: selectedMember.accent, background: `${selectedMember.accent}12`, border: `1px solid ${selectedMember.accent}20`,
                    borderRadius: 100, padding: "4px 14px", marginBottom: 16,
                  }}>
                    {selectedMember.department}
                  </span>

                  <h2 style={{ fontSize: 32, fontWeight: 900, color: "#1E293B", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
                    {selectedMember.name}
                  </h2>
                  <p style={{ fontSize: 16, color: "#64748B", fontWeight: 600, margin: "0 0 24px" }}>
                    {selectedMember.role}
                  </p>

                  <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, margin: "0 0 24px" }}>
                    {selectedMember.bio}
                  </p>

                  <div style={{ marginBottom: 32 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                      Key Focus Areas
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {selectedMember.focusAreas.map((area, i) => (
                        <span key={i} style={{
                          fontSize: 13, color: "#475569", background: "#F1F5F9",
                          padding: "6px 12px", borderRadius: 8, border: "1px solid #E2E8F0"
                        }}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Links Placeholder */}
                  <div style={{ display: "flex", gap: 12 }}>
                    {["LinkedIn", "GitHub", "Email"].map((link, i) => (
                      <a key={i} href="#" onClick={e => e.preventDefault()} style={{
                        fontSize: 13, fontWeight: 700, color: selectedMember.accent,
                        textDecoration: "none", padding: "8px 16px", borderRadius: 100,
                        background: `${selectedMember.accent}08`, border: `1px solid ${selectedMember.accent}20`,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${selectedMember.accent}15`}
                      onMouseLeave={e => e.currentTarget.style.background = `${selectedMember.accent}08`}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
