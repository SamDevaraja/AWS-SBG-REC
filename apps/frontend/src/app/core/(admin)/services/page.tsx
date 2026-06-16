'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Cpu, Database, RefreshCw } from 'lucide-react';
import { AWSServiceSummary, AWSServiceCategory, fetchServices, fetchServiceCategories, fetchServiceDetails, createService, updateService, deleteService } from '@/lib/api';
import ServiceTable from '@/components/ServiceManagement/ServiceTable';
import ServiceForm from '@/components/ServiceManagement/ServiceForm';

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export default function CoreServicesManagementPage() {
  const [services, setServices] = useState<AWSServiceSummary[]>([]);
  const [categories, setCategories] = useState<AWSServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form mode: null = table view, 'create' = new, 'edit' = editing service
  const [formMode, setFormMode] = useState<null | 'create' | 'edit'>(null);
  const [editingService, setEditingService] = useState<any | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<AWSServiceSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [servicesData, categoriesData] = await Promise.all([
        fetchServices(),
        fetchServiceCategories(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err: any) {
      showToast(`Failed to load services: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditClick = async (service: AWSServiceSummary) => {
    try {
      setLoading(true);
      const details = await fetchServiceDetails(service.id);
      setEditingService(details);
      setFormMode('edit');
    } catch (err: any) {
      showToast(`Failed to load service details: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (payload: any) => {
    try {
      setLoading(true);
      if (formMode === 'edit' && editingService) {
        await updateService(editingService.id, payload);
        showToast('AWS Service updated successfully', 'success');
      } else {
        await createService(payload);
        showToast('AWS Service created successfully', 'success');
      }
      setFormMode(null);
      setEditingService(null);
      await loadData();
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      showToast(`"${deleteTarget.name}" archived successfully`, 'success');
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloneService = async (service: AWSServiceSummary) => {
    try {
      setLoading(true);
      const details = await fetchServiceDetails(service.id);
      setEditingService({
        ...details,
        id: undefined,
        name: `${details.name} (Copy)`,
        slug: `${details.slug}-copy`,
        serviceCode: `${details.serviceCode}-copy`,
      });
      setFormMode('create');
      showToast('Service cloned — modify details and save as new', 'success');
    } catch (err: any) {
      showToast(`Failed to clone service: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;
  const featuredServices = services.filter((s) => s.isFeatured).length;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto relative">
      {/* Toast Notification Stack */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-3.5 rounded-2xl shadow-xl text-xs font-black uppercase tracking-wider pointer-events-auto border ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Archive Service?</h3>
            <p className="text-sm text-slate-500 font-semibold mb-6">
              Are you sure you want to archive{' '}
              <span className="text-slate-800 font-black">{deleteTarget.name}</span>?
              This will soft-delete the service record.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Cpu className="w-6 h-6 text-[#FF9900]" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              AWS Services Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-semibold">
            Add, edit, and manage AWS service catalog entries. Core admin access only.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { setEditingService(null); setFormMode('create'); }}
            className="flex items-center gap-2 px-5 py-3 bg-[#FF9900] hover:bg-[#E08800] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-orange-500/20"
          >
            <Plus size={16} /> Add New Service
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Services', value: totalServices, color: 'text-slate-800', icon: <Database size={18} className="text-slate-400" /> },
          { label: 'Active Services', value: activeServices, color: 'text-emerald-600', icon: <Database size={18} className="text-emerald-400" /> },
          { label: 'Featured', value: featuredServices, color: 'text-amber-500', icon: <Database size={18} className="text-amber-400" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* Main Content: Table or Form */}
      {formMode ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {formMode === 'edit' ? 'Edit AWS Service' : 'Register New AWS Service'}
            </h2>
          </div>
          <ServiceForm
            editingService={editingService}
            categories={categories}
            onSubmit={handleFormSubmit}
            onCancel={() => { setFormMode(null); setEditingService(null); }}
            allServices={services}
            showToast={showToast}
          />
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Services Registry...</p>
        </div>
      ) : (
        <ServiceTable
          services={services}
          onEditClick={handleEditClick}
          onCloneClick={handleCloneService}
          onDeleteClick={(s) => setDeleteTarget(s)}
          onRefresh={loadData}
          showToast={showToast}
        />
      )}
    </div>
  );
}
