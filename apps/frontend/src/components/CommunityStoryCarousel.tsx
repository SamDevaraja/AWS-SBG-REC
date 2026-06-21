"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "01",
    name: "Aravind Swaminathan",
    role: "Cloud Lead",
    department: "AWS Student Builders Group",
    bio: "Passionate about building scalable architectures and mentoring students in AWS technologies. Certified Solutions Architect with a love for serverless computing.",
    focusAreas: ["Serverless", "Cloud Architecture", "AWS Lambda"],
    linkedin: "#", github: "#", email: "aravind@example.com",
    accent: "#0073BB", accentB: "#00A3E0", glowColor: "rgba(0,115,187,0.15)",
  },
  {
    id: "02",
    name: "Meera Krishnan",
    role: "Community Manager",
    department: "Events & Outreach",
    bio: "Dedicated to organizing impactful events, bootcamps, and hackathons. She ensures every member feels welcome and has the resources they need to succeed.",
    focusAreas: ["Community Growth", "Event Management", "Outreach"],
    linkedin: "#", github: "#", email: "meera@example.com",
    accent: "#FF9900", accentB: "#FFB84D", glowColor: "rgba(255,153,0,0.15)",
  },
  {
    id: "03",
    name: "Rahul Siddharth",
    role: "Technical Lead",
    department: "Projects & Innovation",
    bio: "Full-stack developer turning cloud concepts into real-world applications. Rahul leads the technical hands-on sessions and guides project teams.",
    focusAreas: ["Full-Stack Dev", "Docker & K8s", "CI/CD"],
    linkedin: "#", github: "#", email: "rahul@example.com",
    accent: "#0073BB", accentB: "#38BDF8", glowColor: "rgba(56,189,248,0.12)",
  },
  {
    id: "04",
    name: "Sneha Ramachandran",
    role: "Events Coordinator",
    department: "Events & Outreach",
    bio: "The creative force behind our workshops and tech talks. Sneha bridges the gap between industry experts and student learners.",
    focusAreas: ["Workshops", "Speaker Outreach", "Logistics"],
    linkedin: "#", github: "#", email: "sneha@example.com",
    accent: "#059669", accentB: "#34D399", glowColor: "rgba(5,150,105,0.12)",
  },
  {
    id: "05",
    name: "Vikram Sethuraman",
    role: "DevOps Engineer",
    department: "Projects & Innovation",
    bio: "Specializes in CI/CD pipelines, containerization, and infrastructure as code. Vikram loves automating the boring stuff so we can focus on building.",
    focusAreas: ["Terraform", "GitHub Actions", "CloudFormation"],
    linkedin: "#", github: "#", email: "vikram@example.com",
    accent: "#FF9900", accentB: "#F59E0B", glowColor: "rgba(255,153,0,0.12)",
  },
  {
    id: "06",
    name: "Shreya Venkat",
    role: "Content Strategist",
    department: "Marketing & Media",
    bio: "Crafts engaging tutorials, documentation, and social media content to share our community's cloud journey with the world.",
    focusAreas: ["Technical Writing", "Social Media", "Branding"],
    linkedin: "#", github: "#", email: "shreya@example.com",
    accent: "#6366F1", accentB: "#818CF8", glowColor: "rgba(99,102,241,0.12)",
  },
];

export default function OurTeamShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const xBackdrop = useTransform(scrollYProgress, [0, 1], ["-70%", "-30%"]);
  const ySpot1 = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const ySpot2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const ySpot3 = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  return (
    <section
      id="team"
      ref={containerRef}
      style={{
        width: "100%",
        background: "linear-gradient(180deg, #FFFDF9 0%, #FFFFFF 50%, #F5FAFF 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
        scrollMarginTop: "100px",
      }}
    >
      {/* ── BACKGROUND WATERMARK ── */}
      <motion.div style={{
        position: "absolute", top: "50%", left: "50%",
        x: isMobile ? "-50%" : xBackdrop,
        y: "-50%",
        fontSize: "clamp(80px, 15vw, 240px)", fontWeight: 700, fontFamily: "'Anton', sans-serif, system-ui",
        color: "#1E293B", opacity: 0.02, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 0, letterSpacing: "0.05em",
      }}>
        OUR TEAM
      </motion.div>

      {/* Background spotlights */}
      <motion.div style={{ position: "absolute", top: "-5%", left: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,153,0,.07) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none", y: isMobile ? 0 : ySpot1 }} />
      <motion.div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,153,0,0.08) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none", y: isMobile ? 0 : ySpot2 }} />
      <motion.div style={{ position: "absolute", top: "20%", left: "30%", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(130,68,239,.06) 0%,transparent 70%)", filter: "blur(60px)", pointerEvents: "none", y: isMobile ? 0 : ySpot3 }} />

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: 54, position: "relative", zIndex: 10, padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 2.5, borderRadius: 2, background: "#FF9900" }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "#FF9900" }}>
            AWS SBG REC
          </span>
          <div style={{ width: 28, height: 2.5, borderRadius: 2, background: "#FF9900" }} />
        </div>

        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: "#1E293B", margin: "0 0 16px", letterSpacing: "-1px", lineHeight: 1.2 }}>
          Our Team
        </h2>
        <p style={{ fontSize: 15, color: "#64748B", margin: 0, fontWeight: 400, maxWidth: 500, lineHeight: 1.6 }}>
          Meet the students driving innovation, events, projects, and community growth at AWS SBG REC.
        </p>
      </div>

      {/* ── TEAM GRID ── */}
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 44px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "28px",
        zIndex: 10,
        position: "relative",
      }}>
        {TEAM_MEMBERS.map((member) => {
          const initials = member.name.split(" ").map(n => n[0]).join("");
          return (
            <motion.div
              key={member.id}
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(15,23,42,0.06), 0 0 0 1px " + member.accent + "25" }}
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                border: "1.5px solid rgba(15, 23, 42, 0.08)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Card Accent Top Bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${member.accent}, ${member.accentB})`, borderRadius: "20px 20px 0 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Profile Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${member.accent}12, ${member.accent}20)`,
                    border: `1.5px solid ${member.accent}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 700,
                    color: member.accent,
                    flexShrink: 0,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px ${member.glowColor}`,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 2px 0", fontSize: 16, fontWeight: 600, color: "#1E293B" }}>
                      {member.name}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: member.accent }}>
                        {member.role}
                      </span>
                      <span style={{ fontSize: 11, color: "#64748B", fontWeight: 400 }}>
                        {member.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                  {member.bio}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Key Focus Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {member.focusAreas.map((area, i) => (
                    <span key={i} style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#475569",
                      background: "#F1F5F9",
                      border: "1px solid #E2E8F0",
                      padding: "3px 8px",
                      borderRadius: "6px"
                    }}>
                      {area}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(15, 23, 42, 0.06)", width: "100%" }} />

                {/* Social Links */}
                <div style={{ display: "flex", gap: "14px" }}>
                  {["LinkedIn", "GitHub", "Email"].map((label) => {
                    let href = "#";
                    if (label === "LinkedIn") href = member.linkedin;
                    if (label === "GitHub") href = member.github;
                    if (label === "Email") href = `mailto:${member.email}`;
                    
                    return (
                      <a
                        key={label}
                        href={href}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: member.accent,
                          textDecoration: "none",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        {label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
