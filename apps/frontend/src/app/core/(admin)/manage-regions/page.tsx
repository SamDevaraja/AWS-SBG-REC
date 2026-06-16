"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, Shield, CheckCircle, AlertCircle, RefreshCw, X, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchCategories, fetchRegions, createRegion, updateRegion, deleteRegion,
  fetchServices, fetchServiceCategories, fetchServiceDetails, createService, updateService, deleteService,
  AWSRegionData, CategoryData, AWSServiceSummary, AWSServiceCategory
} from '@/lib/api';
import RegionTable from '@/components/RegionManagement/RegionTable';
import RegionForm from '@/components/RegionManagement/RegionForm';
import GlobeScene from '@/components/Globe/GlobeScene';
import ServiceTable from '@/components/ServiceManagement/ServiceTable';
import ServiceForm from '@/components/ServiceManagement/ServiceForm';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function ManageRegionsPage() {
  const [regions, setRegions] = useState<AWSRegionData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard view tab
  const [activeTab, setActiveTab] = useState<'regions' | 'services'>('regions');

  // Services list states
  const [services, setServices] = useState<AWSServiceSummary[]>([]);
  const [serviceCategories, setServiceCategories] = useState<AWSServiceCategory[]>([]);

  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<AWSRegionData | null>(null);
  
  // Service form states
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  
  // Delete confirm states
  const [deletingRegion, setDeletingRegion] = useState<AWSRegionData | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Service delete states
  const [deletingService, setDeletingService] = useState<AWSServiceSummary | null>(null);
  const [isServiceDeleteConfirmOpen, setIsServiceDeleteConfirmOpen] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState<ToastState | null>(null);

  // Coordinate Preview state
  const [previewData, setPreviewData] = useState<{ name: string; latitude: number; longitude: number; flag: string | null } | null>(null);

  // Construct temporary preview region list for Globe scene rendering
  const previewRegionsList = useMemo(() => {
    if (!previewData) return [];
    const tempRegion: AWSRegionData = {
      id: "preview-temp",
      dbId: "preview-temp",
      name: previewData.name || "Preview Location",
      code: "PREVIEW",
      lat: previewData.latitude,
      lng: previewData.longitude,
      category: "Preview",
      categoryId: "preview",
      flag: previewData.flag || "📍",
      flagUrl: previewData.flag || null,
      displayOrder: 9999,
      infrastructure: "Coordinates Location Verification Preview.",
      services: [],
      benefits: [],
      aiCapabilities: [],
      topServices: [],
      workloads: [],
      availabilityZones: 1,
      launchYear: 2026,
      primaryLocation: "Preview Location",
      compliance: "Preview",
      totalServices: "0",
      aimlServices: "0",
      analyticsServices: "0",
      networkingServices: "0",
      edgeLocations: "0",
      directConnect: "Preview",
      reach: "Preview",
      latency: "Preview"
    };
    return [tempRegion];
  }, [previewData]);

  // Load categories and regions from database
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [catsData, regsData, servicesData, serviceCatsData] = await Promise.all([
        fetchCategories(),
        fetchRegions(),
        fetchServices(),
        fetchServiceCategories()
      ]);
      setCategories(catsData);
      setRegions(regsData);
      setServices(servicesData);
      setServiceCategories(serviceCatsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load database items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Prepopulate form for edit
  const handleEditClick = (region: AWSRegionData) => {
    setEditingRegion(region);
    setIsFormOpen(true);
  };

  // Open empty form for add
  const handleAddClick = () => {
    setEditingRegion(null);
    setIsFormOpen(true);
  };

  // Form submission handler
  const handleFormSubmit = async (payload: any) => {
    if (editingRegion) {
      await updateRegion(editingRegion.dbId, payload);
      showToast("AWS Region updated successfully", "success");
    } else {
      await createRegion(payload);
      showToast("New AWS Region created successfully", "success");
    }
    setIsFormOpen(false);
    loadData();
  };

  // Trigger soft delete
  const handleDeleteClick = (region: AWSRegionData) => {
    setDeletingRegion(region);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRegion) return;
    try {
      await deleteRegion(deletingRegion.dbId);
      showToast(`AWS Region ${deletingRegion.id} deleted successfully`, "success");
      setIsDeleteConfirmOpen(false);
      setDeletingRegion(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete region", "error");
    }
  };

  // Service Add Trigger
  const handleServiceAddClick = () => {
    setEditingService(null);
    setIsServiceFormOpen(true);
  };

  // Service Edit Trigger
  const handleServiceEditClick = async (service: AWSServiceSummary) => {
    try {
      setLoading(true);
      const details = await fetchServiceDetails(service.id);
      setEditingService(details);
      setIsServiceFormOpen(true);
    } catch (err: any) {
      showToast(`Failed to load service details: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Service Clone Trigger
  const handleServiceCloneClick = async (service: AWSServiceSummary) => {
    try {
      setLoading(true);
      const details = await fetchServiceDetails(service.id);
      const cloned = {
        ...details,
        id: undefined, // Reset identifier
        serviceCode: `${details.serviceCode}-copy`,
        name: `${details.name} (Copy)`,
        slug: `${details.slug}-copy`
      };
      setEditingService(cloned);
      setIsServiceFormOpen(true);
    } catch (err: any) {
      showToast(`Failed to clone service: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Service Form Submission
  const handleServiceFormSubmit = async (payload: any) => {
    if (editingService && editingService.id) {
      await updateService(editingService.id, payload);
      showToast("AWS Service updated successfully", "success");
    } else {
      await createService(payload);
      showToast("New AWS Service created successfully", "success");
    }
    setIsServiceFormOpen(false);
    loadData();
  };

  // Service Delete Triggers
  const handleServiceDeleteClick = (service: AWSServiceSummary) => {
    setDeletingService(service);
    setIsServiceDeleteConfirmOpen(true);
  };

  const confirmServiceDelete = async () => {
    if (!deletingService) return;
    try {
      await deleteService(deletingService.id);
      showToast(`AWS Service ${deletingService.name} archived successfully`, "success");
      setIsServiceDeleteConfirmOpen(false);
      setDeletingService(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete service", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] font-jakarta pb-16 relative overflow-x-hidden">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(190,227,237,0.1)_0%,transparent_50%)]" />
      </div>

      {/* COMPACT NAV BAR */}
      <nav className="w-full h-20 px-12 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 left-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center text-slate-800 shadow-sm text-lg backdrop-blur-md">
            🔧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900 leading-none">Region Control Center</h2>
              <span className="text-[8px] font-black uppercase text-[#0073BB] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded tracking-wider">
                CORE DASHBOARD
              </span>
            </div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">AWS Region Node Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/core/manage-categories"
            className="px-6 py-2.5 rounded-xl bg-[#0073BB]/10 hover:bg-[#0073BB]/20 text-[#0073BB] border border-[#0073BB]/20 shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-300 hover:shadow-md"
          >
            <span>Manage Categories</span>
          </Link>
          
          <Link
            href="/services"
            className="px-6 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer group transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-0.5" /> 
            <span>Back to Explorer</span>
          </Link>
        </div>
      </nav>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border animate-slide-up ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-red-50 text-red-800 border-red-100'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
          <p className="text-[12px] font-extrabold uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      {/* DASHBOARD CONTENT CONTAINER */}
      <main className="max-w-[1280px] mx-auto px-8 pt-12 relative z-10">
        
        {/* TABS SELECTOR SWITCH */}
        <div className="flex border-b border-slate-200 mb-8 select-none">
          <button
            onClick={() => setActiveTab('regions')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'regions'
                ? 'border-[#0073BB] text-[#0073BB]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Presence Regions
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'services'
                ? 'border-[#FF9900] text-[#FF9900]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            AWS Services Catalog
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          {activeTab === 'regions' ? (
            <>
              <div>
                <h1 className="text-4xl font-black text-[#1A1C1E] tracking-tight">Active Region Nodes</h1>
                <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-2">Create, modify, and delete AWS presence mesh nodes</p>
              </div>

              <button
                onClick={handleAddClick}
                className="px-8 py-4 bg-[#1A1C1E] hover:bg-[#0073BB] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus size={16} /> Add Presence Node
              </button>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-4xl font-black text-[#1A1C1E] tracking-tight">AWS Services Catalog</h1>
                <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-2">Manage AWS global service catalog offerings</p>
              </div>

              <button
                onClick={handleServiceAddClick}
                className="px-8 py-4 bg-[#1A1C1E] hover:bg-[#FF9900] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus size={16} /> Add AWS Service
              </button>
            </>
          )}
        </div>

        {/* LOADING / ERROR STATES */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="animate-spin text-slate-400" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying registry database...</p>
          </div>
        )}

        {error && (
          <div className="py-20 text-center bg-white border border-slate-100 rounded-[2.5rem] p-10 max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-slate-900 font-black text-xl mb-2">Sync Error</h3>
            <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 uppercase tracking-wider">{error}</p>
            <button 
              onClick={loadData}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* REGIONS OR SERVICES LIST VIEW */}
        {activeTab === 'regions' ? (
          <>
            {!loading && !error && regions.length === 0 && (
              <div className="py-24 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                <Shield size={48} className="text-slate-200 mx-auto mb-6" />
                <h3 className="text-slate-950 font-black text-xl">Database Empty</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">No active presence nodes in this partition mesh</p>
              </div>
            )}

            {!loading && !error && regions.length > 0 && (
              <RegionTable 
                regions={regions} 
                onEditClick={handleEditClick} 
                onDeleteClick={handleDeleteClick} 
              />
            )}
          </>
        ) : (
          <>
            {!loading && !error && services.length === 0 && (
              <div className="py-24 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                <Shield size={48} className="text-slate-200 mx-auto mb-6" />
                <h3 className="text-slate-950 font-black text-xl">Catalog Empty</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">No active AWS services in this catalog partition</p>
              </div>
            )}

            {!loading && !error && services.length > 0 && (
              <ServiceTable 
                services={services} 
                onEditClick={handleServiceEditClick}
                onCloneClick={handleServiceCloneClick}
                onDeleteClick={handleServiceDeleteClick}
                onRefresh={loadData}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* REUSABLE FORM DRAWER PANEL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dark overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />

            {/* Sliding Form Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col z-10 border-l border-slate-100 overflow-hidden"
            >
              {/* Header */}
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingRegion ? `Edit ${editingRegion.id} Node` : 'Register Presence Node'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure database metrics</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-950 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Component */}
              <RegionForm 
                categories={categories}
                editingRegion={editingRegion}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
                onPreviewLocation={(name, lat, lng, flag) => {
                  setPreviewData({ name, latitude: lat, longitude: lng, flag });
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG MODAL */}
      <AnimatePresence>
        {isDeleteConfirmOpen && deletingRegion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />

            {/* Dialog panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-slate-100 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100 animate-pulse">
                <Trash2 size={24} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Decommission AWS Node</h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8 uppercase tracking-wider">
                Are you sure you want to decommission presence node <span className="text-slate-950 font-black">{deletingRegion.id}</span>?<br />
                This action is reversible through database recovery but will hide the node from the explorer interface.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-200"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COORDINATE PREVIEW DIALOG MODAL */}
      <AnimatePresence>
        {previewData && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewData(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-2xl w-full h-[650px] shadow-2xl z-10 flex flex-col items-center overflow-hidden"
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-4 select-none">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Location Verification Preview</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Visualizing input coordinates on standard Earth sphere
                  </p>
                </div>
                <button 
                  onClick={() => setPreviewData(null)}
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-950 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Coordinates Info Panel */}
              <div className="w-full grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/50 mb-4 text-xs font-bold text-slate-600">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Target Coordinates</span>
                  <p className="font-mono text-slate-900">Lat: {previewData.latitude.toFixed(6)}, Lng: {previewData.longitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Resolved Node Name</span>
                  <p className="text-[#0073BB] font-black">{previewData.name}</p>
                </div>
              </div>

              {/* Globe Scene Container */}
              <div className="w-full flex-grow relative bg-[#F8F9FA] rounded-[1.75rem] border border-slate-100 overflow-hidden shadow-inner flex items-center justify-center mb-6">
                <div className="w-full h-full absolute flex items-center justify-center">
                  <div className="w-[500px] h-[500px] relative">
                    <GlobeScene
                      regions={previewRegionsList}
                      onSelectRegion={() => {}}
                      selectedRegion={previewRegionsList[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Close Button */}
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="w-full py-4 bg-[#1A1C1E] hover:bg-[#0073BB] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Close Location Verification
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SERVICE DRAWER FORM */}
      <AnimatePresence>
        {isServiceFormOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServiceFormOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col z-10 border-l border-slate-100 overflow-hidden"
            >
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingService && editingService.id ? `Edit ${editingService.serviceCode} Offering` : 'Register AWS Service'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure database service parameters</p>
                </div>
                <button 
                  onClick={() => setIsServiceFormOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-950 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <ServiceForm 
                categories={serviceCategories}
                editingService={editingService}
                onSubmit={handleServiceFormSubmit}
                onCancel={() => setIsServiceFormOpen(false)}
                allServices={services}
                showToast={showToast}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SERVICE DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {isServiceDeleteConfirmOpen && deletingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServiceDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-slate-100 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100 animate-pulse">
                <Trash2 size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Decommission Service</h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8 uppercase tracking-wider">
                Are you sure you want to decommission service <span className="text-slate-950 font-black">{deletingService.name}</span>?<br />
                This will hide the service from catalog views but preserve database integrity.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setIsServiceDeleteConfirmOpen(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmServiceDelete}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-200"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
