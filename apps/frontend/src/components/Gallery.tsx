"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Card data ─────────────────────────────────────────────────────────── */
const CARDS = [
  {
    gradient: "linear-gradient(135deg,#232F3E,#3a5068)",
    label: "☁ Cloud Matrix",
    sublabel: "120+ builders · Oct 2025 · 24 hours",
    emoji: "☁",
    image: "/images/cloud_jam.jpg",
    description: "A beginner-friendly cloud computing session focused on cloud fundamentals, industry-recognized certifications, career opportunities, and structured learning roadmaps.",
  },
  {
    gradient: "linear-gradient(135deg,#0073BB,#005f9e)",
    label: "🤖 Cloud Matrix",
    sublabel: "Bedrock & LLMs · Feb 2026",
    emoji: "🤖",
    image: "/images/ai_workshop.jpg",
    description: "A beginner-friendly cloud computing session focused on cloud fundamentals, industry-recognized certifications, career opportunities, and structured learning roadmaps.",
  },
  {
    gradient: "linear-gradient(135deg,#FF9900,#E68900)",
    label: "🎤 Community Meetup",
    sublabel: "150+ members · Networking",
    emoji: "🎤",
    image: "/images/community_meetup.jpg",
    description: "A collaborative gathering where students, developers, and tech enthusiasts connected, shared knowledge, and built meaningful professional networks.",
  },
  {
    gradient: "linear-gradient(135deg,#1A222D,#232F3E)",
    label: "🎤 Community Meetup",
    sublabel: "100+ students certified",
    emoji: "🎤",
    image: "/images/bootcamp.jpg",
    description: "A collaborative gathering where students, developers, and tech enthusiasts connected, shared knowledge, and built meaningful professional networks.",
  },
  {
    gradient: "linear-gradient(135deg,#005f9e,#0073BB)",
    label: "💡 Cloud Matrix Event",
    sublabel: "re:Invent Watch Party",
    emoji: "💡",
    image: "/images/ai_workshop.jpg",
    description: "A beginner-friendly cloud computing session focused on cloud fundamentals, industry-recognized certifications, career opportunities, and structured learning roadmaps.",
  },
  {
    gradient: "linear-gradient(135deg,#232F3E,#1A222D)",
    label: "🤖 Robo Wolke",
    sublabel: "Robotics & IoT Showcase · Dobot Magician",
    emoji: "🤖",
    image: "/images/robo_wolke_journey.jpg",
    description: "An experimental robotics exhibition demonstrating the integration of cloud computing with physical hardware. The showcase highlighted controlling Dobot Magician robotic arms using AWS-backed cloud services.",
  },
];

/* ─── Stack layout constants ────────────────────────────────────────────── */
const CARD_H     = 500;   // card height px
const Y_STEP     = 14;    // vertical offset per depth level (stack peek)
const SCALE_STEP = 0.04;  // scale reduction per depth level
const AUTO_MS    = 2000;  // auto-advance interval (ms)
const N          = CARDS.length;

/* ─── Shared card face ──────────────────────────────────────────────────── */
function CardFace({
  card,
  index,
  total,
}: {
  card: (typeof CARDS)[0];
  index: number;
  total: number;
}) {
  return (
    <>
      {/* Gradients for text and badge contrast */}
      {card.image && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 55%, transparent 100%)",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "90px",
              background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.35) 0%, transparent 100%)",
              zIndex: 1,
            }}
          />
        </>
      )}
      
      {/* Dot-grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.1) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Watermark emoji */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-58%)",
          fontSize: 100,
          opacity: card.image ? 0.07 : 0.12,
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
          zIndex: 2,
        }}
      >
        {card.emoji}
      </div>

      {/* Counter badge — top right */}
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          background: "rgba(255,255,255,.18)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,.28)",
          borderRadius: 100,
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          zIndex: 5,
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "52px 28px 24px",
          background: card.image 
            ? "transparent" // scrim gradient handles this when image is present
            : "linear-gradient(to top, rgba(0,0,0,.72) 0%, transparent 100%)",
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {card.label}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,.76)",
            lineHeight: 1.45,
          }}
        >
          {card.sublabel}
        </div>
      </div>
    </>
  );
}

/* ─── Gallery ───────────────────────────────────────────────────────────── */
export default function Gallery() {
  /* order[0] = top card, order[N-1] = bottom card */
  const [order, setOrder] = useState<number[]>(() =>
    CARDS.map((_, i) => i)
  );
  const [flyingIdx, setFlyingIdx] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [paused, setPaused] = useState(false);

  /* ── Advance: top card flies up, deck rotates ─────────────────────── */
  const advance = useCallback(() => {
    if (isBusy) return;
    setIsBusy(true);

    const topCardIdx = order[0];
    setFlyingIdx(topCardIdx); // overlay takes over

    // Rotate deck instantly — layout spring handles reposition
    setOrder((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first]; // top card goes to bottom
    });

    // Flying card exits over ~500ms, then we're done
    setTimeout(() => {
      setFlyingIdx(null);
      setIsBusy(false);
    }, 520);
  }, [isBusy, order]);

  /* ── Auto-advance ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (paused) return;
    const t = setInterval(advance, AUTO_MS);
    return () => clearInterval(t);
  }, [advance, paused]);

  const currentTopCard = CARDS[order[0]];

  return (
    <section
      id="gallery"
      style={{
        width: "100vw",
        background: "#F8F9FB",
        padding: "80px 0 60px",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "100px",
      }}
    >
      {/* ── Page-width container ──────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 44px",
          boxSizing: "border-box",
        }}
      >
        {/* ── Two-column layout: deck LEFT, info RIGHT ─────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 64,
            alignItems: "flex-start",
          }}
        >
          {/* ── LEFT column: the card deck ───────────────────────────── */}
          <div
            style={{
              position: "relative",
              height: CARD_H + (N - 1) * Y_STEP + 20,
              cursor: isBusy ? "wait" : "pointer",
            }}
            onClick={advance}
          >
            {/* Stack cards — rendered back-to-front (bottom first) */}
            {[...order].reverse().map((cardIdx, revDepth) => {
              const depth = N - 1 - revDepth;
              const card = CARDS[cardIdx];
              const isTop = depth === 0;

              return (
                <motion.div
                  key={cardIdx}
                  layout
                  animate={{
                    y: depth * Y_STEP,
                    scale: 1 - depth * SCALE_STEP,
                    opacity:
                      isTop && flyingIdx === cardIdx
                        ? 0
                        : 1 - depth * 0.06,
                  }}
                  transition={{
                    layout: { type: "spring", stiffness: 260, damping: 28 },
                    opacity: { duration: 0.05 },
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: CARD_H,
                    borderRadius: 24,
                    overflow: "hidden",
                    background: card.gradient,
                    zIndex: N - depth,
                    transformOrigin: "top center",
                    boxShadow: isTop
                      ? "0 24px 56px rgba(15,23,42,0.14)"
                      : "0 8px 24px rgba(15,23,42,0.07)",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {/* Photo background for stack depth */}
                  {card.image && (
                    <img
                      src={card.image}
                      alt={card.label}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        zIndex: 0,
                        opacity: isTop ? 1 : 0.75,
                      }}
                    />
                  )}
                  {/* Dimming shadow for cards deeper in stack */}
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
                  {isTop && <CardFace card={card} index={cardIdx} total={N} />}
                </motion.div>
              );
            })}

            {/* Flying card overlay — exits upward */}
            <AnimatePresence>
              {flyingIdx !== null && (
                <motion.div
                  key="flying"
                  initial={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
                  animate={{
                    y: -CARD_H * 1.4,
                    scale: 0.82,
                    opacity: 0,
                    rotateX: -20,
                  }}
                  exit={{}}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: CARD_H,
                    borderRadius: 24,
                    overflow: "hidden",
                    background: CARDS[flyingIdx].gradient,
                    zIndex: N + 10,
                    pointerEvents: "none",
                    transformOrigin: "top center",
                    boxShadow: "0 24px 56px rgba(15,23,42,0.18)",
                  }}
                >
                  {CARDS[flyingIdx].image && (
                    <img
                      src={CARDS[flyingIdx].image}
                      alt={CARDS[flyingIdx].label}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        zIndex: 0,
                      }}
                    />
                  )}
                  <CardFace
                    card={CARDS[flyingIdx]}
                    index={flyingIdx}
                    total={N}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click hint */}
            <motion.div
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: -36,
                left: "50%",
                translateX: "-50%",
                fontSize: 12,
                fontWeight: 600,
                color: "#9ca3af",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                letterSpacing: "0.03em",
              }}
            >
              Click deck to advance →
            </motion.div>
          </div>

          {/* ── RIGHT column: heading + active card info ───────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {/* Section heading (Static) */}
            <div>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  fontWeight: 900,
                  color: "#1e2d3d",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.01em",
                }}
              >
                Highlights From Our Builder Journey
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#4b5563",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Highlights from hackathons, meetups, bootcamps and showcases.
              </p>
            </div>

            {/* Subtle separator line */}
            <div style={{ height: "1px", background: "rgba(30, 45, 61, 0.08)", width: "100%" }} />

            <motion.div
              key={order[0]}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#1e2d3d",
                    marginBottom: 8,
                    lineHeight: 1.3,
                  }}
                >
                  {currentTopCard.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#FF9900",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 16,
                  }}
                >
                  {currentTopCard.sublabel}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: "#4b5563",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {currentTopCard.description}
                </p>
              </div>

              {/* Dot progress indicators */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {CARDS.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: order[0] === i ? 24 : 8,
                      backgroundColor:
                        order[0] === i ? "#232F3E" : "rgba(35,47,62,.18)",
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ height: 8, borderRadius: 100, cursor: "pointer" }}
                    onClick={() => {
                      if (isBusy) return;
                      const steps = (order.indexOf(i) + N) % N;
                      if (steps === 0) return;
                      // Step advance until the clicked card is on top
                      let count = 0;
                      const tick = () => {
                        if (count >= steps) return;
                        count++;
                        advance();
                        if (count < steps) setTimeout(tick, AUTO_MS * 0.18);
                      };
                      tick();
                    }}
                  />
                ))}
              </div>

              {/* Pause / Play */}
              <motion.button
                onClick={() => setPaused((p) => !p)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 100,
                  border: "1.5px solid rgba(35,47,62,.15)",
                  background: "rgba(255,255,255,.9)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#232F3E",
                  outline: "none",
                }}
              >
                {paused ? "▶ Play" : "⏸ Pause"}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
