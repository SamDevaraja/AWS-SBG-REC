'use client';

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
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

  // Derive a human-readable label for the parent of the current page.
  // This is used in the back button label.
  const getBackLabel = useCallback(() => {
    if (!pathname) return 'Back';
    const parts = pathname.split('/').filter(Boolean);

    // Known explicit mappings first
    const map: Record<string, string> = {
      '/core/manage-regions': 'Categories',
      '/core/manage-categories': 'Dashboard',
    };
    for (const [prefix, label] of Object.entries(map)) {
      if (pathname.startsWith(prefix)) return label;
    }

    // For /core/registrations/[id] → "Registrations"
    // For /events/[eventId] → "Events"
    // For /crew/registrations/[id] → "Registrations"
    // General rule: capitalize and humanize the second-to-last segment
    const parentSegment = parts[parts.length - 2];
    if (!parentSegment) return 'Back';

    // Skip role prefixes — go one level up
    const rolePrefixes = ['core', 'crew', 'events'];
    if (rolePrefixes.includes(parentSegment)) {
      return 'Dashboard';
    }

    // Humanize: "manage-categories" → "Manage Categories"
    return parentSegment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [pathname]);

  // Show back button only on true sub-pages.
  // A sub-page has ≥ 3 path segments (e.g. /core/registrations/123)
  // OR is a known secondary page at 2 segments that isn't a main nav item.
  const shouldShowBack = useCallback((): boolean => {
    if (!pathname) return false;
    if (pathname === homeHref) return false;

    const parts = pathname.split('/').filter(Boolean);

    // ≥ 3 segments means definitely a sub/detail page
    if (parts.length >= 3) return true;

    // 2-segment known secondary pages (not reachable from main sidebar nav)
    const secondaryPages = ['/core/manage-regions', '/core/manage-categories'];
    if (secondaryPages.includes(pathname)) return true;

    return false;
  }, [pathname, homeHref]);

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
        className="h-screen overflow-y-auto overflow-x-hidden flex flex-col bg-[#F8FAFC] relative"
        style={{
          marginLeft: mainMargin,
          width: `calc(100% - ${mainMargin}px)`,
          // Exact same easing as sidebar CSS transition for visual sync
          transition: "margin-left 250ms cubic-bezier(0.4,0,0.2,1), width 250ms cubic-bezier(0.4,0,0.2,1)",
          willChange: "margin-left, width",
        }}
      >
        {/* Back breadcrumb — shown only on sub/detail pages, sits inside the page's natural top-padding zone */}
        {shouldShowBack() && (
          <div className="absolute top-5 left-8 z-30">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer group"
            >
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{getBackLabel()}</span>
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
