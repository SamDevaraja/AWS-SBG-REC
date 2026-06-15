"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const EVENTS_DATA = [
  {
    title: "Robowolke",
    type: "WORKSHOP",
    image: "/images/robo_wolke.jpg",
    desc: "Where robotics meets cloud intelligence. TRS REC x AWS REC present a workshop on DOBOT and Computer Vision Integration with AWS. Open to all UG departments with free registrations and certificates provided.",
    date: "29th April 2026",
    time: "9:00 AM to 2:00 PM",
    location: "ANEW104",
    attendees: "80 attendees",
    theme: "linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.5) 100%)", // warm amber/orange
    borderTheme: "rgba(245, 158, 11, 0.22)",
    textColor: "#d97706"
  },
  {
    title: "Cloud Matrix",
    type: "SEMINAR",
    image: "/images/cloud_matrix.jpg",
    desc: "Cloud Computing — From Basics to Careers & Certifications. Learn cloud fundamentals, career paths, and AWS certifications in one comprehensive session.",
    date: "18th April 2026",
    time: "8 to 10:00 AM",
    location: "ANEW104",
    attendees: "150 attendees",
    theme: "linear-gradient(135deg, rgba(224, 242, 241, 0.6) 0%, rgba(178, 223, 219, 0.5) 100%)", // cool teal/green
    borderTheme: "rgba(0, 115, 187, 0.22)",
    textColor: "#0073BB"
  }
];

const Y_STEP = 12;
const SCALE_STEP = 0.04;
const AUTO_MS = 2000;
const N = EVENTS_DATA.length;

export default function Events() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });
  const [isMobile, setIsMobile] = useState(false);
  const [order, setOrder] = useState<number[]>(() => EVENTS_DATA.map((_, i) => i));
  const [flyingIdx, setFlyingIdx] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const advance = useCallback(() => {
    if (isBusy) return;
    setIsBusy(true);

    const topCardIdx = order[0];
    setFlyingIdx(topCardIdx);

    setOrder((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });

    setTimeout(() => {
      setFlyingIdx(null);
      setIsBusy(false);
    }, 520);
  }, [isBusy, order]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(advance, AUTO_MS);
    return () => clearInterval(t);
  }, [advance, paused]);

  const currentTopCard = EVENTS_DATA[order[0]];

  return (
    <section
      id="events"
      ref={containerRef}
      style={{
        width: "100vw",
        background: "#ffffff",
        padding: "60px 0",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "100px",
      }}
    >
      {/* Decorative Blob */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(30, 45, 61, 0.03) 0%, transparent 70%)",
          animation: "blob 20s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", fontWeight: 900, color: "#1e2d3d", marginBottom: "12px", letterSpacing: "-0.02em" }}>
            EVENTS
          </h2>
          <div style={{ width: "60px", height: "3px", background: "#FF9900", margin: "0 auto 16px" }} />
          <p style={{ fontSize: "15px", color: "#4b5563", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
            Join our workshops, community days, and certification bootcamps
          </p>
        </div>

        {/* Deck and Details grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.25fr 1fr",
            gap: isMobile ? "40px" : "48px",
            alignItems: "center",
            maxWidth: "1050px",
            margin: "0 auto",
          }}
        >
          {/* LEFT: Flyer Card Stack */}
          <div
            style={{
              position: "relative",
              width: isMobile ? "290px" : "400px",
              height: isMobile ? "460px" : "610px",
              margin: "0 auto",
              cursor: isBusy ? "wait" : "pointer",
            }}
            onClick={advance}
          >
            {[...order].reverse().map((cardIdx, revDepth) => {
              const depth = N - 1 - revDepth;
              const card = EVENTS_DATA[cardIdx];
              const isTop = depth === 0;

              return (
                <motion.div
                  key={cardIdx}
                  layout
                  animate={{
                    y: depth * Y_STEP,
                    scale: 1 - depth * SCALE_STEP,
                    opacity: isTop && flyingIdx === cardIdx ? 0 : 1 - depth * 0.08,
                  }}
                  transition={{
                    layout: { type: "spring", stiffness: 260, damping: 28 },
                    opacity: { duration: 0.05 },
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: isMobile ? "290px" : "400px",
                    height: isMobile ? "410px" : "565px",
                    borderRadius: 20,
                    overflow: "hidden",
                    background: "#ffffff",
                    zIndex: N - depth,
                    transformOrigin: "top center",
                    boxShadow: isTop
                      ? "0 24px 56px rgba(15,23,42,0.12)"
                      : "0 8px 24px rgba(15,23,42,0.06)",
                    userSelect: "none",
                    pointerEvents: "none",
                    border: "1px solid rgba(0,0,0,0.05)"
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                      opacity: isTop ? 1 : 0.75,
                      background: "#ffffff",
                    }}
                  />
                  {!isTop && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.22)",
                        zIndex: 1,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Flying card overlay (exits to the left side) */}
            <AnimatePresence>
              {flyingIdx !== null && (
                <motion.div
                  key="flying"
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
                  animate={{
                    x: isMobile ? -260 : -460,
                    y: 20,
                    rotate: -12,
                    scale: 0.95,
                    opacity: 0,
                  }}
                  exit={{}}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: isMobile ? "290px" : "400px",
                    height: isMobile ? "410px" : "565px",
                    borderRadius: 20,
                    overflow: "hidden",
                    background: "#ffffff",
                    zIndex: N + 10,
                    pointerEvents: "none",
                    transformOrigin: "top center",
                    boxShadow: "0 24px 56px rgba(15,23,42,0.16)",
                  }}
                >
                  <img
                    src={EVENTS_DATA[flyingIdx].image}
                    alt={EVENTS_DATA[flyingIdx].title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                      background: "#ffffff",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click advance hint */}
            <motion.div
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: isMobile ? 12 : 10,
                left: "50%",
                translateX: "-50%",
                fontSize: "12px",
                fontWeight: 700,
                color: "#9ca3af",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                letterSpacing: "0.03em",
              }}
            >
              Click deck to swipe →
            </motion.div>
          </div>

          {/* RIGHT: Dynamic Glass Details Card */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: isMobile ? "center" : "flex-start" }}>
            <motion.div
              key={order[0]}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{
                background: currentTopCard.theme,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1.5px solid ${currentTopCard.borderTheme}`,
                borderRadius: "24px",
                padding: isMobile ? "20px" : "28px",
                boxShadow: "0 20px 40px rgba(30, 45, 61, 0.03), inset 0 0 20px rgba(255, 255, 255, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
                maxWidth: isMobile ? "290px" : "380px",
                transition: "background 0.5s ease, border-color 0.5s ease",
              }}
            >
              <div>
                <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#1e2d3d", marginBottom: "6px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                  {currentTopCard.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>
                  {currentTopCard.desc}
                </p>
              </div>

              {/* Grid details list with matching colored icons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Date */}
                <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#475569", fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px", color: currentTopCard.textColor, flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{currentTopCard.date}</span>
                </div>

                {/* Time */}
                <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#475569", fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px", color: currentTopCard.textColor, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{currentTopCard.time}</span>
                </div>

                {/* Location */}
                <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#475569", fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px", color: currentTopCard.textColor, flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{currentTopCard.location}</span>
                </div>

                {/* Attendees */}
                <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#475569", fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px", color: currentTopCard.textColor, flexShrink: 0 }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>{currentTopCard.attendees}</span>
                </div>
              </div>

              {/* Full-width dark Register Now CTA */}
              <motion.button
                whileHover={{ scale: 1.01, backgroundColor: "#111827" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#1e2d3d",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "100px",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "13.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "4px",
                  fontFamily: "inherit",
                  boxShadow: "0 10px 20px rgba(30, 45, 61, 0.15)",
                  transition: "background-color 0.2s ease"
                }}
              >
                <span>Register Now</span>
                <span>→</span>
              </motion.button>
            </motion.div>

            {/* Slider progress dots under details card */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "24px" }}>
              {EVENTS_DATA.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: order[0] === i ? 24 : 8,
                    backgroundColor: order[0] === i ? "#FF9900" : "rgba(35,47,62,.18)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ height: 8, borderRadius: 100, cursor: "pointer" }}
                  onClick={() => {
                    if (isBusy) return;
                    const steps = (order.indexOf(i) + N) % N;
                    if (steps === 0) return;
                    let count = 0;
                    const tick = () => {
                      if (count >= steps) return;
                      count++;
                      advance();
                      if (count < steps) setTimeout(tick, 180);
                    };
                    tick();
                  }}
                />
              ))}
            </div>

            {/* Play/Pause */}
            <motion.button
              onClick={() => setPaused((p) => !p)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                alignSelf: "center",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                borderRadius: 100,
                border: "1.5px solid rgba(35,47,62,.12)",
                background: "rgba(255,255,255,.9)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 700,
                color: "#232F3E",
                outline: "none",
                marginTop: "16px"
              }}
            >
              {paused ? "▶ Play" : "⏸ Pause"}
            </motion.button>
          </div>
        </div>
      </div>

    </section>
  );
}
