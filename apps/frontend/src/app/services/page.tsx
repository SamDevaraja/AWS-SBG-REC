"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Shield, ChevronRight, ArrowDown, Sparkles,
  Search, Server, Trophy, LayoutGrid, CheckCircle2, ChevronLeft
} from 'lucide-react';
import GlobeScene from '@/components/Globe/GlobeScene';
import IntelligenceDashboard from '@/components/Intelligence/IntelligenceDashboard';
import { fetchCategories, fetchRegions, AWSRegionData, CategoryData } from '@/lib/api';
import FlagImage from '@/components/Layout/FlagImage';
import ServicesCatalog from '@/components/Services/ServicesCatalog';

export default function Home() {
  const [regions, setRegions] = useState<AWSRegionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<AWSRegionData | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories and regions from backend API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [catsData, regsData] = await Promise.all([
          fetchCategories(),
          fetchRegions()
        ]);
        setCategories(catsData);
        setRegions(regsData);
      } catch (err: any) {
        console.error("Error loading mesh data:", err);
        setError(err.message || "Failed to initialize AWS Region Intelligence Mesh.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // History Popstate Navigation Logic
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({ view: 'globe' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state || state.view !== 'details') {
        setShowIntelligence(false);
        setSelectedRegion(null);
        setExpandedCategory(null);
      } else if (state.view === 'details') {
        setShowIntelligence(true);
        if (state.regionId && regions.length > 0) {
          const region = regions.find(r => r.id === state.regionId);
          if (region) {
            setSelectedRegion(region);
            setExpandedCategory(region.categoryId);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [regions]);

  // Dynamically group active categories from database, preserving displayOrder
  const sidebarCategories = useMemo(() => {
    const sortedCats = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    return sortedCats.map(cat => {
      const catRegions = regions
        .filter(r => r.categoryId === cat.slug)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return {
        id: cat.slug,
        name: cat.name,
        flag: cat.flag,
        regionIds: catRegions.map(r => r.id)
      };
    });
  }, [categories, regions]);

  // Only show markers for regions listed in active sidebar categories
  const visibleRegionIds = useMemo(() =>
    new Set(sidebarCategories.flatMap(cat => cat.regionIds))
    , [sidebarCategories]);

  // Filter regions based on search query
  const filteredRegions = useMemo(() => {
    return regions.filter(r => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.infrastructure.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [regions, searchQuery]);

  const handleRegionSelect = (region: AWSRegionData) => {
    setSelectedRegion(region);
    setExpandedCategory(region.categoryId);
    setShowIntelligence(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-jakarta relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(190,227,237,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-12 h-12 border-4 border-[#0073BB]/20 border-t-[#0073BB] rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Initializing Region Mesh...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-jakarta relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(190,227,237,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-10 max-w-md w-full shadow-xl flex flex-col items-center text-center z-10">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <Shield size={30} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Mesh Connection Failure</h2>
          <p className="text-slate-500 text-sm font-semibold mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-[#1A1C1E] hover:bg-[#0073BB] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-md w-full"
          >
            Re-Initialize Mesh
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-[#F8F9FA] text-[#1A1C1E] flex flex-col font-jakarta relative ${showIntelligence ? 'overflow-hidden h-screen' : 'overflow-y-auto premium-scrollbar scroll-smooth'}`}>

      <AnimatePresence mode="wait">
        {!showIntelligence ? (
          /* SECTION 1: CENTERED EXPLORER HUB */
          <motion.section
            key="globe-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(15px)' }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="w-full relative flex flex-col bg-[#F8F9FA]"
          >
            {/* 3D Globe View viewport (takes exactly 100vh) */}
            <div className="h-screen w-full relative overflow-hidden flex flex-col flex-shrink-0">
            {/* Background Gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(190,227,237,0.15)_0%,transparent_60%)]" />
            </div>

            {/* Top Header */}
            <header className="absolute top-0 left-0 right-0 z-50 p-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-4 pointer-events-auto">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#1A1C1E] shadow-xl border border-slate-100/80">
                  <Cloud size={30} className="text-[#0073BB]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[32px] font-black tracking-tighter leading-none text-[#1A1C1E]">AWS Region Intelligence</h1>
                    <Shield size={20} className="text-[#0073BB]" />
                  </div>
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.55em] mt-3">Student Builders Group • Global Presence Mesh</p>
                </div>
              </div>
            </header>

            <div className="flex-grow flex relative z-10 pt-32 pb-10 px-10 gap-8 h-full">

              {/* LEFT SIDEBAR: REGION NAVIGATION */}
              <motion.aside
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 flex flex-col gap-4 z-20"
              >
                <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-8 h-full flex flex-col shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.4em] mb-3">Global Regions</h3>
                    <p className="text-[13px] font-bold text-slate-500 leading-tight">Select an AWS Region node to begin exploration.</p>
                  </div>

                  <div className="flex flex-col gap-2 flex-grow overflow-y-auto premium-scrollbar pb-10">
                    {sidebarCategories.map((cat) => {
                      const isExpanded = expandedCategory === cat.id;
                      const hasActiveChild = cat.regionIds.includes(selectedRegion?.id || '');

                      if (cat.regionIds.length === 0) return null;

                      return (
                        <div key={cat.id} className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              const nextExpanded = isExpanded ? null : cat.id;
                              setExpandedCategory(nextExpanded);
                              if (nextExpanded) {
                                // Select first region of this category if switching to it
                                const firstRegion = regions.find(r => r.id === cat.regionIds[0]);
                                if (firstRegion) {
                                  handleRegionSelect(firstRegion);
                                }
                              }
                            }}
                            className={`w-full px-5 py-4 rounded-2xl flex items-center justify-between transition-all text-xs font-black uppercase tracking-wider text-left group ${hasActiveChild ? 'bg-[#1A1C1E] text-white shadow-md' : 'hover:bg-slate-100/50 text-slate-600'}`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <FlagImage flag={cat.flag} name={cat.name} className="w-5 h-3.5 object-contain flex-shrink-0" />
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <ChevronRight size={12} className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90 text-current' : 'text-slate-400 group-hover:translate-x-1'}`} />
                          </button>

                          {/* Render sub-regions if expanded */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="pl-6 flex flex-col gap-1 overflow-hidden"
                              >
                                {cat.regionIds.map((rId) => {
                                  const r = regions.find(region => region.id === rId);
                                  if (!r) return null;
                                  const isSubSelected = selectedRegion?.id === r.id;

                                  return (
                                    <button
                                      key={r.id}
                                      onClick={() => handleRegionSelect(r)}
                                      className={`w-full px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-tight text-left transition-all flex items-center justify-between ${isSubSelected ? 'bg-[#0073BB]/10 text-[#0073BB] font-black' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                      <span>{r.name}</span>
                                      {isSubSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0073BB]" />}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.aside>

              {/* CENTER: GLOBE ALIGNMENT */}
              <div className="flex-grow relative flex items-center justify-center">
                <div className="w-[850px] h-[850px] relative pointer-events-auto">
                  <GlobeScene
                    regions={regions.filter(r => visibleRegionIds.has(r.id))}
                    onSelectRegion={handleRegionSelect}
                    selectedRegion={selectedRegion}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="px-12 py-5 bg-[#232F3E] rounded-full flex items-center gap-6 shadow-2xl pointer-events-auto">
                <Sparkles size={18} className="text-[#FF9900]" />
                <p className="text-[13px] font-black text-white/90 uppercase tracking-[0.2em] whitespace-nowrap">AWS Region Intelligence Mesh Active</p>
              </div>
            </div>

            {/* FLOATING BRIEF MODAL */}
            <AnimatePresence>
              {selectedRegion && !showIntelligence && (
                <RegionBriefModal
                  region={selectedRegion}
                  onClose={() => setSelectedRegion(null)}
                  onExplore={() => {
                    window.history.pushState({ view: 'details', regionId: selectedRegion.id }, '');
                    setShowIntelligence(true);
                  }}
                />
              )}
            </AnimatePresence>

            {/* Scroll Down Floating Indicator */}
            <div
              className="absolute bottom-10 right-10 z-20 animate-bounce cursor-pointer pointer-events-auto bg-white/95 backdrop-blur-md p-4 rounded-full border border-slate-100 shadow-xl flex items-center justify-center hover:bg-slate-50 transition-colors"
              onClick={() => {
                const catalogEl = document.getElementById("services-catalog-anchor");
                if (catalogEl) {
                  catalogEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              title="Scroll down to AWS Services Catalog"
            >
              <ArrowDown size={18} className="text-[#FF9900]" />
            </div>
          </div>

          {/* Catalog wrapper stacked below the globe scene */}
          <div id="services-catalog-anchor" className="w-full">
            <ServicesCatalog />
          </div>
        </motion.section>
        ) : (
          /* SECTION 2: INTELLIGENCE HUB (DETAILS VIEW) */
          <motion.div
            key="intelligence-hub"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="w-full min-h-screen bg-slate-950 z-50 flex flex-col"
          >
            {selectedRegion && (
              <IntelligenceDashboard
                region={selectedRegion}
                onBack={() => {
                  window.history.back();
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

function RegionBriefModal({ region, onClose, onExplore }: { region: AWSRegionData, onClose: () => void, onExplore: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="absolute bottom-24 right-10 z-[100] w-[420px] overflow-hidden rounded-[3.5rem] shadow-[0_60px_150px_-30px_rgba(0,0,0,0.12)] border border-white"
    >
      <div className="p-10 bg-white/95 backdrop-blur-3xl h-full flex flex-col">
        <div className="flex justify-between items-start mb-8">
          <div className="w-14 h-14 bg-[#1A1C1E] rounded-2xl flex items-center justify-center text-white shadow-xl overflow-hidden">
            <FlagImage flag={region.flagUrl || region.flag} name={region.name} className="w-10 h-7.5 object-contain" />
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">✕</button>
        </div>

        <h3 className="text-3xl font-black mb-2 tracking-tighter text-[#1A1C1E]">{region.name}</h3>
        <p className="text-xs font-bold text-[#0073BB] uppercase tracking-[0.3em] mb-6">AWS Infrastructure Region</p>

        <p className="text-[14px] text-slate-500 font-bold leading-relaxed mb-8">
          {region.infrastructure}
        </p>

        <button
          onClick={onExplore}
          className="w-full py-5 bg-[#1A1C1E] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-[#0073BB] transition-all shadow-xl shadow-slate-200"
        >
          Explore Specification <ArrowDown size={14} />
        </button>
      </div>
    </motion.div>
  );
}
