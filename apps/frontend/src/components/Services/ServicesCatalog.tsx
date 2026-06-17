"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { List } from "react-window";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Star,
  HelpCircle,
  Settings2
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

  // User role state
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aws_sgb_rec_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserRole((parsed?.role ?? "").toLowerCase().trim());
      }
    } catch { /* ignore */ }
  }, []);

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

  // Allowed major services list for Enthusiasts (30 major services requested by the user)
  const allowedEnthusiastServices = useMemo(() => new Set([
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
  ]), []);

  // Filter services by role restriction first
  const servicesForRole = useMemo(() => {
    const isEnthusiast = userRole !== "core" && userRole !== "crew";
    if (!isEnthusiast) return services;
    
    return services.filter(service => {
      const slugLower = service.slug.toLowerCase();
      const codeLower = service.serviceCode.toLowerCase();
      return allowedEnthusiastServices.has(slugLower) || allowedEnthusiastServices.has(codeLower);
    });
  }, [services, userRole, allowedEnthusiastServices]);

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
  }, [servicesForRole]);

  // Filter categories to only those containing services visible to the role
  const visibleCategories = useMemo(() => {
    const activeCategoryIds = new Set(servicesForRole.map(s => s.categoryId));
    return categories.filter(cat => activeCategoryIds.has(cat.id));
  }, [categories, servicesForRole]);

  // Statistics calculation based on role-filtered services
  const stats = useMemo(() => {
    const total = servicesForRole.length;
    const active = servicesForRole.filter(s => s.isActive).length;
    const featured = servicesForRole.filter(s => s.isFeatured).length;
    const categoriesCount = visibleCategories.length;

    return { total, active, featured, categoriesCount };
  }, [servicesForRole, visibleCategories]);

  // Filter services locally for instant speed
  const filteredServices = useMemo(() => {
    return servicesForRole.filter(service => {
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
  }, [servicesForRole, searchQuery, selectedCategorySlug, showOnlyFeatured, statusFilter]);

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
      <div style={style} className="px-1 py-2">
        <div
          className="grid gap-4 h-full"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {rowServices.map(service => (
            <div
              key={service.id}
              onClick={() => setSelectedServiceId(service.id)}
              className="bg-white border border-slate-200/60 rounded-xl p-5 hover:border-slate-300/85 hover:shadow-md hover:shadow-slate-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col group relative overflow-hidden h-full"
            >
              {/* Featured dot */}
              {service.isFeatured && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400" />
              )}

              {/* Icon + meta */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center p-2 border border-slate-200/50 flex-shrink-0">
                  <img
                    src={`${API_URL}${service.iconUrl}`}
                    alt={service.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/uploads/services/fallback.svg";
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{service.serviceCode}</span>
                    {service.status !== "GA" && (
                      <span className="px-1.5 py-0.5 text-[8px] font-semibold bg-amber-50 text-amber-500 rounded border border-amber-100 leading-none">
                        {service.status}
                      </span>
                    )}
                  </div>
                  <h4 className="text-[14px] font-semibold text-slate-800 truncate group-hover:text-[#FF9900] transition-colors leading-tight">
                    {service.name}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11.5px] text-slate-400 leading-relaxed line-clamp-2 flex-grow">
                {service.shortDescription}
              </p>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 truncate max-w-[60%]">
                  {service.category?.name || "AWS Core"}
                </span>
                <span className="text-[10px] font-medium text-[#FF9900] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                  View <BookOpen size={10} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="w-full min-h-screen py-10 px-10 bg-[#F8F9FA] relative flex flex-col items-center">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.05)_0%,transparent_55%)] pointer-events-none" />

      <div ref={containerRef} className="max-w-7xl w-full flex flex-col gap-7 z-10">

        {/* ── Header Row ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold text-[#FF9900] uppercase tracking-[0.2em] mb-1">AWS Services Directory</p>
            <div className="flex items-center gap-3">
              <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">AWS Services Catalog</h2>
              {userRole === "core" && (
                <Link
                  href="/core/services"
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition-all shadow-sm hover:-translate-y-0.5"
                >
                  <Settings2 size={12} />
                  Manage Services
                </Link>
              )}
            </div>
            <p className="text-[12px] text-slate-400 font-normal mt-0.5">
              Comprehensive reference covering major AWS global cloud service offerings.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Services</span>
              <span className="text-xl font-bold text-slate-800">{stats.total}</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Categories</span>
              <span className="text-xl font-bold text-slate-800">{stats.categoriesCount}</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Featured</span>
              <span className="text-xl font-bold text-orange-500">{stats.featured}</span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Active GA</span>
              <span className="text-xl font-bold text-emerald-500">{stats.active}</span>
            </div>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search by service code, name, category, or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-[13px] font-normal transition-all text-slate-700"
              />
            </div>

            {/* Status Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FF9900] focus:outline-none rounded-xl text-[12px] text-slate-600 cursor-pointer transition-all"
              >
                <option value="all">All Launch Statuses</option>
                <option value="GA">General Availability (GA)</option>
                <option value="Preview">Preview</option>
                <option value="Beta">Beta</option>
                <option value="Deprecated">Deprecated</option>
              </select>
            </div>

            {/* Featured Toggle */}
            <div className="lg:col-span-3">
              <button
                onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[12px] font-medium ${showOnlyFeatured ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-500"}`}
              >
                <Star size={13} className={showOnlyFeatured ? "fill-amber-500 stroke-none" : "text-slate-400"} />
                Featured Services Only
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Filter by Cloud Category</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 premium-scrollbar">
              <button
                onClick={() => setSelectedCategorySlug("all")}
                className={`px-4 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0 border transition-all ${selectedCategorySlug === "all" ? "bg-[#FF9900] border-[#FF9900] text-white" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                All Categories
              </button>
              {visibleCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0 border transition-all ${selectedCategorySlug === cat.slug ? "bg-[#FF9900] border-[#FF9900] text-white" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid / States ── */}
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-[3px] border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Loading AWS Catalog...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-500 text-sm">
            {error}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
            <HelpCircle size={36} className="text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-700 mb-1">No services found</h4>
            <p className="text-slate-400 text-[12px] max-w-sm mx-auto">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="w-full flex-grow min-h-[500px]">
            <List
              rowCount={serviceRows.length}
              rowHeight={190}
              rowComponent={Row as any}
              rowProps={{}}
              style={{ height: 700, width: "100%" }}
              className="premium-scrollbar"
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedServiceId && (
        <ServiceDetailsModal
          id={selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
          onNavigateService={(id) => {
            setSelectedServiceId(id);
          }}
          allServices={servicesForRole}
        />
      )}
    </section>
  );
}

