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

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

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
          const SOCIAL_LINKS = [
            { label: "LinkedIn", href: member.linkedin, icon: <LinkedInIcon />, hoverColor: "#0077B5" },
            { label: "GitHub", href: member.github, icon: <GitHubIcon />, hoverColor: "#24292F" },
            { label: "Email", href: `mailto:${member.email}`, icon: <EmailIcon />, hoverColor: "#EA4335" },
          ];

          return (
            <motion.div
              key={member.id}
              whileHover={{
                y: -4,
                borderColor: "rgba(255, 153, 0, 0.4)",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
              }}
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid #E2E8F0",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Profile Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#F1F5F9",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#475569",
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 2px 0", fontSize: 16, fontWeight: 600, color: "#1E293B" }}>
                      {member.name}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#FF9900" }}>
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
                      padding: "3px 10px",
                      borderRadius: "9999px"
                    }}>
                      {area}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(15, 23, 42, 0.06)", width: "100%" }} />

                {/* Social Links */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  {SOCIAL_LINKS.map(({ label, href, icon, hoverColor }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target={label !== "Email" ? "_blank" : undefined}
                      rel={label !== "Email" ? "noopener noreferrer" : undefined}
                      style={{
                        color: "#94A3B8",
                        transition: "color 0.2s ease",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = hoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#94A3B8";
                      }}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
