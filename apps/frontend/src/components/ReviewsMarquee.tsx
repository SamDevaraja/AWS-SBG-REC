"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { REVIEWS } from "@/lib/reviewsData";

const StarRating = () => (
  <div style={{ display: "flex", gap: 2 }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ))}
  </div>
);

export default function ReviewsMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: false, margin: "-60px" });

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

  const xMarqueeOffset = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  
  // Filtering out grid reviews to display in the marquee
  const marqueeReviews = REVIEWS.filter(r => !r.featured);

  return (
    <section
      id="reviews"
      ref={containerRef}
      style={{
        width: "100vw",
        background: "linear-gradient(180deg, #FFFDF9 0%, #FFFFFF 50%, #FFFDF9 100%)",
        padding: "20px 0 20px",
        position: "relative",
        overflow: "hidden",
        zIndex: 10,
        scrollMarginTop: "100px",
      }}
    >
      {/* Orange line draws left->right at very top */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "#FF9900",
          boxShadow: "0 0 20px rgba(255,153,0,0.3)",
          transformOrigin: "left",
          zIndex: 10,
        }}
      />

      {/* Orange line draws right->left at very bottom */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "#FF9900",
          boxShadow: "0 0 20px rgba(255,153,0,0.3)",
          transformOrigin: "right",
          zIndex: 10,
        }}
      />
      {/* Background Glows */}
      <div style={{ position: "absolute", top: "-10%", left: "5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,153,0,.08) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,153,0,0.08) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36, padding: "0 24px" }}>
        <h2 style={{ 
          fontSize: "clamp(26px, 3.5vw, 36px)", 
          fontWeight: 700, 
          color: "#232F3E", 
          margin: "0 0 10px 0", 
          letterSpacing: "-0.02em",
          lineHeight: 1.2 
        }}>
          What Our Builders Say
        </h2>
        <p style={{ 
          fontSize: 15, 
          color: "#475569", 
          margin: 0, 
          fontWeight: 500, 
          maxWidth: 600, 
          marginLeft: "auto", 
          marginRight: "auto", 
          lineHeight: 1.6 
        }}>
          Real feedback and experiences from active community members building their cloud foundations.
        </p>
      </div>
      {/* Sliding Marquee Container */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          width: "100%",
          display: "flex",
          overflow: "hidden",
          position: "relative",
          padding: "20px 0",
        }}
      >
          {/* Edge Fade Gradients */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(90deg, #FFFFFF, transparent)", zIndex: 5, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(270deg, #FFFDF9, transparent)", zIndex: 5, pointerEvents: "none" }} />
        {/* Purple Glow Edge */}
        <div style={{ position: "absolute", left: "15%", top: "-10px", width: "200px", height: "60px", background: "radial-gradient(ellipse, rgba(130,68,239,.08) 0%, transparent 70%)", filter: "blur(20px)", pointerEvents: "none", zIndex: 1 }} />

        {/* Scroll-driven Parallax Wrapper */}
        <motion.div
          style={{
            x: isMobile ? 0 : xMarqueeOffset,
            display: "flex",
            width: "100%",
          }}
        >
          {/* Marquee Track */}
          <div
            style={{
              display: "flex",
              gap: 28,
              width: "max-content",
              animation: "marquee 45s linear infinite",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {/* Double map to allow seamless looping */}
            {[...marqueeReviews, ...marqueeReviews].map((review, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(15,23,42,0.06), 0 0 0 1.5px rgba(255,153,0,0.18)" }}
                style={{
                  width: 340,
                  minHeight: 200,
                  background: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(16px)",
                  border: "1.5px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: 24,
                  boxShadow: "0 10px 25px -12px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,.95)",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  cursor: "pointer",
                  transition: "all 0.35s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Card Top Banner Line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3.5, background: "linear-gradient(90deg, #FF9900, #EC7211)", borderRadius: "24px 24px 0 0" }} />

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)",
                    border: "1.5px solid rgba(15, 23, 42, 0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#475569", flexShrink: 0
                  }}>
                    {review.initials}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: 15, fontWeight: 600, color: "#1E293B" }}>{review.name}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748B", fontWeight: 400 }}>{review.role}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <StarRating />
                  <span style={{
                    background: "#F1F5F9", border: "1px solid #E2E8F0",
                    color: "#475569", borderRadius: 100, padding: "3px 10px",
                    fontSize: 10, fontWeight: 600,
                  }}>
                    {review.tag}
                  </span>
                </div>

                <p style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#475569",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                }}>
                  "{review.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
