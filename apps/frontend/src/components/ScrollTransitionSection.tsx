"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import JourneyCard from "./JourneyCard";

export default function ScrollTransitionSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of this section relative to viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Apply spring physics to smooth out the scroll progress changes for ultra-smooth rendering
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.2,
    restDelta: 0.001
  });

  // Slanted clipPath transition: starts at a 16vh slant (tilted more) and flattens out faster
  const clipProgress = useTransform(smoothScrollProgress, [0.05, 0.35], [16, 0]);
  const clipPath = useTransform(clipProgress, (val) => `polygon(0 ${val}vh, 100% 0vh, 100% 100%, 0% 100%)`);



  // Grid pattern and glow opacity transition: only visible when the background becomes dark
  const visualEffectsOpacity = useTransform(
    smoothScrollProgress,
    [0.1, 0.45],
    [0, 1]
  );

  return (
    <motion.section
      id="about"
      ref={containerRef}
      style={{
        position: "relative",
        minHeight: "auto",
        width: "100%",
        backgroundColor: "#05111f",
        zIndex: 10,
        scrollMarginTop: "80px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "130px 24px 44px",
        boxSizing: "border-box",
        clipPath: clipPath,
      }}
    >
      {/* Grid Background Pattern */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          pointerEvents: "none",
          zIndex: 1,
          opacity: visualEffectsOpacity,
        }}
      />

      {/* Ambient Dark Theme Glow Effects */}
      <motion.div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 153, 0, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
          zIndex: 2,
          opacity: visualEffectsOpacity,
          pointerEvents: "none",
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
          background: "radial-gradient(circle, rgba(0, 115, 187, 0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          zIndex: 2,
          opacity: visualEffectsOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Content Container Layer (Fades and slides up cleanly on scroll entry) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: "960px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
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
            gap: "12px", 
            width: "100%",
            maxWidth: "700px",
            margin: "4px auto 0 auto",
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(13px, 1.4vw, 14.5px)",
              color: "#E2E8F0",
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
              color: "#E2E8F0",
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 500,
            }}
          >
            By combining technical knowledge with hands-on implementation, we help students transform ideas into real-world solutions while preparing them for the rapidly evolving technology industry.
          </p>
        </div>

        {/* Journey Timeline component (with isDark prop and interactive descriptions enabled) */}
        <div style={{ width: "100%", position: "relative", marginTop: "8px" }}>
          <JourneyCard plain={true} hideDesc={false} isDark={true} hideTitle={true} />
        </div>
      </motion.div>
    </motion.section>
  );
}
