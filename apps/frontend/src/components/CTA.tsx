"use client";
import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });

  // Magnetic Button state
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 20 });
  const sy = useSpring(my, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="community"
      ref={containerRef}
      style={{
        width: "100vw",
        background: "linear-gradient(135deg, #1e2d3d 0%, #243448 40%, #162032 100%)",
        backgroundSize: "200% 200%",
        animation: "bgShift 8s ease infinite",
        padding: "60px 0",
        position: "relative",
        overflow: "hidden",
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
          transformOrigin: "left",
          zIndex: 10,
        }}
      />

      {/* Decorative Blob */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 153, 0, 0.08) 0%, transparent 70%)",
          animation: "blob 14s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          margin: "0 auto",
          padding: "0 44px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* LIVE NOW Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "100px",
            padding: "6px 16px",
            marginBottom: "22px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "30%",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
              animation: "scanLine 3s ease infinite",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981", // green pulsing dot
              animation: "pulseDot 2s infinite",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.85)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Live Now
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            fontSize: "clamp(2rem, 4.2vw, 2.8rem)",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          Ready to start your{" "}
          <span style={{ color: "#FF9900" }}>cloud journey?</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.18, duration: 0.5 }}
          style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.65)",
            lineHeight: 1.8,
            marginBottom: "40px",
            maxWidth: "440px",
          }}
        >
          Join AWS Student Builders Group REC. Connect with mentors, build real applications, and launch your cloud career.
        </motion.p>

        {/* Buttons (Bounce-in entrance) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: [0.8, 1.06, 1] } : {}}
          transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.25 }}
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {/* Magnetic primary button */}
          <motion.button
            onClick={() => router.push("/signup")}
            style={{ x: sx, y: sy, border: "none", background: "transparent", padding: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.96 }}
          >
            <span
              style={{
                display: "block",
                padding: "14px 32px",
                borderRadius: "100px",
                background: "#ffffff",
                color: "#1e2d3d",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                transition: "background 0.2s ease",
              }}
            >
              Join AWS SBG REC →
            </span>
          </motion.button>

          {/* Secondary Button */}
          <motion.a
            href="#gallery"
            whileHover={{ background: "rgba(255, 255, 255, 0.08)", y: -2 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: "14px 32px",
              borderRadius: "100px",
              border: "1.5px solid rgba(255, 255, 255, 0.25)",
              background: "transparent",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              transition: "all 0.2s ease",
            }}
          >
            Explore Gallery ↓
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
