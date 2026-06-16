"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NodeData {
  id: string;
  name: string;
  short: string;
  details: string;
  color: string;
  ring: "inner" | "middle" | "outer";
  /** starting angle in degrees */
  startAngle: number;
  icon: React.ReactNode;
}

// ─── Tooltip (rendered outside the orbit so it is never clipped) ─────────────
const Tooltip = memo(
  ({
    node,
    x,
    y,
    nodeSize,
    tooltipW,
    tooltipH,
    containerSize,
    direction,
  }: {
    node: NodeData;
    x: any; // MotionValue<number>
    y: any;
    nodeSize: number;
    tooltipW: number;
    tooltipH: number;
    containerSize: number;
    direction: "top" | "bottom" | "left" | "right";
  }) => {
    const offsetX = direction === "right" ? nodeSize / 2 + 8 : direction === "left" ? -(nodeSize / 2 + 8) : 0;
    const offsetY = direction === "bottom" ? nodeSize / 2 + 8 : direction === "top" ? -(nodeSize / 2 + 8) : 0;
    const tx = direction === "right" ? "0%" : direction === "left" ? "-100%" : "-50%";
    const ty = direction === "bottom" ? "0%" : direction === "top" ? "-100%" : "-50%";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          width: `${tooltipW}px`,
          pointerEvents: "none",
          zIndex: 15,
          left: x,
          top: y,
          x: `calc(${tx} + ${offsetX}px)`,
          y: `calc(${ty} + ${offsetY}px)`,
        }}
      >
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px solid rgba(35,47,62,0.09)",
          borderRadius: "13px",
          boxShadow:
            "0 12px 36px rgba(35,47,62,0.10), 0 2px 8px rgba(0,115,187,0.06), 0 0 0 1px rgba(255,153,0,0.06), 0 0 20px rgba(255,153,0,0.03)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#232F3E",
            marginBottom: "4px",
            whiteSpace: "nowrap",
          }}
        >
          {node.name}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#5c6b73",
            lineHeight: 1.4,
          }}
        >
          {node.details}
        </div>
      </div>
    </motion.div>
    );
  }
);
Tooltip.displayName = "Tooltip";

// ─── Individual orbit node (icon only) ───────────────────────────────────────
const OrbitNode = memo(
  ({
    node,
    x,
    y,
    nodeSize,
    isHovered,
    onEnter,
    onLeave,
  }: {
    node: NodeData;
    x: any;
    y: any;
    nodeSize: number;
    isHovered: boolean;
    onEnter: () => void;
    onLeave: () => void;
  }) => (
    <motion.div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translateX: "-50%",
        translateY: "-50%",
        zIndex: isHovered ? 18 : 10,
        // critical: GPU-accelerated, no layout recalc
        willChange: "transform",
      }}
    >
      {/* Invisible 72 px hover pad prevents flicker when mouse drifts */}
      <div
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          width: 72,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <motion.div
          animate={{ scale: isHovered ? 1.18 : 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
          style={{
            width: nodeSize,
            height: nodeSize,
            borderRadius: 14,
            background: "#FFFFFF",
            border: isHovered
              ? `2px solid ${node.color}`
              : "1px solid rgba(0,0,0,.06)",
            boxShadow: isHovered
              ? `0 8px 24px ${node.color}33`
              : "0 4px 16px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isHovered ? node.color : "#232F3E",
            transition: "border 0.25s, box-shadow 0.25s, color 0.25s",
          }}
        >
          {node.icon}
        </motion.div>
      </div>
    </motion.div>
  )
);
OrbitNode.displayName = "OrbitNode";

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Degrees → radians */
const d2r = (d: number) => (d * Math.PI) / 180;

/**
 * Given a ring radius and a square container of `size`px, return the
 * largest radius that keeps a `pad`px bounding box fully inside.
 */
function clampRadius(desired: number, containerSize: number, pad: number) {
  const max = containerSize / 2 - pad;
  return Math.min(desired, Math.max(0, max));
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CloudOrbit() {
  // ── State ──
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  // We need to track tooltip "above / below" per node without causing re-renders
  // every frame, so we only setState when the value actually flips.
  const [tooltipDir, setTooltipDir] = useState<("top"|"bottom"|"left"|"right")[]>(
    new Array(10).fill("top")
  );
  const tooltipDirRef = useRef<("top"|"bottom"|"left"|"right")[]>(new Array(10).fill("top"));

  // Ref mirror of hovered id so the animation frame reads it without stale closures
  const hoveredIdRef = useRef<string | null>(null);

  // Tracked angle accumulators (degrees) — updated each frame
  const anglesRef = useRef<number[]>([0, 90, 180, 270, 45, 165, 285, 105, 225, 345]);

  // ── Resize ──
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setScreenSize(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Derived geometry ──
  const { containerSize, centerR, nodeSize, radii, tooltipW } = useMemo(() => {
    const isMobile = screenSize === "mobile";
    const isTablet = screenSize === "tablet";

    const containerSize = isMobile ? 320 : isTablet ? 430 : 560;
    const centerR = isMobile ? 42 : isTablet ? 48 : 55;
    const nodeSize = isMobile ? 36 : isTablet ? 40 : 46;
    const tooltipW = isMobile ? 130 : 182;

    // Half-width of the largest element placed on each ring
    // (tooltip is wider than the node icon)
    const tooltipHalfW = tooltipW / 2 + 6; // small extra margin
    const nodeHalfW = nodeSize / 2 + 6;

    // Scaled down radii to keep the globe compact and avoid viewport cutoff
    const radii = {
      inner: isMobile ? 90 : isTablet ? 108 : 118,
      middle: isMobile ? 135 : isTablet ? 158 : 172,
      outer: isMobile ? 180 : isTablet ? 210 : 228,
    };

    return { containerSize, centerR, nodeSize, radii, tooltipW };
  }, [screenSize]);

  const cx = containerSize / 2;
  const cy = containerSize / 2;

  // ── Node definitions (static — memoised with empty dep array) ──
  const nodes: NodeData[] = useMemo(
    () => [
      // Outer ring — 4 nodes, 90° apart
      {
        id: "learning",
        name: "Hands-On Learning",
        short: "Learning",
        details: "Real AWS services. Real cloud experience.",
        color: "#0073BB",
        ring: "outer",
        startAngle: 0,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#0073BB" />
            <path d="M6 10v6c0 2 3 3 6 3s6-1 6-3v-6" stroke="#FF9900" />
            <path d="M22 7v10" stroke="#232F3E" />
          </svg>
        ),
      },
      {
        id: "projects",
        name: "Build Projects",
        short: "Projects",
        details: "Create applications that solve real problems.",
        color: "#FF9900",
        ring: "outer",
        startAngle: 90,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" stroke="#FF9900" />
            <path d="M12 2C7.5 2 4.5 5.5 4.5 10.5c0 1.5.5 3 1.5 4l8-8c-1-1-2.5-1.5-4-1.5z" stroke="#0073BB" />
            <path d="M22 2s-3.5 1-6.5 4l-4 4 8 8 4-6.5c3-3 6.5-6.5 6.5-6.5z" stroke="#0073BB" />
            <circle cx="16" cy="8" r="1.5" stroke="#FF9900" />
          </svg>
        ),
      },
      {
        id: "certifications",
        name: "Certifications",
        short: "Certs",
        details: "Prepare for AWS certifications with peers.",
        color: "#FF9900",
        ring: "outer",
        startAngle: 180,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" stroke="#0073BB" />
            <path d="M8.5 13.5L6 22l6-3 6 3-2.5-8.5" stroke="#FF9900" />
          </svg>
        ),
      },
      {
        id: "community",
        name: "Community",
        short: "Community",
        details: "Connect with builders, mentors, and innovators.",
        color: "#232F3E",
        ring: "outer",
        startAngle: 270,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#0073BB" />
            <circle cx="9" cy="7" r="4" stroke="#FF9900" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#232F3E" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#232F3E" />
          </svg>
        ),
      },
      // Middle ring — 3 nodes, 120° apart, offset 45° from outer
      {
        id: "networking",
        name: "Networking",
        short: "Network",
        details: "Connect with peers, builders, and cloud professionals.",
        color: "#0073BB",
        ring: "middle",
        startAngle: 45,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" stroke="#0073BB" />
            <circle cx="5" cy="5" r="2.5" stroke="#FF9900" />
            <circle cx="19" cy="5" r="2.5" stroke="#FF9900" />
            <circle cx="5" cy="19" r="2.5" stroke="#232F3E" />
            <circle cx="19" cy="19" r="2.5" stroke="#232F3E" />
            <line x1="7.3" y1="7.3" x2="9.8" y2="9.8" stroke="#232F3E" />
            <line x1="16.7" y1="7.3" x2="14.2" y2="9.8" stroke="#232F3E" />
            <line x1="7.3" y1="16.7" x2="9.8" y2="14.2" stroke="#232F3E" />
            <line x1="16.7" y1="16.7" x2="14.2" y2="14.2" stroke="#232F3E" />
          </svg>
        ),
      },
      {
        id: "mentorship",
        name: "Mentorship",
        short: "Mentors",
        details: "Learn from experienced mentors and industry experts.",
        color: "#FF9900",
        ring: "middle",
        startAngle: 165,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#0073BB" />
            <circle cx="8" cy="7" r="4" stroke="#232F3E" />
            <path d="M16 11l2 2 4-4" stroke="#FF9900" />
          </svg>
        ),
      },
      {
        id: "exposure",
        name: "Industry Exposure",
        short: "Exposure",
        details: "Gain insights into real-world cloud technologies and careers.",
        color: "#232F3E",
        ring: "middle",
        startAngle: 285,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" stroke="#0073BB" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="#FF9900" />
          </svg>
        ),
      },
      // Inner ring — 3 nodes, 120° apart, offset 60° from middle
      {
        id: "events",
        name: "Events & Workshops",
        short: "Events",
        details: "Learn directly from industry experts.",
        color: "#0073BB",
        ring: "inner",
        startAngle: 105,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" stroke="#0073BB" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke="#FF9900" />
            <line x1="12" y1="19" x2="12" y2="22" stroke="#232F3E" />
          </svg>
        ),
      },
      {
        id: "hackathons",
        name: "Hackathons",
        short: "Hackathons",
        details: "Compete, innovate, and showcase your skills.",
        color: "#FF9900",
        ring: "inner",
        startAngle: 225,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" stroke="#FF9900" />
            <line x1="9" y1="18" x2="15" y2="18" stroke="#0073BB" />
            <line x1="10" y1="22" x2="14" y2="22" stroke="#0073BB" />
          </svg>
        ),
      },
      {
        id: "speakers",
        name: "Speaker Sessions",
        short: "Speakers",
        details: "Interact with industry leaders and AWS professionals.",
        color: "#FF9900",
        ring: "inner",
        startAngle: 345,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="12" rx="2" stroke="#0073BB" />
            <path d="M12 15v4" stroke="#FF9900" />
            <path d="M9 21h6" stroke="#FF9900" />
            <path d="M7 10l3-3 3 3 4-4" stroke="#232F3E" />
          </svg>
        ),
      },
    ],
    [] // static — never changes
  );

  // ── MotionValues for each node (10 total) ──
  // We declare them individually so the number of hooks is constant.
  const mv = [
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
    [useMotionValue(cx), useMotionValue(cy)],
  ];

  // ── Rotation speeds (deg/ms) ──
  // Outer: slow CW, Middle: moderate CCW, Inner: fast CW
  const SPEEDS: Record<NodeData["ring"], number> = useMemo(
    () => ({ outer: 0.006, middle: -0.0085, inner: 0.011 }),
    []
  );

  // ── Animation loop ──
  useAnimationFrame((_t, delta) => {
    const dt = Math.min(delta, 80); // cap to avoid jumps after tab switch
    const hovered = hoveredIdRef.current;

    const nextDir = [...tooltipDirRef.current];
    let dirChanged = false;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const isH = node.id === hovered;

      if (!hovered) {
        anglesRef.current[i] =
          (anglesRef.current[i] + SPEEDS[node.ring] * dt + 360) % 360;
      }

      const R = radii[node.ring];
      const rad = d2r(anglesRef.current[i]);
      const nx = cx + R * Math.cos(rad);
      const ny = cy + R * Math.sin(rad);

      mv[i][0].set(nx);
      mv[i][1].set(ny);

      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      let dir: "top" | "bottom" | "left" | "right";

      if (node.ring === "inner") {
        if (Math.abs(cos) > Math.abs(sin)) {
          dir = cos > 0 ? "right" : "left";
        } else {
          dir = sin > 0 ? "bottom" : "top";
        }
      } else {
        // Prevent horizontal cutoff at screen edges for outer nodes by stacking tooltips vertically.
        // Middle/Outer rings are far enough from the center that vertical tooltips won't overlap the hub.
        dir = sin > 0 ? "bottom" : "top";
        // Prevent vertical cutoff when the node is near the extreme top or bottom edge.
        // If ny is too close to 0, tooltip "top" bleeds out. Flip it inward to "bottom".
        if (dir === "top" && ny < 120) {
          dir = "bottom";
        }
        // If ny is too close to containerSize, tooltip "bottom" bleeds out. Flip to "top".
        if (dir === "bottom" && ny > containerSize - 120) {
          dir = "top";
        }
      }

      if (nextDir[i] !== dir) {
        nextDir[i] = dir;
        dirChanged = true;
      }
    }

    if (dirChanged) {
      tooltipDirRef.current = nextDir;
      setTooltipDir([...nextDir]);
    }
  });

  // ── Hover handlers ──
  const handleEnter = useCallback(
    (node: NodeData) => {
      setHoveredId(node.id);
      hoveredIdRef.current = node.id;
    },
    []
  );
  const handleLeave = useCallback(() => {
    setHoveredId(null);
    hoveredIdRef.current = null;
  }, []);

  // ── Render ──
  return (
    <div
      style={{
        position: "relative",
        width: containerSize,
        height: containerSize,
        flexShrink: 0,
        display: "block",
      }}
    >
      {/* ── Orbit rings (pure CSS rotation — visual only) ── */}
      {(["inner", "middle", "outer"] as const).map((ring) => {
        const r = radii[ring];
        const dur = ring === "inner" ? "28s" : ring === "middle" ? "40s" : "55s";
        return (
          <React.Fragment key={ring}>
            {/* Main ring */}
            <div
              style={{
                position: "absolute",
                width: r * 2,
                height: r * 2,
                left: cx - r,
                top: cy - r,
                borderRadius: "50%",
                border: "1.5px solid rgba(200,210,220,.4)",
                background: "transparent",
                pointerEvents: "none",
                animation: `spinSlow ${dur} linear infinite`,
                animationPlayState: hoveredId ? "paused" : "running",
                zIndex: 5,
              }}
            />
          </React.Fragment>
        );
      })}

      {/* ── Orbit Area Background (Frosted Glass White) ── */}
      <div
        style={{
          position: "absolute",
          width: radii.outer * 2 + 80,
          height: radii.outer * 2 + 80,
          left: cx - radii.outer - 40,
          top: cy - radii.outer - 40,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(255,255,255,.95) 0%, rgba(240,244,248,.7) 35%, rgba(255,255,255,0) 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Center hub ── */}
      <div
        style={{
          position: "absolute",
          width: centerR * 2,
          height: centerR * 2,
          left: cx - centerR,
          top: cy - centerR,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,.15) inset, 0 8px 32px rgba(0,0,0,.18)",
          border: "2px solid rgba(255,255,255,0.18)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
          zIndex: 20,
          isolation: "isolate",
          padding: 6,
        }}
      >
        <AnimatePresence mode="wait">
          {hoveredId ? (
            (() => {
              const h = nodes.find((n) => n.id === hoveredId)!;
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                  <span style={{ color: h.color, display: "flex" }}>{h.icon}</span>
                  <span
                    style={{
                      fontSize: screenSize === "mobile" ? 8 : 10,
                      fontWeight: 800,
                      marginTop: 2,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {h.short}
                  </span>
                </motion.div>
              );
            })()
          ) : (
            <motion.img
              key="hub-logo"
              src="/sbg-logo-latest.png"
              alt="AWS SBG REC Logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── SVG connector lines ── */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
          zIndex: 2,
        }}
      >
        {nodes.map((node, i) => {
          const isH = node.id === hoveredId;
          return (
            <motion.line
              key={node.id}
              x1={cx}
              y1={cy}
              x2={mv[i][0]}
              y2={mv[i][1]}
              stroke={isH ? "rgba(255,153,0,0.45)" : "rgba(0,0,0,.08)"}
              strokeWidth={isH ? 2.5 : 1}
              strokeDasharray={isH ? "none" : "4 4"}
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
            />
          );
        })}
      </svg>

      {/* ── Orbit nodes ── */}
      {nodes.map((node, i) => (
        <OrbitNode
          key={node.id}
          node={node}
          x={mv[i][0]}
          y={mv[i][1]}
          nodeSize={nodeSize}
          isHovered={node.id === hoveredId}
          onEnter={() => handleEnter(node)}
          onLeave={handleLeave}
        />
      ))}

      {/* ── Tooltips (rendered last so they are always on top of nodes, but under center node) ── */}
      {nodes.map((node, i) =>
        node.id === hoveredId ? (
          <AnimatePresence key={node.id}>
            <Tooltip
              node={node}
              x={mv[i][0]}
              y={mv[i][1]}
              nodeSize={nodeSize}
              tooltipW={tooltipW}
              tooltipH={72}
              containerSize={containerSize}
              direction={tooltipDir[i]}
            />
          </AnimatePresence>
        ) : null
      )}
    </div>
  );
}
