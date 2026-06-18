"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, Cloud, Trophy, Brain, Cpu, Database, 
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
      className="w-full h-[260px] relative perspective-1000 cursor-pointer select-none"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full transform-style-3d relative rounded-2xl"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden w-full h-full rounded-2xl bg-white border border-slate-100/80 p-5 flex flex-col shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {/* Top color strip */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
          
          {/* Icon row */}
          <div className="flex items-center gap-3 mb-3 mt-1">
            <div className="p-2 rounded-xl border border-slate-100 bg-slate-50" style={{ color: accentColor }}>
              {frontIcon}
            </div>
            <h3 className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight">{frontTitle}</h3>
          </div>

          {/* Data rows */}
          <div className="flex flex-col gap-2.5">
            {frontContent}
          </div>

          {/* Subtle flip hint */}
          <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400 mt-auto">
            <ArrowUpRight size={10} style={{ color: accentColor }} />
            <span>Hover to see details</span>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-2xl border border-slate-100 backdrop-blur-xl p-5 flex flex-col gap-3 shadow-sm overflow-hidden" style={{ background: `linear-gradient(135deg, white 0%, ${accentColor}08 100%)` }}>
          {/* Top color strip */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />

          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mt-1">
            <div className="p-1.5 rounded-lg" style={{ color: accentColor, backgroundColor: `${accentColor}12` }}>
              {frontIcon}
            </div>
            <h4 className="text-[13px] font-bold tracking-tight" style={{ color: accentColor }}>{frontTitle}</h4>
          </div>

          <div className="flex-grow text-xs text-slate-600 leading-relaxed">
            {backContent}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function IntelligenceDashboard({ region, onBack }: IntelligenceDashboardProps) {

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



      {/* VIEWPORT-CONTAINED DASHBOARD WRAPPER */}
      <div className="pt-10 pb-10 px-12 w-full flex flex-col items-center justify-start relative z-10 flex-grow h-full overflow-y-auto premium-scrollbar">
        <div className="max-w-[1400px] w-full flex flex-col items-center gap-6">
          
          {/* HERO PROFILE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            {/* Flag */}
            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center mb-3 shadow-sm overflow-hidden">
              <FlagImage flag={region.flagUrl || region.flag} name={region.name} className="w-9 h-6 object-contain" />
            </div>

            {/* Region Title */}
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900 mb-2 leading-tight">
              {region.name}
            </h1>

            {/* Profile Tag */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full">
              <Shield size={9} className="text-[#0073BB]" />
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
                Region Intelligence Profile
              </span>
            </div>
          </motion.div>

          {/* 3 INTERACTIVE FLIP CARDS GRID */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full"
          >
            
            {/* CARD 1: Infrastructure Overview */}
            <PremiumFlipCard
              accentColor="#FF9900"
              frontIcon={<Server size={18} />}
              frontTitle="Infrastructure Overview"
              frontContent={
                <>
                  <div className="flex justify-between items-center bg-amber-50/40 hover:bg-amber-50/75 border border-amber-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">Availability Zones</span>
                    <span className="text-amber-600 font-bold">{spec.zones}</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50/40 hover:bg-amber-50/75 border border-amber-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">Launch Year</span>
                    <span className="text-amber-600 font-bold">{spec.launchYear}</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50/40 hover:bg-amber-50/75 border border-amber-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">Primary Location</span>
                    <span className="text-slate-800 font-bold truncate max-w-[120px]">{spec.primaryLocation}</span>
                  </div>
                </>
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
                <>
                  <div className="flex justify-between items-center bg-blue-50/40 hover:bg-blue-50/75 border border-blue-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">AWS Services Available</span>
                    <span className="text-[#0073BB] font-bold">{spec.totalServices}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50/40 hover:bg-blue-50/75 border border-blue-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">AI/ML Services</span>
                    <span className="text-[#0073BB] font-bold">{spec.aimlServices}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50/40 hover:bg-blue-50/75 border border-blue-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">Analytics Services</span>
                    <span className="text-slate-800 font-bold">{spec.analyticsServices}</span>
                  </div>
                </>
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
              accentColor="#4F46E5"
              frontIcon={<Network size={18} />}
              frontTitle="Global Connectivity"
              frontContent={
                <>
                  <div className="flex justify-between items-center bg-indigo-50/40 hover:bg-indigo-50/75 border border-indigo-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">Edge Locations</span>
                    <span className="text-indigo-600 font-bold">{spec.edgeLocations}</span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50/40 hover:bg-indigo-50/75 border border-indigo-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">Direct Connect</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} /> {spec.directConnect}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50/40 hover:bg-indigo-50/75 border border-indigo-100/30 rounded-xl px-4 py-2.5 transition-colors">
                    <span className="text-slate-500 font-medium">Regional Reach</span>
                    <span className="text-slate-800 font-bold truncate max-w-[120px]">{spec.reach}</span>
                  </div>
                </>
              }
              backContent={
                <div className="flex flex-col gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-0.5">
                    <span className="text-[9px] text-indigo-600 font-black uppercase tracking-wider">Latency Benefits</span>
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
