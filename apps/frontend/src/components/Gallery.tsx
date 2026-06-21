"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CARDS = [
  {
    label: "Cloud Matrix Bootcamp",
    sublabel: "120+ builders · Oct 2025 · 24 hours",
    image: "/images/cloud_jam.jpg",
    description: "A beginner-friendly cloud computing session focused on cloud fundamentals, industry-recognized certifications, career opportunities, and structured learning roadmaps.",
  },
  {
    label: "Generative AI Workshop",
    sublabel: "Bedrock & LLMs · Feb 2026",
    image: "/images/ai_workshop.jpg",
    description: "A deep dive workshop into Amazon Bedrock, foundations models, and practical application building. Students designed and deployed their own generative AI projects.",
  },
  {
    label: "Community Meetup",
    sublabel: "150+ members · Networking",
    image: "/images/community_meetup.jpg",
    description: "A collaborative gathering where students, developers, and tech enthusiasts connected, shared knowledge, and built meaningful professional networks.",
  },
  {
    label: "AWS Certification Bootcamp",
    sublabel: "100+ students certified",
    image: "/images/bootcamp.jpg",
    description: "An intensive training series designed to prepare students for core AWS certifications, resulting in over 100 community members earning industry credentials.",
  },
  {
    label: "re:Invent Watch Party",
    sublabel: "Annual re:Invent watch session",
    image: "/images/ai_workshop.jpg",
    description: "A live broadcast and discussion session of key AWS announcements, bringing global cloud innovations directly to our student community.",
  },
  {
    label: "Robo Wolke Showcase",
    sublabel: "Robotics & IoT · Dobot Magician",
    image: "/images/robo_wolke_journey.jpg",
    description: "An experimental robotics exhibition demonstrating the integration of cloud computing with physical hardware, using AWS-backed cloud services.",
  },
];

export default function Gallery() {
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

  const yGrid = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section
      id="gallery"
      ref={containerRef}
      style={{
        width: "100vw",
        background: "#FFFFFF",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "80px",
      }}
    >
      {/* ── BACKGROUND GRID PATTERN ── */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(15,23,42,0.02) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(15,23,42,0.02) 1.5px, transparent 1.5px)",
          backgroundSize: "60px 60px",
          y: isMobile ? 0 : yGrid,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: 54, position: "relative", zIndex: 1, padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 2.5, borderRadius: 2, background: "#FF9900" }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "#FF9900" }}>
            Highlights
          </span>
          <div style={{ width: 28, height: 2.5, borderRadius: 2, background: "#FF9900" }} />
        </div>

        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: "#1E293B", margin: "0 0 16px", letterSpacing: "-1px", lineHeight: 1.2 }}>
          Our Builder Journey
        </h2>
        <p style={{ fontSize: 15, color: "#64748B", margin: 0, fontWeight: 400, maxWidth: 600, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
          Explore key milestones, workshops, and community events that shape our student developers.
        </p>
      </div>

      {/* ── GALLERY GRID ── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 44px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "36px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {CARDS.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(15,23,42,0.06), 0 0 0 1.5px rgba(255,153,0,0.18)" }}
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              border: "1.5px solid rgba(15, 23, 42, 0.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s ease",
            }}
          >
            {/* Image section */}
            <div style={{ width: "100%", height: 220, overflow: "hidden", position: "relative" }}>
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.label}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    transition: "transform 0.5s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0073BB, #FF9900)" }} />
              )}
            </div>

            {/* Content section */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", gap: 16 }}>
              <div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#FF9900",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "inline-block",
                  marginBottom: 8,
                }}>
                  {card.sublabel}
                </span>
                <h3 style={{ margin: "0 0 10px 0", fontSize: 18, fontWeight: 600, color: "#1E293B" }}>
                  {card.label}
                </h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                  {card.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
