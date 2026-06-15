'use client';

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Sidebar, { type NavItem, type SidebarUser } from "./Sidebar";
import { clearSessionCache } from "./AuthWrapper";

const SIDEBAR_OPEN_W = 240;
const SIDEBAR_COLLAPSED_W = 72;
const MOBILE_BREAKPOINT = 768;

interface SidebarLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  user?: SidebarUser;
  homeHref?: string;
  signOutLabel?: string;
  onSignOut?: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
}

export default function SidebarLayout({
  children,
  navItems,
  user,
  homeHref,
  signOutLabel = "Sign Out",
  onSignOut,
  brandTitle,
  brandSubtitle,
}: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);      // desktop expanded/collapsed
  const [isMobile, setIsMobile] = useState(false);  // is viewport < 768px
  const [isMobileOpen, setIsMobileOpen] = useState(false); // mobile drawer open
  const pathname = usePathname();
  const router = useRouter();

  // Single resize listener — shared between sidebar state concerns
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false); // close drawer when going to desktop
    };
    onResize(); // run once on mount
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleSignOut = useCallback(() => {
    clearSessionCache();
    localStorage.removeItem('aws_sgb_rec_user');
    if (onSignOut) { onSignOut(); return; }
    router.replace('/login');
  }, [onSignOut, router]);

  const handleNavigate = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      if (pathname.startsWith('/crew/')) {
        router.push('/crew/dashboard');
      } else if (pathname.startsWith('/core/')) {
        router.push('/core/dashboard');
      } else {
        router.push('/events');
      }
    }
  }, [router, pathname]);

  // Desktop: current width; Mobile: 0 (sidebar overlays, no margin)
  const mainMargin = isMobile ? 0 : isOpen ? SIDEBAR_OPEN_W : SIDEBAR_COLLAPSED_W;

  return (
    <div className="h-screen w-full bg-[#F9FAFB] overflow-hidden flex">
      {/* Mobile hamburger — outside sidebar so it shows even when drawer is closed */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-md"
          aria-label="Open menu"
        >
          <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <Sidebar
        isOpen={isOpen}
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        onToggle={() => setIsOpen((v) => !v)}
        onMobileClose={() => setIsMobileOpen(false)}
        currentPath={pathname}
        onNavigate={handleNavigate}
        navItems={navItems}
        user={user}
        homeHref={homeHref}
        signOutLabel={signOutLabel}
        onSignOut={handleSignOut}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
      />

      <main
        className="h-screen overflow-y-auto overflow-x-hidden flex flex-col bg-[#F8FAFC]"
        style={{
          marginLeft: mainMargin,
          width: `calc(100% - ${mainMargin}px)`,
          // Exact same easing as sidebar CSS transition for visual sync
          transition: "margin-left 250ms cubic-bezier(0.4,0,0.2,1), width 250ms cubic-bezier(0.4,0,0.2,1)",
          willChange: "margin-left, width",
        }}
      >


        {/* Inline Top-Left Back Button (hidden on root home/dashboard views, and main nav pages) */}
        {pathname && pathname !== homeHref && pathname !== '/certifications' && pathname !== '/events' && !pathname.startsWith('/news') && (
          <div style={{ width: '100%', padding: '24px 24px 0' }} className="shrink-0">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white transition-colors bg-[#131b2e] hover:bg-[#1a243d] rounded-lg px-3 py-1.5 shadow-sm cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>

      </main>
    </div>
  );
}
