"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { REVIEWS } from "@/lib/reviewsData";

const QuoteIcon = ({ color }: { color: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{
      opacity: 0.12,
      position: "absolute",
      top: "20px",
      right: "20px",
      color: color,
      pointerEvents: "none"
    }}
  >
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.987z" />
  </svg>
);

const VerifiedBadge = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0073BB"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      display: "inline-block",
      marginLeft: 4,
      verticalAlign: "middle",
      flexShrink: 0
    }}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const StarsRow = () => (
  <div style={{ display: "flex", gap: 2.5, alignItems: "center" }}>
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="#FF9900"
        style={{ flexShrink: 0 }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const GAP = 22;

interface ReviewCardProps {
  review: typeof REVIEWS[0];
  idx: number;
  half: "a" | "b";
  isZoomed: boolean;
  isDimmed: boolean;
  onClick: () => void;
}

const ReviewCard = ({ review, idx, half, isZoomed, isDimmed, onClick }: ReviewCardProps) => {
  return (
    <motion.div
      key={`${half}-${idx}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      whileHover={!isZoomed ? {
        borderColor: "rgba(255, 153, 0, 0.4)",
        boxShadow: "0 10px 20px -10px rgba(255, 153, 0, 0.08)",
      } : undefined}
      animate={{
        scale: isZoomed ? 1.06 : 1,
        borderColor: isZoomed ? "#FF9900" : "rgba(15, 23, 42, 0.06)",
        boxShadow: isZoomed 
          ? "0 12px 30px rgba(255, 153, 0, 0.15)" 
          : "0 2px 8px rgba(15, 23, 42, 0.02)",
        opacity: isDimmed ? 0.4 : 1,
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: 340,
        height: 190,
        background: "#FFFFFF",
        borderRadius: 12,
        border: "1px solid",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        boxSizing: "border-box",
        zIndex: isZoomed ? 20 : 1,
      }}
    >
      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", position: "relative" }}>
        {/* Avatar */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#f8fafc",
          border: `1.5px solid ${review.color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 700,
          color: review.color,
          flexShrink: 0,
        }}>
          {review.initials}
        </div>

        {/* Name and Department */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
          <h4 style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 655,
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            letterSpacing: "-0.01em",
          }}>
            {review.name}
            <VerifiedBadge />
          </h4>
          <p style={{
            margin: 0,
            fontSize: "11.5px",
            fontWeight: 500,
            color: "#64748b",
          }}>
            {review.role}
          </p>
        </div>
      </div>

      {/* Quote Icon */}
      <QuoteIcon color={review.color} />

      {/* Stars rating & Quote Text */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
        <StarsRow />
        <p style={{
          margin: 0,
          fontSize: "13px",
          color: "#334155",
          lineHeight: 1.55,
          fontWeight: 450,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {review.text}
        </p>
      </div>

      {/* Card Footer Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: "auto" }}>
        {review.badge && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "10px",
            fontWeight: 600,
            color: "#475569",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            padding: "2px 8px",
            borderRadius: "9999px",
          }}>
            {review.badge}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "10.5px", color: "#16a34a", fontWeight: 600 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
          Verified Builder
        </div>
      </div>
    </motion.div>
  );
};

export default function ReviewsMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  const [trackOffset, setTrackOffset] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<{ idx: number; half: "a" | "b" } | null>(null);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstHalfRef = useRef<HTMLDivElement>(null);

  // Filter and order reviews so Prathakshanaa ("Captain") is always first
  const marqueeReviews = React.useMemo(() => {
    const unfiltered = REVIEWS.filter(r => !r.featured);
    const captain = unfiltered.filter(r => r.name.toLowerCase().includes("prathakshanaa"));
    const others = unfiltered.filter(r => !r.name.toLowerCase().includes("prathakshanaa"));
    return [...captain, ...others];
  }, []);

  const measure = useCallback(() => {
    if (firstHalfRef.current) {
      setTrackOffset(firstHalfRef.current.offsetWidth + GAP);
    }
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, marqueeReviews.length]);

  // Set up intersection observer to only play when in view
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Calculate translation required to center the clicked card
  const clickedTranslation = useMemo(() => {
    if (!clickedIndex || !containerRef.current) return 0;
    const cardWidth = 340;
    const cardGap = GAP;
    const containerWidth = containerRef.current.offsetWidth;
    
    // Calculate the left position of the clicked card inside the track
    const baseOffset = clickedIndex.idx * (cardWidth + cardGap);
    const absoluteLeft = clickedIndex.half === "a" ? trackOffset + baseOffset : baseOffset;
    
    // Center of the card
    const cardCenter = absoluteLeft + cardWidth / 2;
    
    // Translation needed to align cardCenter with containerWidth / 2
    return (containerWidth / 2) - cardCenter;
  }, [clickedIndex, trackOffset]);

  const handleCardClick = (idx: number, half: "a" | "b") => {
    if (clickedIndex && clickedIndex.idx === idx && clickedIndex.half === half) {
      setClickedIndex(null);
    } else {
      setClickedIndex({ idx, half });
    }
  };

  return (
    <section
      id="reviews"
      ref={sectionRef}
      onClick={() => setClickedIndex(null)}
      style={{
        width: "100%",
        background: "linear-gradient(180deg, #f1f5f9 0%, #f8fafc 100%)",
        padding: "24px 0 28px",
        position: "relative",
        overflow: "hidden",
        zIndex: 10,
        scrollMarginTop: "100px",
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${trackOffset}px); }
        }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 18, padding: "0 24px" }}>
        <span style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          color: "#FF9900",
          display: "block",
          marginBottom: "6px"
        }}>
          BUILDER TESTIMONIALS
        </span>
        <h2 style={{ 
          fontSize: "clamp(24px, 3.2vw, 32px)", 
          fontWeight: 750, 
          color: "#0f172a", 
          margin: "0 0 6px 0", 
          letterSpacing: "-0.02em",
          lineHeight: 1.2 
        }}>
          What Our Builders Say
        </h2>
        <p style={{ 
          fontSize: "14.5px", 
          color: "#475569", 
          margin: 0, 
          fontWeight: 450, 
          maxWidth: 580, 
          marginLeft: "auto", 
          marginRight: "auto", 
          lineHeight: 1.6 
        }}>
          Real feedback and experiences from active community members building their cloud foundations.
        </p>
      </div>

      <div
        ref={containerRef}
        onMouseEnter={() => !clickedIndex && setIsPaused(true)}
        onMouseLeave={() => !clickedIndex && setIsPaused(false)}
        style={{
          width: "100%",
          display: "flex",
          overflow: "hidden",
          position: "relative",
          padding: "16px 0",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "140px", background: "linear-gradient(90deg, #f8fafc, transparent 80%, transparent)", zIndex: 5, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "140px", background: "linear-gradient(270deg, #ffffff, transparent 80%, transparent)", zIndex: 5, pointerEvents: "none" }} />

        <div
          style={{
            display: "flex",
            gap: GAP,
            width: "max-content",
            animationName: (trackOffset > 0 && !clickedIndex) ? "marquee-scroll" : "none",
            animationDuration: "30s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationPlayState: (isPaused || !isInView) ? "paused" : "running",
            transform: clickedIndex ? `translateX(${clickedTranslation}px)` : undefined,
            transition: clickedIndex ? "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            willChange: "transform",
          }}
        >
          {/* Second half — starts visible on left */}
          <div style={{ display: "flex", gap: GAP }}>
            {marqueeReviews.map((review, idx) => {
              const isZoomed = !!clickedIndex && clickedIndex.idx === idx && clickedIndex.half === "b";
              const isDimmed = !!clickedIndex && !isZoomed;
              return (
                <ReviewCard
                  key={`b-${idx}`}
                  review={review}
                  idx={idx}
                  half="b"
                  isZoomed={isZoomed}
                  isDimmed={isDimmed}
                  onClick={() => handleCardClick(idx, "b")}
                />
              );
            })}
          </div>

          {/* First half — slides in from left */}
          <div ref={firstHalfRef} style={{ display: "flex", gap: GAP }}>
            {marqueeReviews.map((review, idx) => {
              const isZoomed = !!clickedIndex && clickedIndex.idx === idx && clickedIndex.half === "a";
              const isDimmed = !!clickedIndex && !isZoomed;
              return (
                <ReviewCard
                  key={`a-${idx}`}
                  review={review}
                  idx={idx}
                  half="a"
                  isZoomed={isZoomed}
                  isDimmed={isDimmed}
                  onClick={() => handleCardClick(idx, "a")}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
