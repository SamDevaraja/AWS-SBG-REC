"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import JourneyCard from "./JourneyCard";

export default function ScrollTransitionSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress through the height of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Apply spring physics to smooth out the scroll progress changes (optimized for faster, responsive feedback)
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.2,
    restDelta: 0.001
  });

  // --- CENTRAL INTRO TEXT (LEARN • BUILD • INNOVATE) ---
  const introTextOpacity = useTransform(smoothScrollProgress, [0, 0.12, 0.20], [1, 1, 0], { clamp: true });
  const introTextScale = useTransform(smoothScrollProgress, [0, 0.12, 0.20], [1, 1.05, 0.95], { clamp: true });
  const introTextY = useTransform(smoothScrollProgress, [0, 0.12, 0.20], [0, 0, -20], { clamp: true });

  // --- LAYER 1: OUTER RING (THE VANGUARD) ---
  const outerY = 0;
  const outerScale = useTransform(smoothScrollProgress, [0, 0.15, 0.36, 1], [0, 0.9, 35, 38], { clamp: true });
  const outerBorderRadius = useTransform(smoothScrollProgress, [0, 0.22, 0.36, 1], ["50%", "50%", "0%", "0%"], { clamp: true });
  const outerOpacity = useTransform(smoothScrollProgress, [0, 0.05, 0.32, 0.36], [0, 1, 1, 0], { clamp: true });

  // --- LAYER 2: MIDDLE GLOW LAYER (THE RIPPLE) ---
  const glowY = 0;
  const glowScale = useTransform(smoothScrollProgress, [0, 0.16, 0.37, 1], [0, 0.85, 32, 35], { clamp: true });
  const glowBorderRadius = useTransform(smoothScrollProgress, [0, 0.23, 0.37, 1], ["50%", "50%", "0%", "0%"], { clamp: true });
  const glowOpacity = useTransform(smoothScrollProgress, [0, 0.06, 0.34, 0.37], [0, 1, 1, 0], { clamp: true });

  // --- LAYER 3: CORE BACKGROUND (THE MASK) ---
  const coreY = 0;
  const coreScale = useTransform(smoothScrollProgress, [0, 0.17, 0.38, 1], [0, 0.8, 29, 32], { clamp: true });
  const coreBorderRadius = useTransform(smoothScrollProgress, [0, 0.24, 0.38, 1], ["50%", "50%", "0%", "0%"], { clamp: true });
  const coreOpacity = useTransform(smoothScrollProgress, [0, 0.08], [0, 1], { clamp: true });

  // --- CONTENT & GENERAL EFFECTS (TRIGGERED AFTER EXPANSION IS COMPLETE) ---
  const contentOpacity = useTransform(smoothScrollProgress, [0.32, 0.42, 0.94, 1.0], [0, 1, 1, 0], { clamp: true });
  const contentY = useTransform(smoothScrollProgress, [0.32, 0.42, 0.94, 1.0], [30, 0, 0, -30], { clamp: true });
  const ambientGlowOpacity = useTransform(smoothScrollProgress, [0.12, 0.38], [0, 0.45], { clamp: true });

  return (
    <section
      id="about"
      ref={containerRef}
      style={{
        position: "relative",
        height: "105vh",
        width: "100%",
        background: "linear-gradient(180deg, #ffffff 0%, #0F1C2E 15%, #05111f 40%, #05111f 100%)",
        zIndex: 10,
        scrollMarginTop: "100px",
      }}
    >
      {/* Sticky container that remains fixed in the viewport during scroll progress */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Inner container to establish a solid relative positioning context */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* LAYER 1: The Outer Ring (Vanguard) */}
          <motion.div
            style={{
              position: "absolute",
              width: "600px",
              height: "600px",
              left: "calc(50% - 300px)",
              top: "calc(50% - 300px)",
              borderRadius: outerBorderRadius,
              scale: outerScale,
              y: outerY,
              opacity: outerOpacity,
              border: "2px solid rgba(0, 115, 187, 0.45)",
              boxShadow: "0px 0px 35px rgba(0, 115, 187, 0.25), inset 0px 0px 25px rgba(0, 115, 187, 0.15)",
              backgroundColor: "transparent",
              zIndex: 1,
              pointerEvents: "none",
              willChange: "transform, border-radius, opacity",
            }}
          />

          {/* LAYER 2: The Middle Glow Layer (Ripple) */}
          <motion.div
            style={{
              position: "absolute",
              width: "600px",
              height: "600px",
              left: "calc(50% - 300px)",
              top: "calc(50% - 300px)",
              borderRadius: glowBorderRadius,
              scale: glowScale,
              y: glowY,
              opacity: glowOpacity,
              background: "radial-gradient(circle, rgba(255, 153, 0, 0.18) 0%, rgba(15, 28, 46, 0.8) 60%, transparent 100%)",
              filter: "blur(4px)",
              zIndex: 2,
              pointerEvents: "none",
              willChange: "transform, border-radius, opacity",
            }}
          />

          {/* LAYER 3: The Core Background Layer (Mask) */}
          <motion.div
            style={{
              position: "absolute",
              width: "600px",
              height: "600px",
              left: "calc(50% - 300px)",
              top: "calc(50% - 300px)",
              borderRadius: coreBorderRadius,
              scale: coreScale,
              y: coreY,
              opacity: coreOpacity,
              background: "radial-gradient(circle at center, #0F1C2E 0%, #060B12 100%)",
              boxShadow:
                "0px -15px 50px rgba(0, 115, 187, 0.18), 0px 0px 40px rgba(255, 153, 0, 0.08) inset, 0px 10px 40px rgba(0, 0, 0, 0.4)",
              zIndex: 3,
              pointerEvents: "auto",
              willChange: "transform, border-radius, opacity",
            }}
          />

          {/* Central Intro Text (Learn • Build • Innovate) */}
          <motion.div
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              zIndex: 4,
              opacity: introTextOpacity,
              scale: introTextScale,
              y: introTextY,
              pointerEvents: "none",
              textAlign: "center",
              padding: "0 20px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(1.8rem, 5vw, 3.6rem)",
                fontWeight: 800,
                letterSpacing: "4px",
                margin: 0,
                color: "#FFFFFF",
                lineHeight: 1.1,
                textTransform: "uppercase",
                backgroundImage: "linear-gradient(135deg, #FFFFFF 30%, #FF9900 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0px 4px 15px rgba(255, 153, 0, 0.15))",
              }}
            >
              LEARN • BUILD • INNOVATE
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                color: "#64748B",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Scroll to enter the cloud portal
              <motion.span
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                ↓
              </motion.span>
            </p>
          </motion.div>

          {/* Ambient Dark Theme Glow Effects */}
          <motion.div
            style={{
              position: "absolute",
              top: "10%",
              left: "15%",
              width: "45vw",
              height: "45vw",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255, 153, 0, 0.12) 0%, transparent 70%)",
              filter: "blur(90px)",
              zIndex: 4,
              opacity: ambientGlowOpacity,
            }}
          />
          <motion.div
            style={{
              position: "absolute",
              bottom: "10%",
              right: "15%",
              width: "40vw",
              height: "40vw",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0, 115, 187, 0.15) 0%, transparent 70%)",
              filter: "blur(80px)",
              zIndex: 4,
              opacity: ambientGlowOpacity,
            }}
          />

          {/* Content Container Layer (Centered Over Expanding Circle) */}
          <motion.div
            style={{
              position: "relative",
              zIndex: 5,
              maxWidth: "960px",
              width: "100%",
              padding: "0 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "20px",
              opacity: contentOpacity,
              y: contentY,
              pointerEvents: "auto",
            }}
          >
            {/* Badge Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, rgba(255, 153, 0, 0.12), rgba(255, 153, 0, 0.05))",
                border: "1px solid rgba(255, 153, 0, 0.22)",
                borderRadius: "100px",
                padding: "6px 16px",
                boxShadow: "0 0 12px rgba(255, 153, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "#FF9900",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Our Mission
              </span>
            </div>

            {/* Heading */}
            <h2
              style={{
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                backgroundImage: "linear-gradient(135deg, #FFFFFF 50%, #FFE9CC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Empowering students to learn, build, and innovate on AWS.
            </h2>

            {/* Description paragraphs stacked vertically */}
            <div 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "8px", 
                width: "100%",
                maxWidth: "840px",
                margin: "8px auto 0 auto",
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(13px, 1.4vw, 14.5px)",
                  color: "#94A3B8",
                  lineHeight: 1.6,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                AWS Student Builders Group REC is a student-driven cloud community at Rajalakshmi Engineering College dedicated to learning, building, and innovating with Amazon Web Services. We bring together aspiring developers, cloud enthusiasts, and future technology leaders to explore modern cloud technologies through practical experiences and collaborative learning.
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(13px, 1.4vw, 14.5px)",
                  color: "#94A3B8",
                  lineHeight: 1.6,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                By combining technical knowledge with hands-on implementation, we help students transform ideas into real-world solutions while preparing them for the rapidly evolving technology industry.
              </p>
            </div>

            {/* Separator line inside the card */}
            <div 
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255, 153, 0, 0.3), rgba(0, 115, 187, 0.2), transparent)",
                width: "100%",
                margin: "6px 0",
              }} 
            />

            {/* Journey Timeline component (with isDark prop) */}
            <div style={{ width: "100%", position: "relative" }}>
              <JourneyCard plain={true} hideDesc={true} isDark={true} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
