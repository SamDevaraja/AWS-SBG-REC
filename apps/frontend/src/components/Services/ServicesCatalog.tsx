"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { List } from "react-window";
import {
  Search,
  Sparkles,
  ExternalLink,
  BookOpen,
  Cpu,
  Layers,
  Database,
  TrendingUp,
  Tag,
  Star,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import {
  fetchServices,
  fetchServiceCategories,
  AWSServiceSummary,
  AWSServiceCategory
} from "@/lib/api";
import ServiceDetailsModal from "./ServiceDetailsModal";

export default function ServicesCatalog() {
  const [services, setServices] = useState<AWSRegionSummary[]>([]);
  const [categories, setCategories] = useState<AWSServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Service ID for Modal
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Responsive columns state
  const [columns, setColumns] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  type AWSRegionSummary = AWSServiceSummary;

  // Load services and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [servicesData, categoriesData] = await Promise.all([
          fetchServices(),
          fetchServiceCategories()
        ]);
        setServices(servicesData);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error("Failed to load catalog data:", err);
        setError("Could not load AWS services catalog. Please check your backend connection.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Responsive columns logic based on container width
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else if (width < 1280) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [services]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter(s => s.isActive).length;
    const featured = services.filter(s => s.isFeatured).length;
    const categoriesCount = categories.length;

    return { total, active, featured, categoriesCount };
  }, [services, categories]);

  // Filter services locally for instant speed
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Search filter
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.serviceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.category?.name && service.category.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategorySlug === "all" ||
        service.category?.slug === selectedCategorySlug;

      // Featured filter
      const matchesFeatured = !showOnlyFeatured || service.isFeatured;

      // Status filter
      const matchesStatus =
        statusFilter === "all" || service.status === statusFilter;

      // Active state check
      const matchesActive = service.isActive;

      return matchesSearch && matchesCategory && matchesFeatured && matchesStatus && matchesActive;
    });
  }, [services, searchQuery, selectedCategorySlug, showOnlyFeatured, statusFilter]);

  // Chunk filtered services into rows
  const serviceRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredServices.length; i += columns) {
      rows.push(filteredServices.slice(i, i + columns));
    }
    return rows;
  }, [filteredServices, columns]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Virtualized row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowServices = serviceRows[index];

    return (
      <div style={style} className="px-1 py-3">
        <div
          className={`grid gap-6 h-full`}
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}
        >
          {rowServices.map(service => (
            <div
              key={service.id}
              onClick={() => setSelectedServiceId(service.id)}
              className="bg-white/80 backdrop-blur-xl border border-slate-100/90 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-[#FF9900]/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col group relative overflow-hidden h-full justify-between"
            >
              {/* Featured Badge Star */}
              {service.isFeatured && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-500 to-orange-500 text-white pl-4 pr-3 py-1.5 rounded-bl-[1.5rem] flex items-center justify-center shadow-md">
                  <Star size={12} className="fill-white stroke-none" />
                </div>
              )}

              <div>
                {/* Header: Icon & Title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center p-2.5 border border-slate-100 flex-shrink-0 relative">
                    <img
                      src={`${API_URL}${service.iconUrl}`}
                      alt={service.name}
                      onError={(e) => {
                        // Fallback in case icon fails to load
                        (e.currentTarget as HTMLImageElement).src = "/uploads/services/fallback.svg";
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="truncate pr-6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {service.serviceCode}
                      </span>
                      {service.status !== "GA" && (
                        <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-amber-50 text-amber-600 rounded-md border border-amber-100 leading-none">
                          {service.status}
                        </span>
                      )}
                    </div>
                    <h4 className="text-[15px] font-black text-slate-800 tracking-tight mt-0.5 truncate group-hover:text-[#FF9900] transition-colors">
                      {service.name}
                    </h4>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[12px] font-medium text-slate-500 leading-relaxed mb-4 line-clamp-3">
                  {service.shortDescription}
                </p>
              </div>

              {/* Bottom Footer Details */}
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span className="text-[10px] px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100/50 text-slate-500 font-bold truncate max-w-[150px]">
                  {service.category?.name || "AWS Core"}
                </span>
                <span className="text-[#FF9900] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex items-center gap-1">
                  View <BookOpen size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="w-full min-h-screen py-24 px-10 bg-[#F8F9FA] relative flex flex-col items-center">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(255,153,0,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div ref={containerRef} className="max-w-7xl w-full flex flex-col gap-10 z-10">
        {/* Statistics and Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-4 py-1.5 bg-[#FF9900]/10 text-[#FF9900] text-[10px] font-black uppercase tracking-widest rounded-full">
                AWS Services Directory
              </span>
              <Sparkles size={16} className="text-[#FF9900] animate-pulse" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              AWS Services Catalog
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              Comprehensive reference covering major AWS global cloud service offerings.
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/60 border border-slate-100 rounded-3xl p-4 shadow-sm backdrop-blur-md">
            <div className="px-4 py-2 border-r border-slate-100/80">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Services</span>
              <span className="text-xl font-black text-slate-800">{stats.total}</span>
            </div>
            <div className="px-4 py-2 sm:border-r border-slate-100/80">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Categories</span>
              <span className="text-xl font-black text-slate-800">{stats.categoriesCount}</span>
            </div>
            <div className="px-4 py-2 border-r border-slate-100/80">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Featured</span>
              <span className="text-xl font-black text-orange-500">{stats.featured}</span>
            </div>
            <div className="px-4 py-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Active GA</span>
              <span className="text-xl font-black text-emerald-500">{stats.active}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white/80 border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col gap-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by service code, name, category, or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-2xl text-sm font-semibold tracking-tight transition-all text-slate-800 shadow-inner shadow-slate-100/10"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-[#FF9900] focus:outline-none rounded-2xl text-xs font-black uppercase tracking-wider text-slate-600 cursor-pointer transition-all"
              >
                <option value="all">All Launch Statuses</option>
                <option value="GA">General Availability (GA)</option>
                <option value="Preview">Preview</option>
                <option value="Beta">Beta</option>
                <option value="Deprecated">Deprecated</option>
              </select>
            </div>

            {/* Featured Only Checkbox Switch */}
            <div className="lg:col-span-3 flex items-center justify-start lg:justify-center">
              <button
                onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-wider ${showOnlyFeatured ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-600"}`}
              >
                <Star size={14} className={showOnlyFeatured ? "fill-amber-600 stroke-none" : "text-slate-400"} />
                <span>Featured Services Only</span>
              </button>
            </div>
          </div>

          {/* Category Pill Filters */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layers size={12} /> Filter by Cloud Category
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 premium-scrollbar max-w-full">
              <button
                onClick={() => setSelectedCategorySlug("all")}
                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider flex-shrink-0 border transition-all ${selectedCategorySlug === "all" ? "bg-[#FF9900] border-[#FF9900] text-white shadow-md shadow-orange-500/15" : "bg-slate-50/50 hover:bg-slate-100/80 border-slate-100 text-slate-600"}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider flex-shrink-0 border transition-all ${selectedCategorySlug === cat.slug ? "bg-[#FF9900] border-[#FF9900] text-white shadow-md shadow-orange-500/15" : "bg-slate-50/50 hover:bg-slate-100/80 border-slate-100 text-slate-600"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Virtualized Grid Content */}
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading AWS Catalog...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50/50 border border-red-100 rounded-3xl p-8 text-center text-red-600 text-sm font-semibold">
            {error}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-12 text-center shadow-sm">
            <HelpCircle size={40} className="text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-black text-slate-800 tracking-tight mb-1">No services found</h4>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto">
              We couldn't find any services matching your search or filters. Try adjusting your queries.
            </p>
          </div>
        ) : (
          <div className="w-full flex-grow min-h-[500px]">
            <List
              rowCount={serviceRows.length}
              rowHeight={220}
              rowComponent={Row as any}
              rowProps={{}}
              style={{ height: 700, width: "100%" }}
              className="premium-scrollbar"
            />
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {selectedServiceId && (
        <ServiceDetailsModal
          id={selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
          onNavigateService={(id) => {
            setSelectedServiceId(id);
          }}
          allServices={services}
        />
      )}
    </section>
  );
}
