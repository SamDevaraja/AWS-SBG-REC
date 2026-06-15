'use client';

import React, { useState, useEffect, useRef } from "react";
import { LogOut, ChevronLeft, ChevronRight, Menu, X, User as UserIcon, PlusCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export interface SidebarUser {
  name: string;
  initials: string;
  badge?: string;
}

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
  currentPath: string;
  onNavigate: (href: string) => void;
  navItems: NavItem[];
  user?: SidebarUser;
  homeHref?: string;
  signOutLabel?: string;
  onSignOut?: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
}

export default function Sidebar({
  isOpen,
  isMobile,
  isMobileOpen,
  onToggle,
  onMobileClose,
  currentPath,
  onNavigate,
  navItems,
  user,
  homeHref = "/",
  signOutLabel = "Sign Out",
  onSignOut,
  brandTitle,
  brandSubtitle,
}: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const isHome = currentPath === homeHref;

  // Sidebar width: CSS-driven, no JS animation overhead
  const sidebarW = isMobile
    ? 240
    : isOpen ? 240 : 72;

  const sidebarVisible = isMobile ? isMobileOpen : true;

  console.log('Sidebar render: navItems length =', navItems?.length, 'items =', navItems?.map(item => item.label));

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => onNavigate(homeHref)}
          className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-white border border-slate-200 shadow-md"
          aria-label="Open menu"
          style={{ display: isMobileOpen ? 'none' : 'flex' }}
        >
          <Menu className="w-5 h-5 text-slate-700" onClick={(e) => { e.stopPropagation(); onMobileClose(); }} />
        </button>
      )}
      {isMobile && !isMobileOpen && (
        <button
          onClick={() => { /* open handled by SidebarLayout */ }}
          className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white border border-slate-200 shadow-md flex md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar — CSS transitions only, no Framer Motion */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden font-sans",
          // CSS transition on width and transform
          "transition-[width,transform] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        )}
        style={{
          width: sidebarW,
          transform: isMobile && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
          background: "var(--sidebar-bg, #131b2e)",
          boxShadow: "4px 0 32px -4px rgba(0,0,0,0.5)",
          willChange: "width, transform",
        }}
      >
        {/* Mobile close */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="absolute right-3 top-4 z-50 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}

        {/* Brand Header / User profile */}
        {brandTitle ? (
          <div className={cn("border-b border-white/5 shrink-0 px-6 py-5 flex items-center justify-between")}>
            {isOpen ? (
              <button onClick={() => onNavigate(homeHref)} className="flex flex-col gap-0.5 text-left group cursor-pointer">
                <h1 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-slate-200 transition-colors">{brandTitle}</h1>
                {brandSubtitle && (
                  <p className="text-[15px] font-medium text-slate-400 mt-0.5">{brandSubtitle}</p>
                )}
              </button>
            ) : (
              <button onClick={() => onNavigate(homeHref)} className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center shrink-0 mx-auto transition-colors cursor-pointer">
                <span className="text-[#FF6B00] font-black text-sm">{brandTitle[0]}</span>
              </button>
            )}
            {!isMobile && isOpen && (
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0 ml-2"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            )}
          </div>
        ) : user ? (
          <div className={cn("border-b border-white/5 shrink-0", isOpen ? "px-3 py-3" : "px-0 py-3 flex justify-center")}>
            {isOpen ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate(homeHref)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl transition-colors duration-150 flex-1 min-w-0 px-2 py-2 text-left",
                    isHome ? "bg-white/10 text-white" : "hover:bg-white/5 text-slate-200"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    <img src="/brand-logo.svg" alt="Profile" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-extrabold truncate text-white tracking-tight leading-tight">{user.name}</p>
                    {user.badge && (
                      <p className="text-[15px] font-medium text-slate-400 mt-0.5 truncate">
                        {user.badge}
                      </p>
                    )}
                  </div>
                </button>
                {/* Collapse button — desktop only */}
                {!isMobile && (
                  <button
                    onClick={onToggle}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                    aria-label="Collapse sidebar"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-400 hover:text-white" />
                  </button>
                )}
              </div>
            ) : (
              <button onClick={() => onNavigate(homeHref)} className={cn("flex items-center justify-center rounded-xl transition-colors duration-150 p-2", isHome ? "bg-white/10" : "hover:bg-white/5")}>
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm overflow-hidden">
                  <img src="/brand-logo.svg" alt="Profile" className="w-full h-full object-contain" />
                </div>
              </button>
            )}
          </div>
        ) : null}

        {/* Expand button when collapsed (desktop) */}
        {!isOpen && !isMobile && (
          <div className="px-0 py-2.5 flex justify-center border-b border-white/5 shrink-0">
            <button
              onClick={onToggle}
              className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center transition-colors duration-150"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>
        )}

        {/* Nav items */}
        <nav className={cn("flex-1 py-3 overflow-y-auto no-scrollbar", isOpen ? "space-y-0.5" : "px-3 space-y-1.5")}>
          {navItems.map((item) => {
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => !isOpen && setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => { onNavigate(item.href); onMobileClose(); }}
                  className={cn(
                    "flex items-center transition-all duration-150 w-full group py-3 gap-3 text-left font-sans border-l-4",
                    isOpen ? "px-5" : "px-2 justify-center",
                    isActive
                      ? "border-[#FF6B00] bg-[#1f2739] text-[#FF6B00] font-semibold"
                      : "border-transparent text-slate-300 hover:text-white hover:bg-white/5 font-normal"
                  )}
                >
                  <div className={cn("flex items-center justify-center shrink-0", isActive ? "text-[#FF6B00]" : "text-slate-300 group-hover:text-white")}>
                    {item.icon}
                  </div>
                  {/* Label — CSS opacity/translate/width transition, no Framer Motion */}
                  <span
                    className={cn(
                      "text-sm truncate flex-1 transition-[opacity,transform,width] duration-[200ms] ease-out",
                      isActive ? "font-semibold capitalize" : "font-normal capitalize"
                    )}
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translateX(0)' : 'translateX(-8px)',
                      pointerEvents: isOpen ? 'auto' : 'none',
                      width: isOpen ? 'auto' : '0px',
                      overflow: 'hidden',
                    }}
                  >
                    {item.label}
                  </span>
                </button>

                {/* Tooltip — collapsed desktop only */}
                {!isOpen && !isMobile && hoveredItem === item.label && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900/90 text-white text-xs font-semibold rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none animate-[fadeIn_100ms_ease-out]">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900/90" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-white/5 shrink-0 py-3 px-3 space-y-1">
          <button
            onClick={() => onSignOut?.()}
            className="flex items-center transition-all duration-150 group w-full px-3 py-2.5 gap-3 text-left text-slate-300 hover:text-red-400 hover:bg-white/5 rounded-xl font-sans font-normal"
          >
            <div className="text-slate-300 group-hover:text-red-400 flex items-center justify-center shrink-0">
              <LogOut className="w-[18px] h-[18px]" />
            </div>
            <span
              className="text-sm truncate transition-[opacity,transform,width] duration-[200ms] ease-out"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-8px)',
                pointerEvents: isOpen ? 'auto' : 'none',
                width: isOpen ? 'auto' : '0px',
                overflow: 'hidden',
              }}
            >
              {signOutLabel}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
