"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Gallery", href: "#gallery" },
  { label: "Review", href: "#reviews" },
  { label: "Team", href: "#team" },
  { label: "Certifications", href: "/certifications" },
  { label: "Learn", href: "/learn" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (_) {}
  }, []);

  const getDashboardHref = () => {
    if (!user) return "/login";
    const role = (user.role || "").toLowerCase().trim();
    if (role === "core") return "/core/dashboard";
    if (role === "crew") return "/crew/dashboard";
    return "/events/dashboard";
  };

  const getInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("aws_sgb_rec_user");
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleScroll();
    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1100px",
            margin: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "8px 16px" : "10px 20px",
            background: scrolled
              ? "#161d26"
              : "#161d26",
            backdropFilter: "blur(28px) saturate(1.6)",
            WebkitBackdropFilter: "blur(28px) saturate(1.6)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)"
              : "0 4px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.03)",
            transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: "auto",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, cursor: "pointer" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(30,45,61,0.18)",
                flexShrink: 0,
              }}
            >
              <img src="/sbg-logo-latest.png" alt="AWS SBG REC Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 800, fontSize: "14px", color: "#ffffff", lineHeight: 1.2, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                  AWS SBG REC
                </span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  Student Builders Group
                </span>
              </div>
            )}
          </div>

          {/* Nav Links - Desktop */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
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
                    color: hoveredIdx === idx ? "#FF9900" : "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    transition: "color 0.25s ease, background 0.25s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    background: hoveredIdx === idx ? "rgba(255,153,0,0.06)" : "transparent",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Right: CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "10px", flexShrink: 0 }}>
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
                  color: "#ffffff",
                }}
              >
                {mobileMenuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            )}
            {user ? (
              <>
                <button
                  onClick={() => router.push(getDashboardHref())}
                  style={{
                    padding: isMobile ? "6px 12px" : "8px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: isMobile ? "12px" : "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF9900"; e.currentTarget.style.color = "#FF9900"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: isMobile ? "7px 14px" : "8px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg,#FF9900,#E68900)",
                    color: "#fff",
                    fontSize: isMobile ? "12px" : "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 10px rgba(255,153,0,0.25)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,153,0,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(255,153,0,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Log Out ({getInitials()})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    padding: isMobile ? "6px 12px" : "8px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: isMobile ? "12px" : "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF9900"; e.currentTarget.style.color = "#FF9900"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  style={{
                    padding: isMobile ? "7px 14px" : "8px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg,#FF9900,#E68900)",
                    color: "#fff",
                    fontSize: isMobile ? "12px" : "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 10px rgba(255,153,0,0.25)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,153,0,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(255,153,0,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: "72px",
                left: "24px",
                right: "24px",
                background: "rgba(22,29,38,0.98)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "12px 8px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                zIndex: 999,
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
                    color: "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    display: "block",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,153,0,0.1)"; e.currentTarget.style.color = "#FF9900"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
