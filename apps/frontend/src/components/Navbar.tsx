"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Review", href: "#reviews" },
  { label: "Team", href: "#team" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleScroll();
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Shared premium styling variables for all floating navbar bars: Clean white glassmorphism
  const barBackground = scrolled
    ? "rgba(255, 255, 255, 0.95)"
    : "rgba(255, 255, 255, 0.85)";

  const barBorder = scrolled
    ? "1px solid rgba(0, 0, 0, 0.12)"
    : "1px solid rgba(0, 0, 0, 0.08)";

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 22 }}
        style={{
          position: "fixed",
          top: "16px",
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          outline: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "auto",
            position: "relative",
            outline: "none",
          }}
        >
          {/* Left Bar: Logo and Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isMobile ? "8px 16px" : "6px 18px 6px 12px",
              background: barBackground,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: barBorder,
              borderRadius: "14px",
              boxShadow: scrolled
                ? "0 12px 30px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)"
                : "0 4px 20px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              outline: "none",
              outlineOffset: 0,
            }}
          >
            {/* Logo and Brand Content */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, cursor: "pointer", outline: "none" }}>
              <motion.div
                whileHover={{ rotate: -5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(30, 45, 61, 0.25)",
                  flexShrink: 0,
                  outline: "none",
                }}
              >
                <img 
                  src="/sbg-logo-latest.png" 
                  alt="AWS SBG REC Logo" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </motion.div>
              <div style={{ display: "flex", flexDirection: "column", outline: "none" }}>
                <span style={{ fontWeight: 800, fontSize: "14px", color: "#232F3E", lineHeight: 1.2, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                  AWS SBG REC
                </span>
                <span style={{ fontSize: "9px", color: "rgba(35, 47, 62, 0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  Student Builders Group
                </span>
              </div>
            </div>

            {/* Mobile Hamburger Toggle */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  marginLeft: "4px",
                  color: "#232F3E",
                  outline: "none",
                  outlineOffset: 0,
                }}
              >
                {mobileMenuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Middle Bar: Navigation links (Desktop only, positioned absolute-center) */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                background: barBackground,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: barBorder,
                borderRadius: "14px",
                boxShadow: scrolled
                  ? "0 12px 30px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)"
                  : "0 4px 20px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.05)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                outline: "none",
                outlineOffset: 0,
              }}
            >
              {LINKS.map((link, idx) => (
                <a
                  key={link.label}
                  href={isHome ? link.href : (link.href.startsWith("#") ? `/${link.href}` : link.href)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    position: "relative",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: hoveredIdx === idx ? "#FF9900" : "#232F3E",
                    textDecoration: "none",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    transition: "color 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "inline-flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    outline: "none",
                    outlineOffset: 0,
                  }}
                >
                  {link.label}
                  {/* Sliding underline */}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: hoveredIdx === idx ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      left: "14px",
                      right: "14px",
                      height: "2px",
                      backgroundColor: "#FF9900",
                      transformOrigin: "left",
                    }}
                  />
                </a>
              ))}
            </div>
          )}

          {/* Right Bar: CTAs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "6px" : "10px",
              padding: isMobile ? "6px 10px" : "6px 12px",
              background: barBackground,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: barBorder,
              borderRadius: "14px",
              boxShadow: scrolled
                ? "0 12px 30px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)"
                : "0 4px 20px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              outline: "none",
              outlineOffset: 0,
            }}
          >
            <motion.button
              whileHover={{
                scale: 1.02,
                borderColor: "#232F3E",
                color: "#232F3E",
                backgroundColor: "rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push('/login')}
              style={{
                padding: isMobile ? "6px 12px" : "8px 18px",
                borderRadius: "10px",
                border: "1.5px solid rgba(35, 47, 62, 0.3)",
                background: "transparent",
                color: "#232F3E",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                outline: "none",
                outlineOffset: 0,
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              Log In
            </motion.button>
            <motion.button
              whileHover={{
                y: -2,
                boxShadow: "0 8px 24px rgba(255,153,0,.45)",
                background: "linear-gradient(135deg, #FFaa00, #FF7700)"
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push('/signup')}
              style={{
                padding: isMobile ? "7px 14px" : "9px 22px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #FF9900, #FF6600)",
                color: "#ffffff",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                outline: "none",
                outlineOffset: 0,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 16px rgba(255, 153, 0, 0.25)",
                transition: "background 0.2s ease, y 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Mobile links dropdown drawer */}
          <AnimatePresence>
            {isMobile && mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "66px",
                  left: "24px",
                  right: "24px",
                  background: "rgba(255, 255, 255, 0.98)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "14px",
                  padding: "16px 8px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  zIndex: 999,
                  outline: "none",
                }}
              >
                {LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={isHome ? link.href : (link.href.startsWith("#") ? `/${link.href}` : link.href)}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#232F3E",
                      textDecoration: "none",
                      padding: "10px 20px",
                      borderRadius: "12px",
                      display: "block",
                      transition: "all 0.2s ease",
                      outline: "none",
                      outlineOffset: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
                      e.currentTarget.style.color = "#FF9900";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#232F3E";
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
}
