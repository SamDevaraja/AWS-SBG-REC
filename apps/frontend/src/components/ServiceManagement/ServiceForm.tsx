"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Upload, Star, CheckCircle, ExternalLink, HelpCircle } from "lucide-react";
import { AWSServiceCategory, AWSServiceSummary, uploadServiceIcon } from "@/lib/api";

interface ServiceFormProps {
  categories: AWSServiceCategory[];
  editingService: any | null; // Full service details or summary
  onSubmit: (payload: any) => Promise<void>;
  onCancel: () => void;
  allServices: AWSServiceSummary[];
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function ServiceForm({
  categories,
  editingService,
  onSubmit,
  onCancel,
  allServices,
  showToast
}: ServiceFormProps) {
  // Main form fields
  const [serviceCode, setServiceCode] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [awsDocumentationUrl, setAwsDocumentationUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("GA");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Array fields (lists)
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [pricingModels, setPricingModels] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [comparisonTags, setComparisonTags] = useState<string[]>([]);

  // Related Services field
  const [relatedServices, setRelatedServices] = useState<{ name: string; slug: string }[]>([]);

  // Input states for adding to arrays
  const [newCharacteristic, setNewCharacteristic] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newUseCase, setNewUseCase] = useState("");
  const [newPricingModel, setNewPricingModel] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newComparisonTag, setNewComparisonTag] = useState("");
  
  // Selected related service slug to add
  const [selectedRelatedSlug, setSelectedRelatedSlug] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync state with editingService (or cloned service details)
  useEffect(() => {
    if (editingService) {
      setServiceCode(editingService.serviceCode || "");
      setName(editingService.name || "");
      setSlug(editingService.slug || "");
      setCategoryId(editingService.categoryId || (categories[0]?.id || ""));
      setShortDescription(editingService.shortDescription || "");
      setFullDescription(editingService.fullDescription || "");
      setIconUrl(editingService.iconUrl || "");
      setAwsDocumentationUrl(editingService.awsDocumentationUrl || "");
      setIsFeatured(editingService.isFeatured ?? false);
      setStatus(editingService.status || "GA");
      setDisplayOrder(editingService.displayOrder ?? 0);
      setIsActive(editingService.isActive ?? true);

      // Deep specs arrays
      setCharacteristics(editingService.characteristics || []);
      setFeatures(editingService.features || []);
      setUseCases(editingService.useCases || []);
      setPricingModels(editingService.pricingModels || []);
      setKeywords(editingService.keywords || []);
      setComparisonTags(editingService.comparisonTags || []);

      // Related services
      setRelatedServices(editingService.relatedServices || []);
    } else {
      // Clear fields for new service
      setServiceCode("");
      setName("");
      setSlug("");
      setCategoryId(categories[0]?.id || "");
      setShortDescription("");
      setFullDescription("");
      setIconUrl("");
      setAwsDocumentationUrl("");
      setIsFeatured(false);
      setStatus("GA");
      setDisplayOrder(0);
      setIsActive(true);
      setCharacteristics([]);
      setFeatures([]);
      setUseCases([]);
      setPricingModels([]);
      setKeywords([]);
      setComparisonTags([]);
      setRelatedServices([]);
    }
  }, [editingService, categories]);

  // Autogenerate slug from name if not manually editing
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingService) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  // Upload handler for custom icons
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadServiceIcon(file);
      setIconUrl(res.url);
      showToast("Service icon uploaded successfully", "success");
    } catch (err: any) {
      showToast(`Upload failed: ${err.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  // List additions
  const addToArray = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    clearInput: () => void
  ) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      clearInput();
    }
  };

  const removeFromArray = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  // Related services additions
  const addRelatedService = () => {
    if (!selectedRelatedSlug) return;
    const target = allServices.find(s => s.slug === selectedRelatedSlug);
    if (target) {
      if (relatedServices.some(rs => rs.slug === target.slug)) {
        showToast("This service is already in the related services list.", "error");
        return;
      }
      setRelatedServices(prev => [...prev, { name: target.name, slug: target.slug }]);
      setSelectedRelatedSlug("");
    }
  };

  const removeRelatedService = (slugToRemove: string) => {
    setRelatedServices(prev => prev.filter(rs => rs.slug !== slugToRemove));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceCode.trim() || !name.trim() || !slug.trim() || !categoryId) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        serviceCode: serviceCode.trim(),
        name: name.trim(),
        slug: slug.trim(),
        categoryId,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        iconUrl: iconUrl || `https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/1104e9fd205a28a55dbd9d9ae22a855315772d33/apps/backend/uploads/services/${slug}.svg`, // Default mapping
        awsDocumentationUrl: awsDocumentationUrl.trim(),
        isFeatured,
        status,
        displayOrder: Number(displayOrder),
        isActive,
        characteristics,
        features,
        useCases,
        pricingModels,
        keywords,
        comparisonTags,
        relatedServices
      };

      await onSubmit(payload);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to submit form", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  return (
    <form onSubmit={handleSubmit} className="flex-grow flex flex-col h-full overflow-hidden select-none">
      {/* Scrollable Form Fields */}
      <div className="flex-grow overflow-y-auto p-10 space-y-8 premium-scrollbar">
        {/* SECTION 1: CORE DETAILS */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-bold text-[#FF9900] uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Core Details
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Service Code *
              </label>
              <input
                type="text"
                value={serviceCode}
                onChange={e => setServiceCode(e.target.value.toLowerCase().trim())}
                placeholder="e.g. ec2"
                required
                className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-normal focus:outline-none focus:border-[#FF9900] bg-slate-50 focus:bg-white transition-all text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[12px] font-medium text-slate-650 focus:outline-none focus:border-[#FF9900] bg-slate-50 cursor-pointer"
              >
                <option value="" className="text-slate-400">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="text-slate-700 uppercase text-xs font-semibold">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Amazon Elastic Compute Cloud"
                required
                className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-normal focus:outline-none focus:border-[#FF9900] bg-slate-50 focus:bg-white transition-all text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                placeholder="e.g. amazon-ec2"
                required
                className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-normal focus:outline-none focus:border-[#FF9900] bg-slate-50 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
              Short Description *
            </label>
            <textarea
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              placeholder="Provide a concise 1-2 sentence description..."
              rows={2}
              required
              className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-normal focus:outline-none focus:border-[#FF9900] bg-slate-50 focus:bg-white transition-all text-slate-700 leading-relaxed"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
              Full Description *
            </label>
            <textarea
              value={fullDescription}
              onChange={e => setFullDescription(e.target.value)}
              placeholder="Provide a detailed, complete specification description..."
              rows={4}
              required
              className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-normal focus:outline-none focus:border-[#FF9900] bg-slate-50 focus:bg-white transition-all text-slate-700 leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION 2: ASSETS & RESOURCES */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-bold text-[#FF9900] uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Assets & Resources
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {/* Custom Icon Drag Drop / Upload */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Service Icon Asset
              </label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-3 flex-shrink-0">
                  {iconUrl ? (
                    <img
                      src={iconUrl.startsWith("http") ? iconUrl : `${API_URL}${iconUrl}`}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <HelpCircle className="text-slate-400" size={24} />
                  )}
                </div>
                <label className="flex-grow py-3.5 border border-dashed border-slate-200 hover:border-[#FF9900] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-semibold text-slate-500 hover:text-slate-800">
                  <Upload size={14} className="text-slate-400" /> {uploading ? "Uploading..." : "Upload SVG Icon"}
                  <input
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg"
                    onChange={handleIconUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {iconUrl && (
                <span className="text-[9px] text-slate-400 font-mono mt-1.5 block truncate max-w-[250px]">
                  Path: {iconUrl}
                </span>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                AWS Documentation URL
              </label>
              <input
                type="url"
                value={awsDocumentationUrl}
                onChange={e => setAwsDocumentationUrl(e.target.value)}
                placeholder="https://docs.aws.amazon.com/..."
                className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-normal focus:outline-none focus:border-[#FF9900] bg-slate-50 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ARCHITECTURE SPECS ARRAYS */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-[#FF9900] uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Specification Details (Arrays)
          </h4>

          {/* Helper list builder input */}
          {[
            {
              label: "Characteristics",
              list: characteristics,
              setter: setCharacteristics,
              newVal: newCharacteristic,
              newValSetter: setNewCharacteristic,
              placeholder: "e.g. Serverless orchestration"
            },
            {
              label: "Features",
              list: features,
              setter: setFeatures,
              newVal: newFeature,
              newValSetter: setNewFeature,
              placeholder: "e.g. S3 event triggers integration"
            },
            {
              label: "Use Cases",
              list: useCases,
              setter: setUseCases,
              newVal: newUseCase,
              newValSetter: setNewUseCase,
              placeholder: "e.g. Real-time batch transcoding"
            },
            {
              label: "Pricing Models",
              list: pricingModels,
              setter: setPricingModels,
              newVal: newPricingModel,
              newValSetter: setNewPricingModel,
              placeholder: "e.g. Pay-as-you-go per execution"
            },
            {
              label: "Keywords",
              list: keywords,
              setter: setKeywords,
              newVal: newKeyword,
              newValSetter: setNewKeyword,
              placeholder: "e.g. serverless"
            },
            {
              label: "Comparison Tags",
              list: comparisonTags,
              setter: setComparisonTags,
              newVal: newComparisonTag,
              newValSetter: setNewComparisonTag,
              placeholder: "e.g. FaaS"
            }
          ].map(field => (
            <div key={field.label} className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                {field.label}
              </label>
              
              {/* List Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {field.list.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-55 border border-slate-150 rounded-lg text-[10px] font-medium text-slate-600 flex items-center gap-1.5"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray(idx, field.setter)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Input Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={field.newVal}
                  onChange={e => field.newValSetter(e.target.value)}
                  placeholder={field.placeholder}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addToArray(field.newVal, field.setter, () => field.newValSetter(""));
                    }
                  }}
                  className="flex-grow px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-normal focus:outline-none focus:border-[#FF9900] bg-slate-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => addToArray(field.newVal, field.setter, () => field.newValSetter(""))}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 4: INTEGRATIONS & RELATIONSHIPS */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-bold text-[#FF9900] uppercase tracking-wider border-b border-slate-100 pb-2">
            4. Integrations & Relationships
          </h4>

          {/* Related Services List */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Related Services
            </label>

            {/* List Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {relatedServices.map((rs, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-orange-50/50 border border-orange-100 rounded-lg text-[10px] font-medium text-slate-700 flex items-center gap-1.5"
                >
                  <span>{rs.name}</span>
                  <button
                    type="button"
                    onClick={() => removeRelatedService(rs.slug)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>

            {/* Select Dropdown */}
            <div className="flex gap-2">
              <select
                value={selectedRelatedSlug}
                onChange={e => setSelectedRelatedSlug(e.target.value)}
                className="flex-grow px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-[12px] font-medium text-slate-600 focus:outline-none focus:border-[#FF9900] bg-slate-50 cursor-pointer"
              >
                <option value="">Select service to relate...</option>
                {allServices
                  .filter(s => s.slug !== slug) // Omit current
                  .map(s => (
                    <option key={s.id} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addRelatedService}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Relate
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: OPTIONS & CONTROL */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-bold text-[#FF9900] uppercase tracking-wider border-b border-slate-100 pb-2">
            5. Status & Parameters
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Launch Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[12px] font-medium text-slate-650 focus:outline-none focus:border-[#FF9900] bg-slate-50 cursor-pointer"
              >
                <option value="GA">General Availability (GA)</option>
                <option value="Preview">Preview</option>
                <option value="Beta">Beta</option>
                <option value="Deprecated">Deprecated</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={e => setDisplayOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-normal focus:outline-none focus:border-[#FF9900] bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#FF9900] focus:ring-[#FF9900] border-slate-300 rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Star size={12} className={isFeatured ? "fill-amber-500 stroke-none" : "text-slate-400"} />
                Featured Service
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#FF9900] focus:ring-[#FF9900] border-slate-300 rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-500" />
                Active in Catalog
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Form Action Buttons Footer */}
      <div className="px-10 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-all cursor-pointer hover:bg-slate-100/50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Saving..." : (editingService ? "Save Service" : "Register Service")}
        </button>
      </div>
    </form>
  );
}
