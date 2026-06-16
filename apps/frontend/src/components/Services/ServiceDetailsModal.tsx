"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  BookOpen,
  CheckCircle,
  Cpu,
  Layers,
  Star,
  Activity,
  Tag,
  DollarSign
} from "lucide-react";
import { fetchServiceDetails, AWSServiceDetails, AWSServiceSummary } from "@/lib/api";

interface ServiceDetailsModalProps {
  id: string;
  onClose: () => void;
  onNavigateService: (id: string) => void;
  allServices: AWSServiceSummary[];
}

export default function ServiceDetailsModal({
  id,
  onClose,
  onNavigateService,
  allServices
}: ServiceDetailsModalProps) {
  const [service, setService] = useState<AWSServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full details of the service when id changes
  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchServiceDetails(id);
        setService(details);
      } catch (err: any) {
        console.error("Failed to load service details:", err);
        setError("Failed to load details for this AWS service.");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Navigate to a related service by its slug
  const handleRelatedClick = (slug: string) => {
    const matched = allServices.find(s => s.slug === slug);
    if (matched) {
      onNavigateService(matched.id);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: "spring", duration: 0.35 }}
          className="relative bg-white border border-slate-100 rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all z-20"
          >
            <X size={16} />
          </button>

          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center p-20 gap-3 min-h-[500px]">
              <div className="w-10 h-10 border-4 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
                Fetching Service Blueprint...
              </p>
            </div>
          ) : error || !service ? (
            <div className="flex-grow flex flex-col items-center justify-center p-20 gap-4 min-h-[500px]">
              <div className="text-red-500 font-semibold bg-red-50 px-6 py-4 rounded-xl border border-red-100">
                {error || "Could not retrieve service details."}
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
              >
                Close Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Modal Header */}
              <div className="p-8 sm:p-10 border-b border-slate-100 flex gap-6 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center p-3 border border-slate-100 flex-shrink-0">
                  <img
                    src={`${API_URL}${service.iconUrl}`}
                    alt={service.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/uploads/services/fallback.svg";
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {service.serviceCode}
                    </span>
                    <span className="px-2.5 py-0.5 text-[9px] font-semibold uppercase bg-[#FF9900]/10 text-[#FF9900] rounded border border-[#FF9900]/20">
                      {service.category?.name || "AWS Core"}
                    </span>
                    <span className="px-2.5 py-0.5 text-[9px] font-semibold uppercase bg-emerald-50 text-emerald-600 rounded border border-emerald-100">
                      {service.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                    {service.name}
                    {service.isFeatured && (
                      <Star size={15} className="fill-amber-400 text-amber-400" />
                    )}
                  </h3>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-grow overflow-y-auto premium-scrollbar p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT BLOCK: RICH DETAILS */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                  {/* Full Description */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen size={12} className="text-slate-400" /> Detailed Overview
                    </h4>
                    <p className="text-[14px] font-normal text-slate-600 leading-relaxed">
                      {service.fullDescription}
                    </p>
                  </div>

                  {/* Characteristics */}
                  {service.characteristics?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Activity size={12} className="text-slate-400" /> Characteristics & Core Architecture
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.characteristics.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 p-3.5 bg-slate-50/30 rounded-xl border border-slate-100"
                          >
                            <CheckCircle size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-[13px] font-medium text-slate-600">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Features */}
                  {service.features?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Cpu size={12} className="text-slate-400" /> Key Features & Capabilities
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 list-none pl-0">
                        {service.features.map((f, i) => (
                          <li
                            key={i}
                            className="text-[13px] font-normal text-slate-600 flex items-start gap-2 leading-relaxed"
                          >
                            <span className="text-[#FF9900] mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Use Cases */}
                  {service.useCases?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Layers size={12} className="text-slate-400" /> Common Use Cases
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {service.useCases.map((u, i) => (
                          <div
                            key={i}
                            className="p-4 bg-slate-50/40 rounded-xl border border-slate-100 text-[13px] font-normal text-slate-600 leading-relaxed flex gap-3"
                          >
                            <span className="text-slate-400 font-mono text-xs flex-shrink-0 mt-0.5">0{i + 1}</span>
                            <span>{u}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT BLOCK: METADATA PANEL */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Pricing Models */}
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <DollarSign size={12} className="text-slate-400" /> Pricing Structure
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {service.pricingModels?.length > 0 ? (
                        service.pricingModels.map((pm, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[11px] font-medium text-slate-600 shadow-sm"
                          >
                            {pm}
                          </span>
                        ))
                      ) : (
                        <span className="text-[12px] font-normal text-slate-500">Free Tier Eligible / Pay-as-you-go</span>
                      )}
                    </div>
                  </div>

                  {/* Related Services */}
                  {service.relatedServices?.length > 0 && (
                    <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Layers size={12} className="text-slate-400" /> Integrations & Related
                      </h5>
                      <div className="flex flex-col gap-2">
                        {service.relatedServices.map((rs, i) => {
                          const isLoadedInCatalog = allServices.some(s => s.slug === rs.slug);
                          return (
                            <button
                              key={i}
                              disabled={!isLoadedInCatalog}
                              onClick={() => handleRelatedClick(rs.slug)}
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-[12px] font-medium text-left flex justify-between items-center transition-all ${isLoadedInCatalog ? "bg-white hover:bg-slate-50 hover:border-slate-300 border-slate-100 text-slate-700 cursor-pointer shadow-sm" : "bg-slate-100/30 border-slate-100/10 text-slate-400 cursor-not-allowed"}`}
                            >
                              <span className="truncate">{rs.name}</span>
                              {isLoadedInCatalog && <span className="text-[#FF9900] text-[10px] font-semibold uppercase tracking-wider">Navigate</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Comparison tags / keywords */}
                  {service.comparisonTags?.length > 0 && (
                    <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Tag size={12} className="text-slate-400" /> Service Taxonomy
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {service.comparisonTags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-medium text-slate-500 uppercase tracking-wider shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Link: Official AWS Docs */}
                  {service.awsDocumentationUrl && (
                    <a
                      href={service.awsDocumentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-[#FF9900] hover:bg-[#FF8800] text-white rounded-xl font-semibold uppercase text-[11px] tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-md hover:shadow-orange-500/10"
                    >
                      Official AWS Specs <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
