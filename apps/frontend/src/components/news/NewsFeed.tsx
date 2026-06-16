"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, RefreshCcw, Wifi, Stars } from 'lucide-react';
import RegionalNewsCard from './RegionalNewsCard';
import { NewsItem } from '@/lib/aws-news';
import { AWSRegion } from '@/data/regions';

interface NewsFeedProps {
  news: NewsItem[];
  selectedRegion: AWSRegion | null;
  onClearRegion: () => void;
  isLoading: boolean;
  minimal?: boolean;
}

const CATEGORIES = ["All", "AI/ML", "Compute", "Security", "Analytics", "Developer Tools"];

export default function NewsFeed({ news, selectedRegion, onClearRegion, isLoading, minimal = false }: NewsFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesRegion = !selectedRegion || item.regionId === selectedRegion.id;
      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [news, searchQuery, selectedCategory, selectedRegion]);

  if (minimal) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Regional Intelligence</h3>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
            <Wifi size={10} className="animate-pulse" />
            LIVE
          </div>
        </div>
        <div className="space-y-4">
          {filteredNews.slice(0, 3).map((item) => (
            <RegionalNewsCard key={item.id} news={item} minimal={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[1280px] mx-auto">
      {/* Search & Header */}
      <div className="pb-12 flex flex-col items-center text-center">
        <div className="flex flex-col items-center justify-between gap-6 mb-10 w-full">
          <div>
            <h2 className="text-5xl font-black text-[#1A1C1E] tracking-tight flex items-center justify-center gap-4">
              Infrastructure Intelligence
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 italic tracking-[0.1em]">
                <Wifi size={12} className="animate-pulse" />
                SYSTEM LIVE
              </div>
            </h2>
            <p className="text-slate-400 text-[11px] font-extrabold tracking-[0.3em] uppercase mt-4">Global AWS Network Activity & Updates</p>
          </div>
        </div>

        <div className="relative w-full max-w-3xl mb-4">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
          <input 
            type="text"
            placeholder="Search regional updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/30 transition-all text-base placeholder:text-slate-300 font-bold"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 w-full pt-8 pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-full text-[11px] font-black whitespace-nowrap transition-all tracking-widest uppercase border ${
                selectedCategory === cat 
                ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] scale-105' 
                : 'bg-white text-slate-400 hover:bg-slate-50 border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Region Indicator */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden w-full flex justify-center mb-12"
          >
            <div className="bg-[#1A1C1E] text-white rounded-[2.5rem] p-8 flex items-center justify-between w-full max-w-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] border border-white/5">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.25rem] bg-white/5 flex items-center justify-center border border-white/10">
                  <Stars size={32} className="text-[#FF9900]" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#FF9900] uppercase tracking-[0.25em] mb-1.5">Active Matrix</p>
                  <p className="text-2xl font-black">{selectedRegion.details}</p>
                </div>
              </div>
              <button 
                onClick={onClearRegion}
                className="text-[11px] font-black bg-white/5 hover:bg-white/10 text-white uppercase tracking-widest px-8 py-3.5 rounded-2xl transition-all border border-white/10"
              >
                Reset Matrix
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News List */}
      <div className="w-full mt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-50 rounded-[2.5rem] p-10 h-64 relative overflow-hidden shadow-sm">
                <div className="shimmer absolute inset-0" />
              </div>
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
              <RegionalNewsCard key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-50 shadow-sm">
              <Search size={36} className="text-slate-200" />
            </div>
            <h3 className="text-[#1A1C1E] font-black text-2xl tracking-tight">No active streams found</h3>
            <p className="text-slate-400 text-xs font-bold mt-3 uppercase tracking-[0.2em]">Adjust filters to re-initialize regional intelligence</p>
          </div>
        )}
      </div>
    </div>
  );
}
