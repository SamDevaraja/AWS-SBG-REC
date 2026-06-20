"use client";

import React, { useState, useEffect } from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [stars, setStars] = useState<{
    id: number;
    top: string;
    left: string;
    size: number;
    duration: number;
    delay: number;
    color: string;
    isStatic: boolean;
    opacity: number;
    pane: "left" | "right";
  }[]>([]);

  useEffect(() => {
    const newStars = [];
    let idCounter = 0;

    // Helper to generate star properties
    const createStar = (xMin: number, xMax: number, yMin: number, yMax: number, pane: "left" | "right") => {
      const isOrange = Math.random() < 0.25; // 25% orange tint, 75% white
      const size = Math.random() < 0.7 
        ? Math.random() * 0.7 + 0.5   // 70% are tiny: 0.5px to 1.2px
        : Math.random() * 1.3 + 1.2;  // 30% are larger: 1.2px to 2.5px
      
      const isStatic = Math.random() < 0.65; // 65% are static background stars
      const duration = Math.random() * 25 + 25; // 25s to 50s
      const delay = Math.random() * -50;
      const opacity = Math.random() * 0.6 + 0.2; // 0.2 to 0.8 base opacity

      return {
        id: idCounter++,
        top: `${yMin + Math.random() * (yMax - yMin)}%`,
        left: `${xMin + Math.random() * (xMax - xMin)}%`,
        size,
        duration,
        delay,
        isStatic,
        opacity,
        color: isOrange ? `rgba(255, 153, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
        pane,
      };
    };

    // Generate left side stars (galaxy background pane, sparse)
    for (let i = 0; i < 30; i++) {
      newStars.push(createStar(0, 100, 0, 100, "left"));
    }

    // Generate right side stars zoned around the login card container
    // 1. Top Zone (above card)
    for (let i = 0; i < 30; i++) {
      newStars.push(createStar(0, 100, 0, 22, "right"));
    }

    // 2. Bottom Zone (below card)
    for (let i = 0; i < 30; i++) {
      newStars.push(createStar(0, 100, 78, 100, "right"));
    }

    // 3. Left-of-card Zone (left side of card)
    for (let i = 0; i < 30; i++) {
      newStars.push(createStar(0, 32, 15, 85, "right"));
    }

    // 4. Right-of-card Zone (right side of card)
    for (let i = 0; i < 40; i++) {
      newStars.push(createStar(68, 100, 15, 85, "right"));
    }

    // 5. Scattered Background Zone (organic overlay)
    for (let i = 0; i < 20; i++) {
      newStars.push(createStar(0, 100, 0, 100, "right"));
    }

    setStars(newStars);
  }, []);

  return (
    <main className="fixed inset-0 flex flex-col md:flex-row overflow-hidden bg-[#030409]">
      {/* Style tag for keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatStar {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.15;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-90px) translateX(25px);
            opacity: 0.15;
          }
        }
      `}} />

      {/* Left side: Image section (hidden on mobile, shown on md and up) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 h-full relative overflow-hidden flex-col justify-between p-12 text-white select-none">
        {/* Background Static Image */}
        <img 
          src="/auth-bg.jpg" 
          alt="AWS Student Builders Group" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />

        {/* Black screen overlay to dim the background and make overlays/text look extremely professional and high-contrast */}
        <div className="absolute inset-0 bg-black/50 z-[2] pointer-events-none" />

        {/* Ambient Overlays: Highly optimized subtle vignettes focused around text/logo to maximize image visibility while maintaining perfect text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 z-[2] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent z-[2] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,153,0,0.15)_0%,transparent_50%)] z-[2] pointer-events-none" />

        {/* Floating Stars for Left Panel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[3]">
          {stars
            .filter((star) => star.pane === "left")
            .map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px ${star.color}` : "none",
                  animation: star.isStatic ? "none" : `floatStar ${star.duration}s linear infinite`,
                  animationDelay: star.isStatic ? "none" : `${star.delay}s`,
                  opacity: star.opacity,
                }}
              />
            ))}
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Header/Logo */}
          <div className="flex items-center gap-4">
            <img src="/brand-logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(255,153,0,0.35)]" />
            <div className="h-8 w-px bg-white/15" />
            <div className="flex flex-col gap-1">
              <span className="block text-[14.5px] font-extrabold tracking-wide text-white leading-none">
                AWS Student Builder Group
              </span>
              <span className="block text-[10px] font-black uppercase tracking-[0.05em] text-[#FF9900] leading-none">
                Rajalakshmi Engineering College
              </span>
            </div>
          </div>

          {/* Bottom Branding / Slogan */}
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl lg:text-[40px] font-black leading-none text-white tracking-tight uppercase font-sans">
              CONNECT, CODE & <br />
              <span className="text-[#FF9900]">
                BUILD THE FUTURE
              </span>
            </h1>
            <p className="text-slate-200 text-sm font-medium leading-relaxed max-w-md">
              Your portal to hands-on learning, event coordination, and community collaboration. Sign in to launch your cloud journey.
            </p>
          </div>

          {/* Footer note */}
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            © 2026 AWS Student Builders Group REC. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side: Login / Auth form card */}
      <div className="flex-1 md:w-1/2 lg:w-2/5 h-full bg-[#030409] relative overflow-hidden">
        {/* Floating Stars for Right Panel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
          {stars
            .filter((star) => star.pane === "right")
            .map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px ${star.color}` : "none",
                  animation: star.isStatic ? "none" : `floatStar ${star.duration}s linear infinite`,
                  animationDelay: star.isStatic ? "none" : `${star.delay}s`,
                  opacity: star.opacity,
                }}
              />
            ))}
        </div>

        {/* Scrolling content wrapper */}
        <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10 overflow-y-auto z-10">
          <div className="w-full flex justify-center py-8 relative">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
