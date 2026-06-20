"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronRight, ArrowDown, AlertCircle,
  Search, Server, Trophy, LayoutGrid, CheckCircle2, ChevronLeft,
  Settings2
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

  // User role state
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const roleStr = (parsed?.role ?? "").toLowerCase().trim();
        setUserRole(roleStr);

        if (roleStr !== "core" && parsed?.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}&permission=edit_event`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.hasPermission) {
                setUserRole("core");
              }
            })
            .catch(err => console.error("Services page permission check failed:", err));
        }
      }
    } catch { /* ignore */ }
  }, []);

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

  // Dynamically map/filter region services for enthusiasts to the 30 major services
  const normalizedRegions = useMemo(() => {
    const isEnthusiast = userRole !== "core" && userRole !== "crew";
    if (!isEnthusiast) return regions;

    const allowedServiceNamesAndCodes = new Set([
      "amazon-ec2", "ec2",
      "aws-lambda", "lambda",
      "aws-auto-scaling-ec2", "ec2autoscaling",
      "amazon-s3", "s3",
      "amazon-ebs", "ebs",
      "amazon-rds", "rds",
      "amazon-dynamodb", "dynamodb",
      "amazon-aurora", "aurora",
      "amazon-vpc", "vpc",
      "amazon-route-53", "route53",
      "amazon-cloudfront", "cloudfront",
      "elastic-load-balancing", "elb", "elasticloadbalancing",
      "aws-iam", "iam",
      "aws-kms", "kms",
      "aws-secrets-manager", "secretsmanager",
      "aws-waf", "waf",
      "amazon-cloudwatch", "cloudwatch",
      "aws-systems-manager", "ssm", "systemsmanager",
      "aws-cloudtrail", "cloudtrail",
      "amazon-ecs", "ecs",
      "amazon-eks", "eks",
      "amazon-sqs", "sqs",
      "amazon-sns", "sns",
      "amazon-eventbridge", "eventbridge",
      "aws-step-functions", "stepfunctions",
      "aws-cloudformation", "cloudformation",
      "amazon-api-gateway", "apigateway", "apigw",
      "amazon-kinesis", "amazon-kinesis-data-streams", "amazon-kinesis-data-firehose", "amazon-kinesis-data-analytics", "amazon-kinesis-video-streams", "kinesis", "kinesisstreams", "kinesisfirehose", "kinesisanalytics", "kinesisvideo",
      "amazon-redshift", "redshift",
      "aws-glue", "glue"
    ]);

    return regions.map(r => {
      const filterFn = (s: string) => {
        const sLower = s.toLowerCase().replace(/\s+/g, '-');
        return Array.from(allowedServiceNamesAndCodes).some(allowed => 
          sLower.includes(allowed) || allowed.includes(sLower)
        );
      };
      return {
        ...r,
        services: (r.services || []).filter(filterFn),
        topServices: (r.topServices || []).filter(filterFn)
      };
    });
  }, [regions, userRole]);

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
        if (state.regionId && normalizedRegions.length > 0) {
          const region = normalizedRegions.find(r => r.id === state.regionId);
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
  }, [normalizedRegions]);

  // Dynamically group active categories from database, preserving displayOrder
  const sidebarCategories = useMemo(() => {
    const sortedCats = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    return sortedCats.map(cat => {
      const catRegions = normalizedRegions
        .filter(r => r.categoryId === cat.slug)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return {
        id: cat.slug,
        name: cat.name,
        flag: cat.flag,
        regionIds: catRegions.map(r => r.id)
      };
    });
  }, [categories, normalizedRegions]);

  // Only show markers for regions listed in active sidebar categories
  const visibleRegionIds = useMemo(() =>
    new Set(sidebarCategories.flatMap(cat => cat.regionIds))
    , [sidebarCategories]);

  // Filter regions based on search query
  const filteredRegions = useMemo(() => {
    return normalizedRegions.filter(r => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.infrastructure.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [normalizedRegions, searchQuery]);

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
        <div style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(35, 47, 62, 0.06))" }} className="backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-10 max-w-md w-full shadow-xl flex flex-col items-center text-center z-10">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <AlertCircle size={30} />
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
                <div>
                  <h1 className="text-[32px] font-semibold tracking-tighter leading-none text-[#1A1C1E]">
                    AWS Region Intelligence
                  </h1>
                  <p className="text-slate-400 text-[10px] font-medium tracking-[0.05em] uppercase mt-2">
                    Interactive 3D explorer visualizing global cloud infrastructure partitions
                  </p>
                </div>
              </div>
              {userRole === "core" && (
                <div className="pointer-events-auto">
                  <Link
                    href="/core/manage-regions"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Settings2 size={12} className="text-[#FF9900]" />
                    Manage Regions
                  </Link>
                </div>
              )}
            </header>

            <div className="flex-grow flex relative z-10 pt-32 pb-10 px-10 gap-8 h-full">

              {/* LEFT SIDEBAR: REGION NAVIGATION */}
              <motion.aside
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-72 flex flex-col gap-4 z-20"
              >
                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 h-full flex flex-col shadow-sm">

                  {/* Header */}
                  <div className="mb-5 pb-5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.12em] mb-2">Global Regions</p>
                    <p className="text-[12px] font-medium text-slate-500 leading-snug">Select a region to begin exploration.</p>
                  </div>

                  {/* Region list */}
                  <div className="flex flex-col gap-1 flex-grow overflow-y-auto premium-scrollbar">
                    {sidebarCategories.map((cat) => {
                      const isExpanded = expandedCategory === cat.id;
                      const hasActiveChild = cat.regionIds.includes(selectedRegion?.id || '');

                      if (cat.regionIds.length === 0) return null;

                      return (
                        <div key={cat.id} className="flex flex-col">
                          <button
                            onClick={() => {
                              const nextExpanded = isExpanded ? null : cat.id;
                              setExpandedCategory(nextExpanded);
                              if (nextExpanded) {
                                const firstRegion = regions.find(r => r.id === cat.regionIds[0]);
                                if (firstRegion) handleRegionSelect(firstRegion);
                              }
                            }}
                            className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all text-left group ${hasActiveChild ? 'bg-[#1A1C1E] text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <FlagImage flag={cat.flag} name={cat.name} className="w-5 h-3.5 object-contain flex-shrink-0 rounded-sm" />
                              <span className="text-[11px] font-bold tracking-wide truncate uppercase">{cat.name}</span>
                            </div>
                            <ChevronRight size={12} className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${hasActiveChild ? 'text-white/60' : 'text-slate-300'}`} />
                          </button>

                          {/* Sub-regions */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden ml-4 mt-1 border-l-2 border-slate-100 pl-3 flex flex-col gap-0.5"
                              >
                                {cat.regionIds.map((rId) => {
                                  const r = regions.find(region => region.id === rId);
                                  if (!r) return null;
                                  const isSubSelected = selectedRegion?.id === r.id;

                                  return (
                                    <button
                                      key={r.id}
                                      onClick={() => handleRegionSelect(r)}
                                      className={`w-full px-3 py-2 rounded-lg text-[11px] text-left transition-all flex items-center justify-between ${isSubSelected ? 'bg-[#0073BB]/8 text-[#0073BB] font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium'}`}
                                    >
                                      <span>{r.name}</span>
                                      {isSubSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0073BB] flex-shrink-0" />}
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
                    regions={normalizedRegions.filter(r => visibleRegionIds.has(r.id))}
                    onSelectRegion={handleRegionSelect}
                    selectedRegion={selectedRegion}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-full shadow-sm pointer-events-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap">Region Intelligence Active</span>
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
      initial={{ scale: 0.95, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 16 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute bottom-20 right-10 z-[100] w-[360px] overflow-hidden rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] border border-slate-100/80 bg-white"
    >
      <div className="p-6 flex flex-col gap-5">

        {/* Header row: flag + close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
              <FlagImage flag={region.flagUrl || region.flag} name={region.name} className="w-8 h-6 object-contain" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold tracking-tight text-slate-900 leading-tight">{region.name}</h3>
              <p className="text-[10px] font-semibold text-[#0073BB] uppercase tracking-[0.1em] mt-0.5">AWS Infrastructure Region</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Description */}
        <p className="text-[13px] text-slate-500 font-normal leading-relaxed">
          {region.infrastructure}
        </p>

        {/* CTA */}
        <button
          onClick={onExplore}
          className="w-full py-3 bg-[#1A1C1E] hover:bg-[#0073BB] text-white rounded-xl font-semibold text-[12px] tracking-wide flex items-center justify-center gap-2 transition-all duration-200"
        >
          Explore Specification <ArrowDown size={13} />
        </button>

      </div>
    </motion.div>
  );
}
