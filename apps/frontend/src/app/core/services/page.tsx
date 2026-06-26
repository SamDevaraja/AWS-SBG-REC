'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Cpu, Database, Star } from 'lucide-react';
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
            className={`px-5 py-3 rounded-xl shadow-lg text-xs font-semibold uppercase tracking-wider pointer-events-auto border ${
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Archive Service?</h3>
            <p className="text-sm text-slate-500 font-normal mb-6">
              Are you sure you want to archive{' '}
              <span className="text-slate-800 font-semibold">{deleteTarget.name}</span>?
              This will soft-delete the service record.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AWS Services Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-normal">
            Add, edit, and manage AWS service catalog entries. Core admin access only.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditingService(null); setFormMode('create'); }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#232F3E] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          {
            label: 'Total Services',
            value: totalServices,
            subtext: 'Registered catalog entries',
            icon: Database,
            iconColor: 'text-[#0073BB]',
            iconBg: 'bg-[#0073BB]/10 border border-[#0073BB]/20',
          },
          {
            label: 'Active Services',
            value: activeServices,
            subtext: 'Active operational workloads',
            icon: Cpu,
            iconColor: 'text-emerald-600',
            iconBg: 'bg-emerald-50 border border-emerald-100',
          },
          {
            label: 'Featured Services',
            value: featuredServices,
            subtext: 'Featured showcase resources',
            icon: Star,
            iconColor: 'text-amber-500',
            iconBg: 'bg-amber-50 border border-amber-100',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-md hover:border-[#FF9900]/30 hover:-translate-y-0.5 transition-all duration-300 ease-out group"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-455 font-heading">
                  {stat.label}
                </span>
                <span className="text-3xl font-bold text-slate-850 font-display tracking-tight my-0.5">
                  {stat.value}
                </span>
                <span className="text-[11px] font-medium text-slate-500 truncate">
                  {stat.subtext}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${stat.iconBg}`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content: Table or Form */}
      {formMode ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
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
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider animate-pulse">Loading Services Registry...</p>
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
