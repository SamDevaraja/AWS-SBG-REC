"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import CloudOrbit from "./CloudOrbit";

const ROTATING_TEXTS = [
  { text: " Mastering Cloud Computing" },
  { text: " Building Real Projects" },
  { text: " Earning Certifications" },
  { text: " Growing Your Network" },
  { text: " Exploring Workshops" },
  { text: " Competing in Hackathons" },
  { text: " Expanding Industry Exposure" },
  { text: " Learning from Mentors" },
  { text: " Developing Career Skills" }
];

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Static Layout Only - Removed parallax and magnetic buttons per requirements

  return (
    <section
      id="home"
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
        padding: "0",
      }}
    >
      {/* Spacer for navbar */}
      <div style={{ flexShrink: 0, height: "80px" }} />

      {/* Hero banner — vertically centred in remaining space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "40px 0",
        }}
      >
      {/* Static blurred glass particles & soft gradient mesh blobs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "15%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 95% 5%, rgba(255,153,0,.26) 0%, rgba(255,153,0,.12) 35%, rgba(255,255,255,0) 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,115,187,.14) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(55px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "30%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(130,68,239,.12) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(55px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "45%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(30, 45, 61, 0.02)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Main Container */}
      <motion.div
        whileHover={{
          boxShadow: "0 12px 50px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 0 24px rgba(255,255,255,0.5)"
        }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "1300px",
          padding: isMobile ? "32px 24px" : "30px 56px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: isMobile ? "40px" : "40px",
          zIndex: 10,
          background: "radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.18) 0%, rgba(255, 153, 0, 0.08) 35%, rgba(255, 255, 255, 0) 65%)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 20px rgba(255,255,255,0.4)",
          borderRadius: "40px",
          position: "relative",
          overflow: "hidden",
          marginTop: isMobile ? "0px" : "-10px",
        }}
      >
        {/* Soft floating gradient blobs inside the glass */}
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 1 }} />
        {/* Left Side: Staggered Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", flex: 1, position: "relative", zIndex: 2 }}
        >
          {/* Large Headline */}
          <motion.h1
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring", stiffness: 150 } }
            }}
            style={{
              fontSize: "clamp(2.8rem, 6vw, 4.4rem)",
              fontWeight: 900,
              color: "#232F3E",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            AWS Student Builders Group
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring" } }
            }}
            style={{
              fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
              fontWeight: 800,
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              height: "58px",
              position: "relative",
              width: "100%",
            }}
          >
            <div style={{ position: "relative", flex: 1, height: "100%", overflow: "hidden" }}>
              <AnimatePresence>
                <motion.div
                  key={textIndex}
                  initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      backgroundImage: "linear-gradient(90deg, #FF9900, #F7BA45, rgba(130,68,239,.8))",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "0 2px 10px rgba(130,68,239,0.1)",
                    }}
                  >
                    {ROTATING_TEXTS[textIndex].text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { type: "spring" } }
            }}
            style={{
              fontSize: "15px",
              color: "#4b5563",
              lineHeight: 1.8,
              marginBottom: "36px",
              maxWidth: "500px",
            }}
          >
            AWS Student Builders Group REC Chapter is a student-led cloud community focused on learning, building, and innovating with AWS. We empower students through hands-on projects, certifications, mentorship, hackathons, workshops, and industry-driven experiences that transform learners into cloud builders.
          </motion.p>
        </motion.div>
        {/* Right Side Cloud Orbit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flex: 1,
            position: "relative",
            zIndex: 2,
          }}
        >
          <CloudOrbit />
        </motion.div>
      </motion.div>
      </div>

      {/* Domains marquee — pinned to bottom */}
      <div style={{ flexShrink: 0, paddingTop: "24px", paddingBottom: "32px" }}>
        <DomainsInline />
      </div>
    </section>
  );
}

/* ── Inline Domains marquee (self-contained) ────────────────────────────── */
function DomainsInline() {
  const DOMAINS = [
    { emoji: "🤖", label: "AI & Machine Learning" },
    { emoji: "⚙️", label: "DevOps" },
    { emoji: "🔒", label: "Security" },
    { emoji: "📊", label: "Data Analytics" },
    { emoji: "⚡", label: "Serverless" },
    { emoji: "📦", label: "Containers" },
    { emoji: "💻", label: "Full Stack" },
    { emoji: "🌐", label: "Networking" },
    { emoji: "🔧", label: "MLOps" },
    { emoji: "☁️", label: "Cloud Computing" },
    { emoji: "🏗️", label: "Infrastructure" },
    { emoji: "📡", label: "IoT" },
  ];

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "24px",
          width: "max-content",
          animation: "marquee 30s linear infinite",
        }}
      >
        {[...DOMAINS, ...DOMAINS].map((d, i) => (
          <div
            key={i}
            className="domain-pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "100px",
              border: "1px solid rgba(180,180,180,0.35)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#1a1a2e",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <span>{d.emoji}</span>
            <span>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
