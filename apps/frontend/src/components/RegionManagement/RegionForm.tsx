"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Upload, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { AWSRegionData, CategoryData, uploadFlag } from '@/lib/api';
import FlagImage from '../Layout/FlagImage';

interface RegionFormProps {
  categories: CategoryData[];
  editingRegion: AWSRegionData | null;
  onSubmit: (payload: any) => Promise<void>;
  onCancel: () => void;
  onPreviewLocation?: (name: string, lat: number, lng: number, flag: string | null) => void;
}

export default function RegionForm({ categories, editingRegion, onSubmit, onCancel, onPreviewLocation }: RegionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    awsRegionCode: '',
    name: '',
    regionCode: '',
    flag: '',
    flagUrl: null as string | null,
    displayOrder: 0,
    latitude: 0,
    longitude: 0,
    categoryId: '',
    infrastructureDescription: '',
    availabilityZones: 3,
    launchYear: 2026,
    primaryLocation: '',
    compliance: '',
    totalServices: '200+',
    aimlServices: '30+',
    analyticsServices: '20+',
    networkingServices: '20+',
    edgeLocations: '10+',
    directConnect: 'Available',
    reach: 'Global',
    latency: 'Low',
    services: [] as string[],
    benefits: [] as string[],
    aiCapabilities: [] as string[],
    topServices: [] as string[],
    workloads: [] as string[]
  });

  const [formValidationErrors, setFormValidationErrors] = useState<{ field: string; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Prepopulate form on mount or editingRegion change
  useEffect(() => {
    if (editingRegion) {
      const matchingCat = categories.find(c => c.slug === editingRegion.categoryId);
      const categoryId = matchingCat ? matchingCat.id : (categories[0]?.id || '');
      setFormData({
        awsRegionCode: editingRegion.id,
        name: editingRegion.name,
        regionCode: editingRegion.code,
        flag: editingRegion.flag || '',
        flagUrl: editingRegion.flagUrl,
        displayOrder: editingRegion.displayOrder || 0,
        latitude: editingRegion.lat,
        longitude: editingRegion.lng,
        categoryId,
        infrastructureDescription: editingRegion.infrastructure || '',
        availabilityZones: editingRegion.availabilityZones || 3,
        launchYear: editingRegion.launchYear || 2026,
        primaryLocation: editingRegion.primaryLocation || '',
        compliance: editingRegion.compliance || '',
        totalServices: editingRegion.totalServices || '200+',
        aimlServices: editingRegion.aimlServices || '30+',
        analyticsServices: editingRegion.analyticsServices || '20+',
        networkingServices: editingRegion.networkingServices || '20+',
        edgeLocations: editingRegion.edgeLocations || '10+',
        directConnect: editingRegion.directConnect || 'Available',
        reach: editingRegion.reach || 'Global',
        latency: editingRegion.latency || 'Low',
        services: [...(editingRegion.services || [])],
        benefits: [...(editingRegion.benefits || [])],
        aiCapabilities: [...(editingRegion.aiCapabilities || [])],
        topServices: [...(editingRegion.topServices || [])],
        workloads: [...(editingRegion.workloads || [])]
      });
    } else {
      setFormData({
        awsRegionCode: '',
        name: '',
        regionCode: '',
        flag: '',
        flagUrl: null,
        displayOrder: 0,
        latitude: 0,
        longitude: 0,
        categoryId: categories[0]?.id || '',
        infrastructureDescription: '',
        availabilityZones: 3,
        launchYear: 2026,
        primaryLocation: '',
        compliance: '',
        totalServices: '200+',
        aimlServices: '30+',
        analyticsServices: '20+',
        networkingServices: '20+',
        edgeLocations: '10+',
        directConnect: 'Available',
        reach: 'Global',
        latency: 'Low',
        services: [],
        benefits: [],
        aiCapabilities: [],
        topServices: [],
        workloads: []
      });
    }
    setFormValidationErrors([]);
    setUploadError(null);
  }, [editingRegion, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' || name === 'availabilityZones' || name === 'launchYear' || name === 'displayOrder'
        ? Number(value)
        : value
    }));
  };

  // Dynamic Collections updates
  const handleAddService = () => {
    setFormData(prev => ({ ...prev, services: [...prev.services, ''] }));
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleServiceChange = (index: number, value: string) => {
    setFormData(prev => {
      const next = [...prev.services];
      next[index] = value;
      return { ...prev, services: next };
    });
  };

  const handleAddBenefit = () => {
    setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    setFormData(prev => {
      const next = [...prev.benefits];
      next[index] = value;
      return { ...prev, benefits: next };
    });
  };

  const handleAddAiCapability = () => {
    setFormData(prev => ({ ...prev, aiCapabilities: [...prev.aiCapabilities, ''] }));
  };

  const handleRemoveAiCapability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      aiCapabilities: prev.aiCapabilities.filter((_, i) => i !== index)
    }));
  };

  const handleAiCapabilityChange = (index: number, value: string) => {
    setFormData(prev => {
      const next = [...prev.aiCapabilities];
      next[index] = value;
      return { ...prev, aiCapabilities: next };
    });
  };

  const handleAddTopService = () => {
    setFormData(prev => ({ ...prev, topServices: [...prev.topServices, ''] }));
  };

  const handleRemoveTopService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topServices: prev.topServices.filter((_, i) => i !== index)
    }));
  };

  const handleTopServiceChange = (index: number, value: string) => {
    setFormData(prev => {
      const next = [...prev.topServices];
      next[index] = value;
      return { ...prev, topServices: next };
    });
  };

  const handleAddWorkload = () => {
    setFormData(prev => ({ ...prev, workloads: [...prev.workloads, ''] }));
  };

  const handleRemoveWorkload = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workloads: prev.workloads.filter((_, i) => i !== index)
    }));
  };

  const handleWorkloadChange = (index: number, value: string) => {
    setFormData(prev => {
      const next = [...prev.workloads];
      next[index] = value;
      return { ...prev, workloads: next };
    });
  };

  // Flag File Upload validation & execution
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate size (5 MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size exceeds 5MB limit.");
      return;
    }

    // Validate mime type
    const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only SVG, PNG, JPG, JPEG, and WEBP image formats are supported.");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadFlag(file);
      setFormData(prev => ({ ...prev, flagUrl: result.url }));
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload flag asset.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveUploadedFlag = () => {
    setFormData(prev => ({ ...prev, flagUrl: null }));
  };

  // Form submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormValidationErrors([]);

    // Validate input ranges
    const errors: { field: string; message: string }[] = [];
    if (formData.latitude < -90 || formData.latitude > 90) {
      errors.push({ field: 'latitude', message: 'Latitude must be between -90 and +90 degrees' });
    }
    if (formData.longitude < -180 || formData.longitude > 180) {
      errors.push({ field: 'longitude', message: 'Longitude must be between -180 and +180 degrees' });
    }
    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'Region name is required' });
    }
    if (!editingRegion && !formData.awsRegionCode.trim()) {
      errors.push({ field: 'awsRegionCode', message: 'AWS Region Code is required' });
    }

    if (errors.length > 0) {
      setFormValidationErrors(errors);
      setSubmitting(false);
      return;
    }

    // Filter out empty services and benefits
    const cleanPayload = {
      ...formData,
      services: formData.services.map(s => s.trim()).filter(s => s !== ''),
      benefits: formData.benefits.map(b => b.trim()).filter(b => b !== ''),
      aiCapabilities: formData.aiCapabilities.map(a => a.trim()).filter(a => a !== ''),
      topServices: formData.topServices.map(t => t.trim()).filter(t => t !== ''),
      workloads: formData.workloads.map(w => w.trim()).filter(w => w !== '')
    };

    try {
      await onSubmit(cleanPayload);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("already exists")) {
        setFormValidationErrors([{ field: 'awsRegionCode', message: err.message }]);
      } else {
        setFormValidationErrors([{ field: 'generic', message: err.message || "An error occurred while saving." }]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitForm} className="flex-grow overflow-y-auto premium-scrollbar px-10 py-8 flex flex-col gap-6 pb-24">
      {/* Error Summary */}
      {formValidationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs flex flex-col gap-2">
          <p className="font-bold flex items-center gap-1"><AlertCircle size={14} /> Validation Constraints Violated:</p>
          <ul className="list-disc pl-5 font-medium flex flex-col gap-0.5">
            {formValidationErrors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Identification Header */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] pb-2 border-b border-slate-50 uppercase">Identification</h4>

      <div className="grid grid-cols-2 gap-4">
        {/* AWS Region Code */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">AWS Region Code *</label>
          <input
            type="text"
            name="awsRegionCode"
            value={formData.awsRegionCode}
            onChange={handleInputChange}
            placeholder="e.g. us-east-1"
            required
            disabled={!!editingRegion}
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all disabled:opacity-60"
          />
        </div>

        {/* Region Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Display Name * (Max 80)</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. US East (N. Virginia)"
            maxLength={80}
            required
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Country Code */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Country Code * (e.g. US, CA, DE)</label>
          <input
            type="text"
            name="regionCode"
            value={formData.regionCode}
            onChange={handleInputChange}
            placeholder="e.g. US"
            required
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Legacy Emoji Flag */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Legacy Emoji Flag (e.g. 🇺🇸)</label>
          <input
            type="text"
            name="flag"
            value={formData.flag}
            onChange={handleInputChange}
            placeholder="e.g. 🇺🇸"
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Category select */}
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Presence Category *</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            required
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flag Upload Section */}
      <div className="flex flex-col gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-200/50">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Custom Flag Graphic (SVG, PNG, JPG, WEBP)</label>
        
        <div className="flex items-center gap-6 mt-1">
          {/* Live Flag Preview Container */}
          <div className="w-20 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
            <FlagImage flag={formData.flagUrl || formData.flag} name={formData.name} className="w-14 h-10 object-contain" />
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
                <span>Upload New Flag</span>
              </button>

              {formData.flagUrl && (
                <button
                  type="button"
                  onClick={handleRemoveUploadedFlag}
                  className="px-4 py-2.5 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Remove Custom</span>
                </button>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".svg,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            
            <p className="text-[9px] font-bold text-slate-400">Max size 5MB. Formats: SVG, PNG, JPG, WEBP.</p>
          </div>
        </div>

        {uploadError && (
          <div className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Coordinate metrics */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">Geographic Coordinates</h4>

      <div className="grid grid-cols-3 gap-4">
        {/* Latitude */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Latitude *</label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            placeholder="e.g. 38.8048"
            min={-90}
            max={90}
            required
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Longitude */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Longitude *</label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            placeholder="e.g. -77.0469"
            min={-180}
            max={180}
            required
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Region displayOrder */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Display Order</label>
          <input
            type="number"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleInputChange}
            placeholder="e.g. 0"
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            const lat = Number(formData.latitude);
            const lng = Number(formData.longitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
              alert("Latitude must be a valid number between -90 and 90 degrees.");
              return;
            }
            if (isNaN(lng) || lng < -180 || lng > 180) {
              alert("Longitude must be a valid number between -180 and 180 degrees.");
              return;
            }
            if (onPreviewLocation) {
              onPreviewLocation(
                formData.name || 'Preview Location',
                lat,
                lng,
                formData.flagUrl || formData.flag || null
              );
            }
          }}
          className="w-full py-3 bg-[#0073BB]/10 hover:bg-[#0073BB]/20 text-[#0073BB] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-[#0073BB]/20 hover:border-[#0073BB]/40 shadow-sm cursor-pointer"
        >
          <Eye size={12} />
          <span>Preview Location on Globe</span>
        </button>
      </div>

      {/* Infrastructure specs */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">Infrastructure Specifications</h4>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Infrastructure Description (Max 250)</label>
        <textarea
          name="infrastructureDescription"
          value={formData.infrastructureDescription}
          onChange={handleInputChange}
          placeholder="Brief description of regional data centers..."
          maxLength={250}
          rows={3}
          className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Availability Zones */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Availability Zones</label>
          <input
            type="number"
            name="availabilityZones"
            value={formData.availabilityZones}
            onChange={handleInputChange}
            placeholder="e.g. 3"
            min={1}
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Launch Year */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Launch Year</label>
          <input
            type="number"
            name="launchYear"
            value={formData.launchYear}
            onChange={handleInputChange}
            placeholder="e.g. 2016"
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Primary Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Primary Location (Max 80)</label>
          <input
            type="text"
            name="primaryLocation"
            value={formData.primaryLocation}
            onChange={handleInputChange}
            placeholder="e.g. Virginia, USA"
            maxLength={80}
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Compliance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Compliance Audits (Max 120)</label>
          <input
            type="text"
            name="compliance"
            value={formData.compliance}
            onChange={handleInputChange}
            placeholder="e.g. FedRAMP, HIPAA, SOC"
            maxLength={120}
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* Service coverage */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">Regional Service Statistics</h4>

      <div className="grid grid-cols-4 gap-4">
        {/* Total Services */}
        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Total Services</label>
          <input
            type="text"
            name="totalServices"
            value={formData.totalServices}
            onChange={handleInputChange}
            placeholder="e.g. 200+"
            className="px-3 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* AI/ML Services */}
        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">AI/ML</label>
          <input
            type="text"
            name="aimlServices"
            value={formData.aimlServices}
            onChange={handleInputChange}
            placeholder="e.g. 30+"
            className="px-3 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Analytics Services */}
        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Analytics</label>
          <input
            type="text"
            name="analyticsServices"
            value={formData.analyticsServices}
            onChange={handleInputChange}
            placeholder="e.g. 20+"
            className="px-3 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Networking Services */}
        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Networking</label>
          <input
            type="text"
            name="networkingServices"
            value={formData.networkingServices}
            onChange={handleInputChange}
            placeholder="e.g. 20+"
            className="px-3 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* Connectivity */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">Global Connectivity Metric</h4>

      <div className="grid grid-cols-2 gap-4">
        {/* Edge Locations */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Edge Locations</label>
          <input
            type="text"
            name="edgeLocations"
            value={formData.edgeLocations}
            onChange={handleInputChange}
            placeholder="e.g. 15+"
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Direct Connect */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Direct Connect</label>
          <input
            type="text"
            name="directConnect"
            value={formData.directConnect}
            onChange={handleInputChange}
            placeholder="e.g. Available / Supported"
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Reach */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Regional Reach (Max 120)</label>
          <input
            type="text"
            name="reach"
            value={formData.reach}
            onChange={handleInputChange}
            placeholder="e.g. Global / Americas"
            maxLength={120}
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>

        {/* Latency */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Latency Profile (Max 120)</label>
          <input
            type="text"
            name="latency"
            value={formData.latency}
            onChange={handleInputChange}
            placeholder="e.g. Low latency across EU"
            maxLength={120}
            className="px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* Services List Dynamic Collection */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">Core Services List</h4>
      
      <div className="flex flex-col gap-3">
        {formData.services.map((service, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={service}
              onChange={(e) => handleServiceChange(index, e.target.value)}
              placeholder="e.g. Amazon EC2"
              required
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleRemoveService(index)}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddService}
          className="py-2.5 px-6 rounded-lg border border-dashed border-slate-200 text-slate-500 hover:text-[#0073BB] hover:border-[#0073BB]/40 hover:bg-[#0073BB]/5 transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-fit mx-auto"
        >
          <Plus size={14} /> Add Service Item
        </button>
      </div>

      {/* Key Benefits List */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">Key Benefits List</h4>
      
      <div className="flex flex-col gap-3">
        {formData.benefits.map((benefit, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={benefit}
              onChange={(e) => handleBenefitChange(index, e.target.value)}
              placeholder="e.g. Sub-millisecond latency"
              required
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleRemoveBenefit(index)}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddBenefit}
          className="py-2.5 px-6 rounded-lg border border-dashed border-slate-200 text-slate-500 hover:text-[#0073BB] hover:border-[#0073BB]/40 hover:bg-[#0073BB]/5 transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-fit mx-auto"
        >
          <Plus size={14} /> Add Benefit Item
        </button>
      </div>

      {/* AI Capabilities List */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">AI Capabilities List</h4>
      
      <div className="flex flex-col gap-3">
        {formData.aiCapabilities.map((cap, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={cap}
              onChange={(e) => handleAiCapabilityChange(index, e.target.value)}
              placeholder="e.g. Bedrock Foundation Models"
              required
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleRemoveAiCapability(index)}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddAiCapability}
          className="py-2.5 px-6 rounded-lg border border-dashed border-slate-200 text-slate-500 hover:text-[#0073BB] hover:border-[#0073BB]/40 hover:bg-[#0073BB]/5 transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-fit mx-auto"
        >
          <Plus size={14} /> Add AI Capability
        </button>
      </div>

      {/* Top Services List */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">Top Services List</h4>
      
      <div className="flex flex-col gap-3">
        {formData.topServices.map((topSvc, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={topSvc}
              onChange={(e) => handleTopServiceChange(index, e.target.value)}
              placeholder="e.g. Amazon EKS"
              required
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleRemoveTopService(index)}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddTopService}
          className="py-2.5 px-6 rounded-lg border border-dashed border-slate-200 text-slate-500 hover:text-[#0073BB] hover:border-[#0073BB]/40 hover:bg-[#0073BB]/5 transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-fit mx-auto"
        >
          <Plus size={14} /> Add Top Service
        </button>
      </div>

      {/* Workloads List */}
      <h4 className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] mt-2 pb-2 border-b border-slate-50 uppercase">Workloads List</h4>
      
      <div className="flex flex-col gap-3">
        {formData.workloads.map((workload, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={workload}
              onChange={(e) => handleWorkloadChange(index, e.target.value)}
              placeholder="e.g. High-throughput data ingestion grids"
              required
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs font-semibold focus:ring-1 focus:ring-[#0073BB]/20 focus:border-[#0073BB]/40 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleRemoveWorkload(index)}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddWorkload}
          className="py-2.5 px-6 rounded-lg border border-dashed border-slate-200 text-slate-500 hover:text-[#0073BB] hover:border-[#0073BB]/40 hover:bg-[#0073BB]/5 transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-fit mx-auto"
        >
          <Plus size={14} /> Add Workload Item
        </button>
      </div>

      {/* Sticky bottom save bar */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-3 z-20">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-white hover:bg-slate-50/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer text-center duration-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmitForm}
          disabled={submitting || uploading}
          className="px-8 py-2.5 bg-slate-950 hover:bg-[#0073BB] disabled:bg-slate-400 text-white rounded-lg font-bold uppercase text-[11px] tracking-wider transition-all shadow-md hover:shadow-[0_4px_16px_rgba(0,115,187,0.2)] hover:-translate-y-0.5 duration-200 cursor-pointer flex items-center gap-2"
        >
          {(submitting || uploading) && <RefreshCw className="animate-spin" size={12} />}
          <span>{editingRegion ? 'Save Changes' : 'Initialize Node'}</span>
        </button>
      </div>
    </form>
  );
}
