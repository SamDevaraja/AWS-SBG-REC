"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Shield, CheckCircle, AlertCircle, RefreshCw, X, Trash2, Edit2, Upload, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory, uploadFlag,
  CategoryData
} from '@/lib/api';
import FlagImage from '@/components/Layout/FlagImage';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  // Delete confirm states
  const [deletingCategory, setDeletingCategory] = useState<CategoryData | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<ToastState | null>(null);

  // Load categories from database (including inactive ones)
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories(true);
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load categories.");
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
  const handleEditClick = (category: CategoryData) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  // Open empty form for add
  const handleAddClick = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  // Trigger soft delete
  const handleDeleteClick = (category: CategoryData) => {
    setDeletingCategory(category);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      showToast(`Category '${deletingCategory.name}' deleted successfully`, "success");
      setIsDeleteConfirmOpen(false);
      setDeletingCategory(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete category", "error");
    }
  };

  const handleToggleActive = async (category: CategoryData) => {
    try {
      const nextActive = !category.isActive;
      await updateCategory(category.id, { isActive: nextActive });
      showToast(`Category '${category.name}' ${nextActive ? 'activated' : 'deactivated'} successfully`, "success");
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to toggle active state", "error");
    }
  };

  const handleFormSubmit = async (payload: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        showToast("Category updated successfully", "success");
      } else {
        await createCategory(payload);
        showToast("New Category created successfully", "success");
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save category.", "error");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '40px 24px 64px', position: 'relative', overflow: 'hidden' }}>

      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(190,227,237,0.1)_0%,transparent_50%)]" />
      </div>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border backdrop-blur-md animate-slide-up ${
          toast.type === 'success'
            ? 'bg-emerald-50/95 text-emerald-800 border-emerald-100/80'
            : 'bg-red-50/95 text-red-800 border-red-100/80'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={15} className="text-emerald-500" /> : <AlertCircle size={15} className="text-red-500" />}
          <p className="text-[11px] font-semibold uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      {/* DASHBOARD CONTENT CONTAINER */}
      <main style={{ maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">AWS Geographic Categories</h1>
            <p className="text-slate-400 text-[10px] font-medium tracking-[0.05em] uppercase mt-2">Create, modify, order, and archive explorer category filters</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/core/manage-regions"
              className="px-6 py-2.5 bg-white hover:bg-slate-50/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-lg font-bold uppercase text-[11px] tracking-wider flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer text-center duration-200"
            >
              <Globe size={13} className="text-slate-500" />
              Manage Regions
            </Link>
            <button
              onClick={handleAddClick}
              className="px-6 py-2.5 bg-slate-950 hover:bg-[#0073BB] text-white rounded-lg font-bold uppercase text-[11px] tracking-wider flex items-center gap-2 transition-all shadow-md hover:shadow-[0_4px_16px_rgba(0,115,187,0.2)] hover:-translate-y-0.5 duration-200 cursor-pointer"
            >
              <Plus size={14} /> Add Category
            </button>
          </div>
        </div>

        {/* LOADING / ERROR STATES */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="animate-spin text-slate-400" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying categories database...</p>
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

        {/* CATEGORIES TABLE */}
        {!loading && !error && categories.length === 0 && (
          <div className="py-24 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
            <Shield size={48} className="text-slate-200 mx-auto mb-6" />
            <h3 className="text-slate-950 font-black text-xl">Categories Empty</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">No categories present in the database</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="bg-white border border-slate-100/80 rounded-[2.5rem] shadow-[0_12px_40px_-15px_rgba(0,0,0,0.03)] overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] bg-slate-50/80 backdrop-blur-sm select-none">
                    <th className="py-3.5 px-8">Flag</th>
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Slug ID</th>
                    <th className="py-3.5 px-6 text-center">Display Order</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/30 transition-all duration-200 text-[13px] font-semibold text-slate-600 border-b border-slate-50/60 last:border-b-0">
                      <td className="py-3 px-8 select-none">
                        <div className="w-12 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm hover:scale-105 transition-transform duration-200">
                          <FlagImage flag={cat.flag} name={cat.name} className="w-9 h-6 object-contain" />
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 text-[14px] tracking-tight">{cat.name}</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">AWS Geographic Zone</span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className="inline-flex items-center font-mono text-[11px] bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md font-bold tracking-tight shadow-sm select-all">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="mx-auto flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-mono font-black text-slate-600 shadow-inner">
                          {cat.displayOrder}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-200 shadow-sm cursor-pointer ${cat.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80 hover:shadow-md'
                              : 'bg-slate-50 text-slate-500 border-slate-200/80 hover:bg-slate-100 hover:shadow-md'
                            }`}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-8 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleEditClick(cat)}
                            title="Edit Category"
                            className="p-3 rounded-xl border border-slate-200/60 bg-white text-slate-500 hover:text-[#0073BB] hover:bg-[#0073BB]/5 hover:border-[#0073BB]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(cat)}
                            title="Archive Category"
                            className="p-3 rounded-xl border border-red-100 bg-red-50/20 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* FORM DRAWER PANEL */}
      <AnimatePresence>
        {isFormOpen && (
          <CategoryFormDrawer
            editingCategory={editingCategory}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* DELETE DIALOG MODAL */}
      <AnimatePresence>
        {isDeleteConfirmOpen && deletingCategory && (
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
              className="relative bg-white border border-slate-100/80 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100 animate-pulse">
                <Trash2 size={24} />
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">Decommission Category</h3>
              <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-8">
                Are you sure you want to archive category <span className="text-slate-950 font-bold">"{deletingCategory.name}"</span>?<br />
                This will soft-delete the category. Active regions in this category will not be displayed in the sidebar if their category is archived.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all shadow-md hover:shadow-lg hover:shadow-red-200/50 hover:-translate-y-0.5 cursor-pointer duration-200"
                >
                  Confirm Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CategoryFormDrawerProps {
  editingCategory: CategoryData | null;
  onSubmit: (payload: any) => Promise<void>;
  onCancel: () => void;
}

function CategoryFormDrawer({ editingCategory, onSubmit, onCancel }: CategoryFormDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    flag: '',
    displayOrder: 0,
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        slug: editingCategory.slug,
        flag: editingCategory.flag,
        displayOrder: editingCategory.displayOrder,
        isActive: editingCategory.isActive
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        flag: '',
        displayOrder: 0,
        isActive: true
      });
    }
    setErrors([]);
    setUploadError(null);
  }, [editingCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: type === 'checkbox'
          ? checked
          : (name === 'displayOrder' ? Number(value) : value)
      };

      // Auto-generate slug from name if creating a new category and slug hasn't been manually altered
      if (name === 'name' && !editingCategory) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      return next;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size exceeds 5MB limit.");
      return;
    }

    const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only SVG, PNG, JPG, JPEG, and WEBP formats are supported.");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadFlag(file);
      setFormData(prev => ({ ...prev, flag: result.url }));
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload flag.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    const formErrors = [];
    if (!formData.name.trim()) formErrors.push("Category name is required.");
    if (!formData.slug.trim()) formErrors.push("Category slug is required.");
    if (!/^[a-z0-9-]+$/.test(formData.slug)) formErrors.push("Slug must only contain lowercase alphanumeric characters and hyphens.");
    if (!formData.flag.trim()) formErrors.push("Flag (emoji or URL) is required.");

    if (formErrors.length > 0) {
      setErrors(formErrors);
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      console.error(err);
      setErrors([err.message || "An error occurred while saving."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
      />

      {/* Drawer */}
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
            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {editingCategory ? `Edit ${editingCategory.name}` : 'Register Category'}
            </h3>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Configure database category metrics</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-950 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto premium-scrollbar px-10 py-8 flex flex-col gap-6 pb-24">
          {errors.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs flex flex-col gap-2">
              <p className="font-bold flex items-center gap-1">Validation constraints violated:</p>
              <ul className="list-disc pl-5 font-medium flex flex-col gap-0.5">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* Form Fields */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Asia Pacific"
                required
                className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Category Slug * (Unique slug ID)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g. asia-pacific"
                required
                disabled={!!editingCategory}
                className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                placeholder="e.g. 1"
                className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#0073BB] border-slate-300 rounded focus:ring-[#0073BB]/20 focus:ring-opacity-25"
              />
              <label htmlFor="isActive" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 cursor-pointer">
                Activate category (visible in sidebar navigation)
              </label>
            </div>
          </div>

          {/* Flag Asset Management */}
          <div className="flex flex-col gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-200/50">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Category Flag Graphic (Emoji or SVG/PNG/JPG/WEBP)</label>

            <div className="flex items-center gap-6 mt-1">
              <div className="w-20 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                <FlagImage flag={formData.flag} name={formData.name} className="w-14 h-10 object-contain" />
              </div>

              <div className="flex-grow flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2.5 bg-[#1A1C1E] hover:bg-[#0073BB] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm disabled:bg-slate-400 cursor-pointer"
                  >
                    {uploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                    <span>Upload Flag Image</span>
                  </button>

                  <input
                    type="text"
                    name="flag"
                    value={formData.flag}
                    onChange={handleInputChange}
                    placeholder="Or type legacy emoji (e.g. 🇸🇬)"
                    required
                    className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
                  />
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".svg,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                />

                <p className="text-[9px] font-bold text-slate-400">Provide an emoji OR upload an SVG, PNG, JPG, or WEBP graphic file.</p>
              </div>
            </div>

            {uploadError && (
              <div className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Save Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-3 z-20">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-white hover:bg-slate-50/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer text-center duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-8 py-2.5 bg-slate-950 hover:bg-[#0073BB] disabled:bg-slate-400 text-white rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all shadow-md hover:shadow-[0_4px_16px_rgba(0,115,187,0.2)] hover:-translate-y-0.5 duration-200 cursor-pointer flex items-center gap-2"
            >
              {(submitting || uploading) && <RefreshCw className="animate-spin" size={12} />}
              <span>{editingCategory ? 'Save Changes' : 'Initialize Category'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
