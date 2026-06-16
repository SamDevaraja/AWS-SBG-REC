"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, User, Bell, Menu, Shield } from 'lucide-react';

const CONTINENTS = [
  "North America", "South America", "Europe", "Middle East", "Africa", "Asia Pacific", "Australia and New Zealand"
];

interface HeaderProps {
  activeContinent: string;
  onContinentChange: (continent: string) => void;
}

export default function Header({ activeContinent, onContinentChange }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-8">
        {/* Top Navbar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#161D26] shadow-sm">
                <Cloud size={24} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#161D26] tracking-tight flex items-center gap-2">
                   AWS Intelligence
                  <Shield size={14} className="text-[#0073BB]" />
                </h1>
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Student Builders Group • Global Network</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-white hover:bg-slate-50 text-[#161D26] text-[11px] font-extrabold rounded-xl transition-all border border-slate-200 uppercase tracking-widest">
              Documentation
            </button>
            <button className="px-6 py-2.5 bg-[#161D26] hover:bg-[#161D26]/90 text-white text-[11px] font-extrabold rounded-xl transition-all uppercase tracking-widest shadow-xl shadow-[#161D26]/10">
              Go to Account
            </button>
          </div>
        </div>

        {/* Categories Pills Bar */}
        <div className="flex items-center gap-4 py-3 overflow-x-auto no-scrollbar border-t border-slate-50">
          {CONTINENTS.map((item) => (
            <button
              key={item}
              onClick={() => onContinentChange(item)}
              className={activeContinent === item ? "continent-pill-active" : "continent-pill"}
              style={{ fontSize: '11px' }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
