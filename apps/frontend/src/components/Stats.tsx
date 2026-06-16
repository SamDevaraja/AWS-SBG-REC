"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS_DATA = [
  { val: 500, suffix: "+", label: "Students" },
  { val: 50, suffix: "+", label: "Events" },
  { val: 100, suffix: "+", label: "Certs" },
  { val: 8, suffix: "", label: "Domains" }
];

function CountUpNumber({ val, inView }: { val: number; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500; // total animation duration in ms
    const steps = 50;
    const stepValue = val / steps;
    const intervalTime = duration / steps;
    
    const timer = setInterval(() => {
      start += stepValue;
      if (start >= val) {
        setCount(val);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [inView, val]);

  return <>{count}</>;
}

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.section
      ref={ref}
      initial={{ y: 40, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        width: "100vw",
        height: "100px",
        background: "linear-gradient(90deg, #FF9900 0%, #FFB020 35%, #FF9900 65%, #E68900 100%)",
        backgroundSize: "200% 200%",
        animation: "gradShift 6s ease infinite",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          padding: "0 44px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          alignItems: "center",
        }}
      >
        {STATS_DATA.map((stat, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              height: "100%",
              width: "100%",
            }}
          >
            {/* Stat Item */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(20px, 3.2vw, 32px)",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  lineHeight: 1,
                  fontFamily: "inherit",
                }}
              >
                <CountUpNumber val={stat.val} inView={inView} />
                {stat.suffix}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.88)",
                  fontWeight: 700,
                  marginTop: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </div>
            </motion.div>

            {/* Vertical Divider (only between elements) */}
            {idx < STATS_DATA.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  height: "36px",
                  width: "1px",
                  background: "rgba(255, 255, 255, 0.35)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
