"use client";
 
import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Calendar, ArrowRight } from 'lucide-react';
import { NewsItem } from '@/lib/aws-news';
 
interface RegionalNewsCardProps {
  news: NewsItem;
  minimal?: boolean;
}
 
export default function RegionalNewsCard({ news, minimal = false }: RegionalNewsCardProps) {
  // Map categories to vibrant colors
  const categoryColors: Record<string, string> = {
    "AI/ML": "bg-purple-50 text-purple-600 border-purple-100",
    "Compute": "bg-blue-50 text-blue-600 border-blue-100",
    "Security": "bg-red-50 text-red-600 border-red-100",
    "Analytics": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Developer Tools": "bg-amber-50 text-amber-600 border-amber-100"
  };
 
  const tagStyle = categoryColors[news.category] || "bg-slate-50 text-slate-600 border-slate-100";
 
  if (minimal) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${tagStyle}`}>{news.category}</span>
          <span className="text-[9px] text-slate-400 font-bold">{news.date}</span>
        </div>
        <h4 className="text-xs font-black text-slate-800 line-clamp-1">{news.title}</h4>
      </div>
    );
  }
 
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="glass-card rounded-[24px] p-6 group transition-all duration-300 premium-shadow h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF9900]/5 to-transparent rounded-full -mr-10 -mt-10 blur-2xl group-hover:from-[#FF9900]/10" />
 
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase transition-colors ${tagStyle}`}>
          <Tag size={12} />
          {news.category}
        </span>
        <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider uppercase bg-white/50 px-3 py-1.5 rounded-full">
          <Calendar size={12} />
          {news.date}
        </span>
      </div>
 
      <h3 className="text-xl font-black text-[#1A1C1E] mb-3 leading-tight group-hover:text-[#0073BB] transition-colors relative z-10">
        {news.title}
      </h3>
      
      <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3 font-medium relative z-10">
        {news.summary}
      </p>
 
      <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100/50 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900] shadow-[0_0_10px_#FF9900]" />
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Official Update</span>
        </div>
        
        <a 
          href={news.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#1A1C1E] text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-[#0073BB] transition-all uppercase tracking-widest shadow-lg shadow-[#1A1C1E]/10"
        >
          Explore <ArrowRight size={14} />
        </a>
      </div>
    </motion.div>
  );
}
