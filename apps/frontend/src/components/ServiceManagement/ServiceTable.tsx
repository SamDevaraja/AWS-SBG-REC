"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Edit2,
  Copy,
  Trash2,
  Download,
  Upload,
  Star,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  FileCode,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { AWSServiceSummary, exportServices, importServices } from "@/lib/api";

interface ServiceTableProps {
  services: AWSServiceSummary[];
  onEditClick: (service: AWSServiceSummary) => void;
  onCloneClick: (service: AWSServiceSummary) => void;
  onDeleteClick: (service: AWSServiceSummary) => void;
  onRefresh: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function ServiceTable({
  services,
  onEditClick,
  onCloneClick,
  onDeleteClick,
  onRefresh,
  showToast
}: ServiceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const itemsPerPage = 10;

  // Derive unique categories from active services list
  const categoriesList = useMemo(() => {
    const map = new Map<string, string>();
    services.forEach(s => {
      if (s.category) {
        map.set(s.category.slug, s.category.name);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [services]);

  // Filter services locally
  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.serviceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || s.category?.slug === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, categoryFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Export handlers
  const handleExport = async (format: "json" | "csv") => {
    try {
      showToast(`Generating ${format.toUpperCase()} export...`, "success");
      const blob = await exportServices(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aws-services-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Data exported successfully", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Export failed: ${err.message}`, "error");
    }
  };

  // Bulk Import handler
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "json" && ext !== "csv") {
      showToast("Only CSV and JSON files are supported for import.", "error");
      return;
    }

    const format = ext as "json" | "csv";

    try {
      showToast("Reading import file...", "success");
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          showToast("Importing services into registry...", "success");
          const result = await importServices(text, format);
          showToast(`Successfully imported ${result.count} services`, "success");
          onRefresh();
        } catch (err: any) {
          showToast(`Import failed: ${err.message}`, "error");
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      showToast(`File read failed: ${err.message}`, "error");
    }

    // Reset input value to allow uploading same file again
    e.target.value = "";
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search, Filter, and Bulk Import/Export Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-sm">
        {/* Left Side: Filtering */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-[#FF9900] focus:bg-white focus:outline-none rounded-xl text-xs font-semibold tracking-tight transition-all text-slate-800"
            />
          </div>

          <div className="relative w-full sm:w-56">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-[#FF9900] focus:outline-none rounded-xl text-xs font-extrabold uppercase tracking-wider text-slate-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Export / Import Operations */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* JSON Export */}
          <button
            onClick={() => handleExport("json")}
            className="px-5 py-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-2 transition-all shadow-sm"
          >
            <FileCode size={14} className="text-blue-500" /> Export JSON
          </button>

          {/* CSV Export */}
          <button
            onClick={() => handleExport("csv")}
            className="px-5 py-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-2 transition-all shadow-sm"
          >
            <FileSpreadsheet size={14} className="text-emerald-500" /> Export CSV
          </button>

          {/* Bulk Import */}
          <label className="px-5 py-3 bg-slate-900 hover:bg-[#FF9900] text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-sm">
            <Upload size={14} /> Bulk Import File
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Services Table List */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                <th className="py-5 px-8">Icon</th>
                <th className="py-5 px-6">Code</th>
                <th className="py-5 px-6">Service Name</th>
                <th className="py-5 px-6">Category</th>
                <th className="py-5 px-6">Launch Status</th>
                <th className="py-5 px-6 text-center">Featured</th>
                <th className="py-5 px-6 text-center">Active</th>
                <th className="py-5 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {paginatedItems.map(service => (
                <tr key={service.id} className="hover:bg-slate-50/40 transition-colors group">
                  {/* Icon */}
                  <td className="py-4.5 px-8">
                    <div className="w-10 h-10 rounded-xl bg-slate-100/60 p-2 border border-slate-200/50 flex items-center justify-center">
                      <img
                        src={`${API_URL}${service.iconUrl}`}
                        alt={service.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/uploads/services/fallback.svg";
                        }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </td>

                  {/* Service Code */}
                  <td className="py-4.5 px-6">
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] uppercase font-bold">
                      {service.serviceCode}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-4.5 px-6">
                    <div className="max-w-[200px] truncate">
                      <p className="font-extrabold text-slate-900 leading-tight">{service.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{service.shortDescription}</p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4.5 px-6">
                    <span className="text-[10px] px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 font-bold uppercase tracking-wider">
                      {service.category?.name || "AWS Core"}
                    </span>
                  </td>

                  {/* Launch Status */}
                  <td className="py-4.5 px-6">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md border ${
                      service.status === "GA"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : service.status === "Preview" || service.status === "Beta"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-red-50 text-red-600 border-red-100"
                    }`}>
                      {service.status}
                    </span>
                  </td>

                  {/* Featured */}
                  <td className="py-4.5 px-6 text-center">
                    <div className="flex justify-center">
                      {service.isFeatured ? (
                        <Star size={16} className="fill-amber-400 stroke-none" />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </div>
                  </td>

                  {/* Active */}
                  <td className="py-4.5 px-6 text-center">
                    <div className="flex justify-center">
                      {service.isActive ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-slate-300" />
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4.5 px-8 text-right">
                    <div className="flex items-center justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Edit */}
                      <button
                        onClick={() => onEditClick(service)}
                        className="p-2 bg-slate-50 border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer transition-all"
                        title="Edit Service"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Clone */}
                      <button
                        onClick={() => onCloneClick(service)}
                        className="p-2 bg-slate-50 border border-slate-100 hover:border-slate-200 text-[#FF9900] hover:text-[#E08800] rounded-xl hover:bg-orange-50/50 cursor-pointer transition-all"
                        title="Clone Service"
                      >
                        <Copy size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteClick(service)}
                        className="p-2 bg-slate-50 border border-slate-100 hover:border-red-200 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50/50 cursor-pointer transition-all"
                        title="Delete Service"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty Search State */}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 font-semibold">
            No AWS services found matching your criteria.
          </div>
        )}

        {/* Pagination Controls */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>
            Showing <span className="text-slate-800 font-black">{filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{" "}
            <span className="text-slate-800 font-black">
              {Math.min(currentPage * itemsPerPage, filtered.length)}
            </span>{" "}
            of <span className="text-slate-800 font-black">{filtered.length}</span> services
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 border border-slate-200 rounded-xl flex items-center justify-center transition-all ${
                currentPage === 1
                  ? "bg-slate-100/50 text-slate-300 cursor-not-allowed border-slate-100"
                  : "bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
              }`}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3">
              Page <span className="text-slate-800 font-black">{currentPage}</span> of <span className="text-slate-800 font-black">{totalPages}</span>
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 border border-slate-200 rounded-xl flex items-center justify-center transition-all ${
                currentPage === totalPages
                  ? "bg-slate-100/50 text-slate-300 cursor-not-allowed border-slate-100"
                  : "bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
