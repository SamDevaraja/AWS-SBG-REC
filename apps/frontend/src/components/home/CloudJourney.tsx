"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const ROADMAP_STEPS = [
  {
    step: "1",
    title: "Foundations",
    desc: "Master the core concepts of cloud computing, security basics, and AWS global infrastructure to build a solid base.",
    iconColor: "#0e1a28",
    iconBg: "rgba(215, 227, 247, 0.6)",
    badgeBg: "rgba(0, 115, 187, 0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    )
  },
  {
    step: "2",
    title: "Architecture",
    desc: "Design resilient, high-performing, and cost-optimized solutions using core AWS services like EC2, S3, and RDS.",
    iconColor: "#fe9800",
    iconBg: "rgba(254, 152, 0, 0.15)",
    badgeBg: "rgba(255, 153, 0, 0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    )
  },
  {
    step: "3",
    title: "Innovation",
    desc: "Dive into advanced topics like Serverless computing, Generative AI on AWS, and modern DevOps practices.",
    iconColor: "#0b1a2c",
    iconBg: "rgba(213, 227, 252, 0.6)",
    badgeBg: "rgba(118, 75, 162, 0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" />
        <path d="M12 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        <path d="M20.5 3.5S19 6 17 8l-6 6v3h3l6-6c2-2 4.5-3.5 4.5-3.5z" />
      </svg>
    )
  }
];

export default function CloudJourney() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      id="cloud-journey"
      ref={containerRef}
      style={{
        width: "100vw",
        background: "#FFFFFF",
        padding: isMobile ? "60px 0" : "90px 0",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "100px",
      }}
    >
      {/* Ambient Orange Background Glows */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "-10%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 153, 0, 0.24) 0%, rgba(255, 153, 0, 0.08) 45%, transparent 70%)",
          filter: "blur(65px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-10%",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 153, 0, 0.28) 0%, rgba(255, 153, 0, 0.09) 45%, transparent 70%)",
          filter: "blur(75px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Additional warm central glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "30%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 176, 32, 0.14) 0%, transparent 75%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Floating Orange Micro-Particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: i % 2 === 0 ? 12 : 18,
              height: i % 2 === 0 ? 12 : 18,
              borderRadius: "50%",
              background: i % 2 === 0 ? "rgba(255, 153, 0, 0.2)" : "rgba(255, 176, 32, 0.25)",
              top: `${15 + (i * 10)}%`,
              left: `${10 + (Math.sin(i) * 5 + i * 11)}%`,
            }}
            animate={{
              y: [0, -35, 0],
              x: [0, 15, 0],
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 7 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          />
        ))}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "0 24px" : "0 44px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: isMobile ? "40px" : "64px",
            width: "100%",
          }}
        >
          <h3
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(2rem, 3.8vw, 2.5rem)",
              fontWeight: 800,
              color: "#232F3E",
              margin: 0,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            The Cloud Journey
          </h3>
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, rgba(35, 47, 62, 0.2) 0%, rgba(255, 153, 0, 0.4) 50%, rgba(35, 47, 62, 0.05) 100%)",
              flex: 1,
            }}
          />
        </motion.div>

        {/* 3-Card Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? "24px" : "40px",
            width: "100%",
          }}
        >
          {ROADMAP_STEPS.map((step, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.15, ease: "easeOut" }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  borderRadius: "32px",
                  border: isHovered ? "1px solid rgba(255, 153, 0, 0.25)" : "1px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: isHovered
                    ? "0px 16px 40px rgba(35, 47, 62, 0.08), 0px 8px 24px rgba(255, 153, 0, 0.06)"
                    : "0px 4px 24px rgba(35, 47, 62, 0.03)",
                  borderTop: isHovered ? "3.5px solid #FF9900" : "3.5px solid transparent",
                  padding: isMobile ? "32px" : "40px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                  transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease, border-top-color 0.25s ease",
                  height: "100%",
                }}
              >
                {/* Decorative background shape inside card */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "140px",
                    height: "140px",
                    background: step.badgeBg,
                    borderBottomLeftRadius: "100%",
                    zIndex: 0,
                    transform: isHovered ? "scale(1.15) translate(4px, -4px)" : "scale(1)",
                    transition: "transform 0.4s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Card Icon */}
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "16px",
                    background: step.iconBg,
                    color: step.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 2,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.02)",
                  }}
                >
                  {step.icon}
                </div>

                {/* Card Content */}
                <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4
                    style={{
                      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#232F3E",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.step}. {step.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14.5px",
                      color: "#475569",
                      lineHeight: "1.65",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
