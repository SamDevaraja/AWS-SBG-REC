"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { REVIEWS } from "@/lib/reviewsData";

const StarRating = ({ color }: { color: string }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ))}
  </div>
);

export default function ReviewsMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  
  // Filtering out grid reviews to display in the marquee
  const marqueeReviews = REVIEWS.filter(r => !r.featured);

  return (
    <section
      id="reviews"
      style={{
        width: "100vw",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)",
        padding: "60px 0 48px",
        position: "relative",
        overflow: "hidden",
        zIndex: 10,
        scrollMarginTop: "100px",
      }}
    >
      {/* Background Glows */}
      <div style={{ position: "absolute", top: "-10%", left: "5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,115,187,0.04) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,153,0,0.04) 0%,transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36, padding: "0 24px" }}>
        <h2 style={{ 
          fontSize: "clamp(26px, 3.5vw, 36px)", 
          fontWeight: 900, 
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
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(270deg, #F1F5F9, transparent)", zIndex: 5, pointerEvents: "none" }} />

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
              whileHover={{ y: -6, scale: 1.02, boxShadow: `0 20px 40px rgba(15,23,42,0.06), 0 0 0 1px ${review.color}25, 0 12px 30px ${review.color}08` }}
              style={{
                width: 340,
                height: 250,
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(16px)",
                border: "1.5px solid rgba(35, 47, 62, 0.07)",
                borderRadius: 24,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                cursor: "pointer",
                transition: "all 0.35s ease",
                position: "relative",
              }}
            >
              {/* Card Top Banner Glow */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3.5, background: `linear-gradient(90deg, ${review.color}, ${review.color}88)`, borderRadius: "3px 3px 0 0" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${review.color}, ${review.color}88)`,
                  boxShadow: `0 0 0 2px ${review.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: "#FFFFFF", flexShrink: 0
                }}>
                  {review.initials}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 2px 0", fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{review.name}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748B", fontWeight: 500 }}>{review.role}</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <StarRating color={review.color} />
                <span style={{
                  background: `${review.color}08`, border: `1px solid ${review.color}20`,
                  color: review.color, borderRadius: 100, padding: "3px 10px",
                  fontSize: 10, fontWeight: 700,
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
      </div>
    </section>
  );
}
