"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Play } from "lucide-react";

const FRAME_COUNT = 182;

const DecorativeGrid = ({ 
  rows, 
  cols, 
  dotColor = "#cbd5e1", 
  activeDot, 
  activeColor = "#FF9900", 
  style 
}: { 
  rows: number; 
  cols: number; 
  dotColor?: string; 
  activeDot?: { r: number; c: number }; 
  activeColor?: string; 
  style?: React.CSSProperties;
}) => {
  return (
    <div style={{ position: "absolute", pointerEvents: "none", zIndex: 1, ...style }}>
      <svg 
        width={cols * 16} 
        height={rows * 16} 
        viewBox={`0 0 ${cols * 16} ${rows * 16}`}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const isActive = activeDot && activeDot.r === r && activeDot.c === c;
            return (
              <circle
                key={`${r}-${c}`}
                cx={8 + c * 16}
                cy={8 + r * 16}
                r="1.5"
                fill={isActive ? activeColor : dotColor}
                opacity={isActive ? 0.75 : 0.28}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportHeightRef = useRef(800);

  // Check mobile viewport size, width, and height
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setWindowWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      viewportHeightRef.current = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload the 182 WebP frames
  useEffect(() => {
    if (isMobile) {
      setLoading(false);
      return;
    }

    const loadedImages: HTMLImageElement[] = [];
    let count = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/assets/hero-sequence/${i}.webp`;
      
      const handleImageLoad = () => {
        count++;
        setLoadedCount(count);
        if (count === FRAME_COUNT) {
          setImages(loadedImages);
          setLoading(false);
        }
      };

      img.onload = handleImageLoad;
      img.onerror = handleImageLoad; // Count failures to avoid blocking the UI
      loadedImages.push(img);
    }
  }, [isMobile]);

  // Framer Motion scroll hooks mapping scroll progress to frame index
  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 500,
    damping: 42,
    mass: 0.03,
    restDelta: 0.001
  });

  // Scrub the full frame sequence from start to end of the home section scroll range (0% to 40% progress of the container)
  const frameIndex = useTransform(smoothScroll, [0, 0.4], [0, FRAME_COUNT - 1]);

  // Translate the fixed container up exactly as the user scrolls past the home section (from 200vh to 300vh)
  // this acts as a 100% accurate simulation of sticky positioning, pushing the Hero section out
  // of the screen to reveal the About Us section scrolling in sync below.
  // We use dynamic scroll mapping functions with mutable ref values to support varying viewport heights correctly.
  const y = useTransform(scrollY, (latestScrollY) => {
    const currentHeight = viewportHeightRef.current;
    const startScroll = currentHeight * 2.0;
    const endScroll = currentHeight * 3.0;
    if (latestScrollY <= startScroll) {
      return 0;
    }
    if (latestScrollY >= endScroll) {
      return -currentHeight;
    }
    return -(latestScrollY - startScroll);
  });
  
  // Fade out the fixed container and disable pointer events at the very end of the scroll-up transition for high GPU performance
  const opacity = useTransform(scrollY, (latestScrollY) => {
    const currentHeight = viewportHeightRef.current;
    const fadeStart = currentHeight * 2.9;
    const fadeEnd = currentHeight * 3.0;
    if (latestScrollY <= fadeStart) {
      return 1;
    }
    if (latestScrollY >= fadeEnd) {
      return 0;
    }
    const progress = (latestScrollY - fadeStart) / (currentHeight * 0.1);
    return 1 - progress;
  });

  const pointerEvents = useTransform(scrollY, (v) => {
    const currentHeight = viewportHeightRef.current;
    return v >= currentHeight * 3.0 ? "none" as const : "auto" as const;
  });


  // Paint single frame onto canvas with cropping (removing black pillars) and responsive right-alignment
  const renderFrame = useCallback((index: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const validIndex = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(index)));
    const img = images[validIndex];
    if (img && img.complete) {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // The extracted frames have black pillars on the left and right sides.
      // We crop 10px further in (sx = 110, sw = 1060) to avoid bilinear texture filtering bleed (Cols 99 and 1180).
      const sx = 110;
      const sy = 0;
      const sw = 1060;
      const sh = 720;
      
      const cropRatio = sw / sh; // ~1.472
      
      // Fit to 98% of viewport height by default (zoomed in to fill space), and constrain to 78% of viewport width
      let drawHeight = canvasHeight * 0.98;
      let drawWidth = drawHeight * cropRatio;
      
      const maxDrawWidth = canvasWidth * 0.78;
      if (drawWidth > maxDrawWidth) {
        drawWidth = maxDrawWidth;
        drawHeight = drawWidth / cropRatio;
      }
      
      // Align to exact integer boundaries and shift slightly to the right to move the overall animation rightward
      const roundedOffsetX = Math.round(canvasWidth - drawWidth + (canvasWidth > 1200 ? 110 : 70));
      // Center vertically but enforce a minimum of 85px top offset to ensure the top of the globe/illustration is fully visible under the 80px fixed navbar
      const roundedOffsetY = Math.max(85, Math.round((canvasHeight - drawHeight) / 2));
      const roundedDrawWidth = Math.round(drawWidth);
      const roundedDrawHeight = Math.round(drawHeight);
      
      // Clear the canvas to white to blend seamlessly with the page
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctx.drawImage(img, sx, sy, sw, sh, roundedOffsetX, roundedOffsetY, roundedDrawWidth, roundedDrawHeight);

      // Draw a white border around the image bounds to cover any bilinear edge seams or texture bleed lines
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.strokeRect(roundedOffsetX, roundedOffsetY, roundedDrawWidth, roundedDrawHeight);
    }
  }, [images]);

  // Canvas drawing effect triggered on resize and scroll index updates
  useEffect(() => {
    if (loading || isMobile || images.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const handleCanvasResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      renderFrame(frameIndex.get(), ctx, canvas);
    };
    
    handleCanvasResize();
    window.addEventListener("resize", handleCanvasResize);
    
    const unsubscribe = frameIndex.on("change", (latest) => {
      requestAnimationFrame(() => {
        renderFrame(latest, ctx, canvas);
      });
    });
    
    return () => {
      window.removeEventListener("resize", handleCanvasResize);
      unsubscribe();
    };
  }, [loading, isMobile, images, frameIndex, renderFrame]);

  // Render a clean loading progress screen while caching frames on desktop
  if (loading && !isMobile) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#05111f",
          color: "#ffffff",
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          gap: "20px",
        }}
      >
        <div style={{ position: "relative", width: "80px", height: "80px" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "3px solid rgba(255, 153, 0, 0.1)",
              borderTopColor: "#FF9900",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 6px 0", fontWeight: 700, fontSize: "16px", color: "#E2E8F0" }}>
            Assembling Cloud Environment...
          </h3>
          <span style={{ fontSize: "14px", color: "#FF9900", fontWeight: 800 }}>
            {Math.round((loadedCount / FRAME_COUNT) * 100)}%
          </span>
        </div>
      </div>
    );
  }

  // Mobile Fallback: Standard layout with grid background
  if (isMobile) {
    return (
      <section
        id="home"
        style={{
          width: "100vw",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          position: "relative",
          overflow: "hidden",
          padding: "100px 16px 60px",
          zIndex: 2,
        }}
      >
        {/* Premium Gradient Blobs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "15%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 115, 187, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 153, 0, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Main Container */}
        <div
          style={{
            width: "100%",
            maxWidth: "1340px",
            margin: "0 auto",
            height: "auto",
            position: "relative",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Centered Content */}
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              zIndex: 20,
            }}
          >
            {/* Main Title */}
            <h1
              style={{
                fontSize: "36px",
                lineHeight: 1.15,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.01em",
                marginBottom: "16px",
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Build Your Cloud Future
              <br />
              With <span style={{ color: "#FF9900", fontWeight: 800 }}>AWS SBG REC</span>
            </h1>

            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: "#475569",
                fontWeight: 500,
                marginBottom: "32px",
                maxWidth: "680px",
                margin: "0 auto 32px auto",
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Learn cloud computing through structured roadmaps,<br /> industry-recognized certifications, hands-on projects,<br /> workshops, and a thriving builder community.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
                width: "100%",
              }}
            >
              {/* Join Community slanted orange button */}
              <button
                style={{
                  width: "100%",
                  padding: "16px 36px",
                  background: "#FF9900",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "18px",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  borderRadius: "12px",
                  boxShadow: "none",
                  outline: "none",
                }}
              >
                <span>Join Community</span>
              </button>

              {/* Explore Roadmap button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#0F172A",
                  fontSize: "18px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "10px 16px",
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  outline: "none",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "2px solid #FF9900",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FF9900",
                    backgroundColor: "rgba(255, 153, 0, 0.03)",
                  }}
                >
                  <Play size={18} fill="#FF9900" style={{ marginLeft: "4px" }} />
                </div>
                Explore Roadmap
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Desktop View: Scroll-Driven canvas frame scrubbing
  return (
    <div
      id="home"
      ref={containerRef}
      style={{
        position: "relative",
        height: "300vh", // scrolling track
        width: "100%",
      }}
    >
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#ffffff", // Solid white background to serve as the backdrop for multiply blending
          opacity,
          y,
          pointerEvents,
          zIndex: 5,
        }}
      >
        {/* Top Right Circuit Graphic - Positioned under the navbar Join Us button */}
        <div 
          style={{ 
            position: "absolute",
            top: "80px", 
            right: 0,
            width: "240px",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <svg 
            viewBox="0 0 240 70" 
            width="100%" 
            height="auto" 
            style={{ 
              opacity: 0.95,
              display: "block"
            }}
          >
            {/* Circuit Line */}
            <path 
              d="M 100 20 L 125 40 L 165 40 L 190 20 L 240 20" 
              stroke="#475569" 
              strokeWidth="1.0"
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none" 
            />

            {/* Floating Cloud Outline */}
            <path 
              d="M 180 50 a 6 6 0 0 1 3 -11 a 9 9 0 0 1 15 -3 a 6 6 0 0 1 9 5 a 5 5 0 0 1 1 9 z" 
              stroke="#cbd5e1" 
              strokeWidth="1.0" 
              fill="#ffffff" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Starting Terminal Dot */}
            <circle cx="100" cy="20" r="1.8" fill="#0f172a" />

            {/* Node (Orange Diamond) */}
            <rect x="142" y="37" width="6" height="6" transform="rotate(45 145 40)" fill="#FF9900" stroke="#475569" strokeWidth="1.0" rx="1" />
            <circle cx="145" cy="40" r="1.0" fill="#ffffff" />
          </svg>
        </div>

        {/* Radial-Masked Grid Background Pattern inside the same stacking context */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(15, 23, 42, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Decorative Grid Ornaments */}
        <DecorativeGrid rows={3} cols={5} activeDot={{ r: 0, c: 3 }} style={{ top: "14vh", left: "6%" }} />
        <DecorativeGrid rows={6} cols={3} dotColor="#FF9900" style={{ top: "48vh", left: "3%" }} />
        <DecorativeGrid rows={4} cols={4} activeDot={{ r: 2, c: 1 }} style={{ top: "16vh", right: "26%" }} />
        <DecorativeGrid rows={5} cols={3} dotColor="#FF9900" style={{ top: "52vh", right: "4%" }} />
        <DecorativeGrid rows={3} cols={6} style={{ bottom: "24vh", left: "8%" }} />
        {/* Center Blank Space Fillers */}
        <DecorativeGrid rows={5} cols={3} dotColor="#FF9900" style={{ top: "40vh", left: "46%" }} />

        {/* Canvas Background Frame Playback */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            pointerEvents: "none",
            mixBlendMode: "multiply", // Blends frame white background with the grid pattern underneath
          }}
        />

        {/* Content Overlay */}
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 10,
            display: "flex",
            justifyContent: "flex-start", // Left-aligned layout horizontally
            alignItems: "center",         // Centered vertically
          }}
        >
          {/* Left half container to center the text column in the left 50% of the screen */}
          <div
            style={{
              width: "50%",
              height: "100%", // Fill the full height of the parent Overlay container
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // Vertically center the text content wrapper
              alignItems: "center",     // Horizontally center the text content wrapper
              paddingLeft: "40px",
              paddingRight: "20px",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            {/* Left-Aligned Content Wrapper */}
            <div
              style={{
                width: "100%",
                maxWidth: windowWidth > 1280 ? "560px" : windowWidth > 1100 ? "480px" : "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",    // Left-aligned items
                textAlign: "left",           // Left-aligned text
                zIndex: 20,
              }}
            >
            {/* Main Title */}
            <h1
              style={{
                fontSize: "clamp(36px, 4.0vw, 54px)",
                lineHeight: 1.15,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.015em",
                marginBottom: "20px",
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                textShadow: "0 2px 20px rgba(255, 255, 255, 0.85)",
              }}
            >
              Build Your
              <br />
              Cloud Future
              <br />
              With <span style={{ color: "#FF9900", fontWeight: 800 }}>AWS SBG REC</span>
            </h1>

            <p
              style={{
                fontSize: "clamp(15px, 1.3vw, 18px)",
                lineHeight: 1.6,
                color: "#334155",
                fontWeight: 600,
                marginBottom: "40px",
                maxWidth: "680px",
                margin: "0 0 40px 0",
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                textShadow: "0 1px 12px rgba(255, 255, 255, 0.85)",
              }}
            >
              Learn cloud computing through structured roadmaps,<br /> industry-recognized certifications, hands-on projects,<br /> workshops, and a thriving builder community.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "24px",
                width: "auto",
              }}
            >
              {/* Join Community slanted orange button */}
              <button
                style={{
                  width: "auto",
                  padding: "15px 36px",
                  background: "#FF9900",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "17px",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  transform: "skewX(-20deg) scale(1)",
                  borderRadius: "12px",
                  boxShadow: "none",
                  outline: "none",
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "skewX(-20deg) scale(1.04)";
                  e.currentTarget.style.backgroundColor = "#E68A00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "skewX(-20deg) scale(1)";
                  e.currentTarget.style.backgroundColor = "#FF9900";
                }}
              >
                <span style={{ display: "inline-block", transform: "skewX(20deg)" }}>
                  Join Community
                </span>
              </button>

              {/* Explore Roadmap button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "auto",
                  background: "transparent",
                  border: "none",
                  color: "#0F172A",
                  fontSize: "17px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "11px",
                  padding: "10px 16px",
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  outline: "none",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "2px solid #FF9900",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FF9900",
                    backgroundColor: "rgba(255, 153, 0, 0.03)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Play size={16} fill="#FF9900" style={{ marginLeft: "4px" }} />
                </div>
                Explore Roadmap
              </motion.button>
            </div>
            </div> {/* closes Left-Aligned Content Wrapper */}

            {/* Bottom Left Circuit Graphic */}
            <div 
              style={{ 
                position: "absolute",
                bottom: "5vh",
                left: "40px",
                width: "100%", 
                maxWidth: "320px",
                zIndex: 10,
              }}
            >
              <svg 
                viewBox="0 0 500 130" 
                width="100%" 
                height="auto" 
                style={{ 
                  opacity: 0.95,
                  marginLeft: "-25px",
                  display: "block"
                }}
              >
                {/* Grid Dots */}
                {Array.from({ length: 4 }).map((_, rIndex) => 
                  Array.from({ length: 9 }).map((_, cIndex) => {
                    const cx = 350 + cIndex * 15;
                    const cy = 35 + rIndex * 10;
                    const isOrange = rIndex === 0 && cIndex === 0;
                    return (
                      <circle 
                        key={`dot-${rIndex}-${cIndex}`} 
                        cx={cx} 
                        cy={cy} 
                        r="0.8"
                        fill={isOrange ? "#FF9900" : "#cbd5e1"} 
                      />
                    );
                  })
                )}

                {/* Circuit Line */}
                <path 
                  d="M 0 25 L 25 25 L 65 65 L 250 65 L 270 45 L 410 45" 
                  stroke="#475569" 
                  strokeWidth="1.0"
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none" 
                />

                {/* Floating Cloud Outline */}
                <path 
                  d="M 65 35 a 10 10 0 0 1 5 -18 a 15 15 0 0 1 25 -5 a 10 10 0 0 1 15 8 a 8 8 0 0 1 2 15 z" 
                  stroke="#cbd5e1" 
                  strokeWidth="1.0"
                  fill="#ffffff" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Node 1 - Orange Diamond with white center */}
                <rect x="22" y="22" width="6" height="6" transform="rotate(45 25 25)" fill="#FF9900" stroke="#475569" strokeWidth="1.0" rx="1" />
                <circle cx="25" cy="25" r="1.0" fill="#ffffff" />
                
                {/* Node 2 - Orange Diamond with white center */}
                <rect x="317" y="42" width="6" height="6" transform="rotate(45 320 45)" fill="#FF9900" stroke="#475569" strokeWidth="1.0" rx="1" />
                <circle cx="320" cy="45" r="1.0" fill="#ffffff" />

                {/* Node 3 - Terminal dark slate dot */}
                <circle cx="410" cy="45" r="1.8" fill="#0f172a" />
              </svg>
            </div>
          </div> {/* closes 50% Left Half Container */}
      </div> {/* closes Content Overlay */}
      </motion.div>
    </div>
  );
}
