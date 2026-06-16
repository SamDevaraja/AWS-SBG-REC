"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, Cloud, Trophy, ChevronLeft, Brain, Cpu, Database, 
  Network, ArrowUpRight, CheckCircle2, Shield, MapPin, Calendar, HelpCircle
} from 'lucide-react';
import { AWSRegionData } from '@/lib/api';
import FlagImage from '../Layout/FlagImage';

interface IntelligenceDashboardProps {
  region: AWSRegionData;
  onBack: () => void;
}

// 16 AWS Regions Specific Metric Data
interface RegionalSpecification {
  zones: number;
  launchYear: number;
  primaryLocation: string;
  compliance: string;
  totalServices: string;
  aimlServices: string;
  analyticsServices: string;
  networkingServices: string;
  edgeLocations: string;
  directConnect: string;
  reach: string;
  latency: string;
}

// Specifications are now resolved dynamically from the normalized Region database object.

// Custom hook for magnetic effect on hover
function useMagnetic(strength = 0.3) {
  const ref = useRef<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: any) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener('mousemove', handleMouseMove);
      node.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        node.removeEventListener('mousemove', handleMouseMove);
        node.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [ref.current]);

  return { ref, position };
}

// Interactive 3D Flip Card Component
function PremiumFlipCard({ 
  frontIcon, 
  frontTitle, 
  frontContent, 
  backContent,
  accentColor = "#0073BB"
}: { 
  frontIcon: React.ReactNode; 
  frontTitle: string; 
  frontContent: React.ReactNode; 
  backContent: React.ReactNode;
  accentColor?: string;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full h-[300px] md:h-[320px] relative perspective-1000 cursor-pointer select-none"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full transform-style-3d relative rounded-[2rem]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 14 }}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden w-full h-full rounded-[2rem] bg-white/40 border border-white/50 backdrop-blur-2xl p-7 flex flex-col justify-between shadow-xl shadow-slate-200/35 overflow-hidden">
          {/* Top colored indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
          
          <div className="flex justify-between items-center">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-sm" style={{ color: accentColor }}>
              {frontIcon}
            </div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Specs Front</span>
          </div>

          <div className="my-auto py-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">{frontTitle}</h3>
            {frontContent}
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider" style={{ color: accentColor }}>
            <span>Hover / Tap to flip</span>
            <ArrowUpRight size={12} className="animate-pulse" />
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-[2rem] bg-white/60 border border-white/60 backdrop-blur-2xl p-7 flex flex-col justify-between shadow-xl shadow-slate-200/35 overflow-y-auto premium-scrollbar">
          {/* Top colored indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: accentColor }}>
              {frontIcon} {frontTitle}
            </h4>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Specs Back</span>
          </div>

          <div className="flex-grow py-3 text-xs font-semibold text-slate-700 leading-relaxed">
            {backContent}
          </div>

          <div className="text-[8px] text-slate-400 text-center font-bold uppercase tracking-wider pt-2 border-t border-slate-50">
            AWS Region Autonomic Spec
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function IntelligenceDashboard({ region, onBack }: IntelligenceDashboardProps) {
  const { ref: backBtnRef, position: backBtnPos } = useMagnetic(0.35);

  // Use specifications resolved dynamically from the region payload
  const spec = {
    zones: region.availabilityZones,
    launchYear: region.launchYear,
    primaryLocation: region.primaryLocation,
    compliance: region.compliance,
    totalServices: region.totalServices,
    aimlServices: region.aimlServices,
    analyticsServices: region.analyticsServices,
    networkingServices: region.networkingServices,
    edgeLocations: region.edgeLocations,
    directConnect: region.directConnect,
    reach: region.reach,
    latency: region.latency
  };

  return (
    <div className="relative w-full h-screen text-slate-800 font-jakarta overflow-hidden bg-slate-50/60 flex flex-col justify-start">
      
      {/* 1. LIGHT CLOUD BACKGROUND SYSTEMS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft, modern gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, rgba(255, 153, 0, 0.04) 0%, rgba(0, 115, 187, 0.03) 100%),
              radial-gradient(ellipse at 95% 5%, rgba(255, 153, 0, 0.08) 0%, rgba(0, 115, 187, 0.04) 35%, transparent 65%),
              #FFFFFF
            `
          }}
        />

        {/* Soft blur light blobs */}
        <div className="absolute top-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-orange-400/3 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[550px] h-[550px] rounded-full bg-blue-400/4 blur-[120px]" />
      </div>

      {/* COMPACT FIXED NAV BAR */}
      <nav className="w-full h-20 px-12 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-xl fixed top-0 left-0 z-50 shadow-sm shadow-slate-100/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center text-slate-800 shadow-sm backdrop-blur-md overflow-hidden">
            <FlagImage flag={region.flagUrl || region.flag} name={region.name} className="w-6 h-4.5 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900 leading-none">{region.name}</h2>
              <span className="text-[8px] font-black uppercase text-[#0073BB] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded tracking-wider">
                {region.id}
              </span>
            </div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">AWS Region Overview</p>
          </div>
        </div>

        {/* Compact Back Button */}
        <motion.button
          ref={backBtnRef}
          onClick={onBack}
          style={{ x: backBtnPos.x, y: backBtnPos.y }}
          className="relative px-6 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:text-slate-900"
        >
          <ChevronLeft 
            size={12} 
            className="transition-transform duration-300 group-hover:-translate-x-0.5" 
          /> 
          <span>Back to Explorer</span>
        </motion.button>
      </nav>

      {/* VIEWPORT-CONTAINED DASHBOARD WRAPPER */}
      <div className="pt-24 pb-6 px-12 w-full flex flex-col items-center justify-center relative z-10 flex-grow h-full overflow-hidden">
        <div className="max-w-[1400px] w-full flex flex-col justify-between h-full gap-5">
          
          {/* COMPACT HERO PROFILE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mt-2"
          >
            {/* Small Badge */}
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center mb-2 shadow-sm backdrop-blur-xl overflow-hidden">
              <FlagImage flag={region.flagUrl || region.flag} name={region.name} className="w-7 h-5 object-contain" />
            </div>

            {/* Region Title */}
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-1 leading-tight">
              {region.name}
            </h1>

            {/* Compact Profile Tag */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50/80 to-orange-50/80 border border-slate-200/60 px-3.5 py-1 rounded-full shadow-sm">
              <Shield size={10} className="text-[#0073BB]" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">
                Region Intelligence Profile
              </span>
            </div>
          </motion.div>

          {/* 3 INTERACTIVE FLIP CARDS GRID (FITS VIEWPORT) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full flex-grow items-center mb-6 max-h-[360px]"
          >
            
            {/* CARD 1: Infrastructure Overview */}
            <PremiumFlipCard
              accentColor="#FF9900"
              frontIcon={<Server size={18} />}
              frontTitle="Infrastructure Overview"
              frontContent={
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-1.5">
                    <span className="text-slate-500 font-bold">Availability Zones</span>
                    <span className="text-slate-800 font-extrabold">{spec.zones}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-1.5">
                    <span className="text-slate-500 font-bold">Launch Year</span>
                    <span className="text-slate-800 font-extrabold">{spec.launchYear}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Primary Location</span>
                    <span className="text-slate-800 font-extrabold truncate max-w-[120px]">
                      {spec.primaryLocation}
                    </span>
                  </div>
                </div>
              }
              backContent={
                <div className="flex flex-col gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/5 border border-orange-500/10 flex flex-col gap-0.5">
                    <span className="text-[9px] text-orange-600 font-black uppercase tracking-wider">Region Strength</span>
                    <p className="text-[11px] text-slate-700 leading-normal">{region.infrastructure}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-bold">Residency:</span>
                      <span className="text-slate-800 font-extrabold">Local Sovereignty</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Audited Standards:</span>
                      <span className="text-slate-800 font-extrabold text-right truncate max-w-[150px]">
                        {spec.compliance.split(",")[0]}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 italic mt-0.5 font-medium leading-relaxed">
                    Designed to comply with local regulatory frameworks (HIPAA, GDPR, or PoPIA).
                  </div>
                </div>
              }
            />

            {/* CARD 2: Regional Service Coverage */}
            <PremiumFlipCard
              accentColor="#0073BB"
              frontIcon={<Cloud size={18} />}
              frontTitle="Regional Service Coverage"
              frontContent={
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-1.5">
                    <span className="text-slate-500 font-bold">AWS Services Available</span>
                    <span className="text-[#0073BB] font-black">{spec.totalServices}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-1.5">
                    <span className="text-slate-500 font-bold">AI/ML Services</span>
                    <span className="text-slate-800 font-extrabold">{spec.aimlServices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Analytics Services</span>
                    <span className="text-slate-800 font-extrabold">{spec.analyticsServices}</span>
                  </div>
                </div>
              }
              backContent={
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-[#0073BB] font-black uppercase tracking-wider">AI Capabilities</span>
                    {region.aiCapabilities && region.aiCapabilities.length > 0 ? (
                      <p className="text-[11px] text-slate-700 leading-normal">
                        {region.aiCapabilities.join(", ")}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No AI capabilities registered.</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-[#0073BB] font-black uppercase tracking-wider block mb-0.5">Top Services</span>
                    {region.topServices && region.topServices.length > 0 ? (
                      <p className="text-[11px] text-slate-600 leading-normal font-bold">
                        {region.topServices.join(", ")}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No top services registered.</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-[#0073BB] font-black uppercase tracking-wider block mb-0.5">Workloads</span>
                    {region.workloads && region.workloads.length > 0 ? (
                      <p className="text-[11px] text-slate-600 leading-normal">
                        {region.workloads.join(", ")}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No workloads registered.</p>
                    )}
                  </div>
                </div>
              }
            />

            {/* CARD 3: Global Connectivity */}
            <PremiumFlipCard
              accentColor="#0073BB"
              frontIcon={<Network size={18} />}
              frontTitle="Global Connectivity"
              frontContent={
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-1.5">
                    <span className="text-slate-500 font-bold">Edge Locations</span>
                    <span className="text-slate-800 font-extrabold">{spec.edgeLocations}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-1.5">
                    <span className="text-slate-500 font-bold">Direct Connect</span>
                    <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> {spec.directConnect}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Regional Reach</span>
                    <span className="text-slate-800 font-extrabold truncate max-w-[120px]">
                      {spec.reach}
                    </span>
                  </div>
                </div>
              }
              backContent={
                <div className="flex flex-col gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col gap-0.5">
                    <span className="text-[9px] text-[#0073BB] font-black uppercase tracking-wider">Latency Benefits</span>
                    <p className="text-[11px] text-slate-700 leading-normal font-semibold">{spec.latency}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-bold">CDN Nodes:</span>
                      <span className="text-slate-800 font-extrabold">{spec.edgeLocations} points of presence</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Backbone speed:</span>
                      <span className="text-slate-800 font-extrabold text-right">Redundant 100Gbps+ links</span>
                    </div>
                  </div>
                </div>
              }
            />

          </motion.div>

        </div>
      </div>
    </div>
  );
}
