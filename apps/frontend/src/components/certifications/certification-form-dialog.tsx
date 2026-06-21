"use client";

import { useState, useEffect, useRef } from "react";
import { CertificationDetail, CertificationLevel } from "@/lib/types";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    examCode: string;
    examDuration: string;
    totalQuestions: number;
    examCost: number;
    examMode: string;
    displayOrder: number;
    levelId: string;
    badgeImageUrl?: string;
    isActive?: boolean;
  }) => void;
  initialData?: CertificationDetail;
  levels: CertificationLevel[];
  isLoading?: boolean;
}

export function CertificationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  levels,
  isLoading,
}: CertificationFormDialogProps) {
  const isEdit = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [examCode, setExamCode] = useState("");
  const [examDuration, setExamDuration] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [examCost, setExamCost] = useState("");
  const [examMode, setExamMode] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [levelId, setLevelId] = useState("");
  const [badgeImageUrl, setBadgeImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setExamCode(initialData.examCode);
        setExamDuration(initialData.examDuration);
        setTotalQuestions(initialData.totalQuestions.toString());
        setExamCost(initialData.examCost.toString());
        setExamMode(initialData.examMode);
        setDisplayOrder(initialData.displayOrder.toString());
        setLevelId(initialData.level.id);
        setBadgeImageUrl(initialData.badgeImageUrl ?? "");
        setIsActive(true);
      } else {
        setTitle("");
        setExamCode("");
        setExamDuration("");
        setTotalQuestions("");
        setExamCost("");
        setExamMode("");
        setDisplayOrder("");
        setLevelId("");
        setBadgeImageUrl("");
        setIsActive(true);
      }
      setUploadError("");
    }
  }, [open, initialData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const result = await api.upload<{ url: string }>(
        "/upload/image",
        file
      );
      setBadgeImageUrl(result.url);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setBadgeImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      examCode,
      examDuration,
      totalQuestions: parseInt(totalQuestions, 10),
      examCost: parseFloat(examCost),
      examMode,
      displayOrder: parseInt(displayOrder || "1", 10),
      levelId,
      badgeImageUrl: badgeImageUrl || undefined,
      isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-[20px] border border-slate-200 bg-white p-6 shadow-2xl animate-in duration-200">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-lg font-black text-slate-800 tracking-tight">
            {isEdit ? "Edit Certification" : "Add Certification"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="cert-title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Title</Label>
            <Input
              id="cert-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AWS Certified Cloud Practitioner"
              required
              className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="cert-examCode" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Exam Code</Label>
              <Input
                id="cert-examCode"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="e.g., CLF-C02"
                required
                className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cert-level" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Level</Label>
              <Select value={levelId} onValueChange={(v) => v && setLevelId(v)}>
                <SelectTrigger className="w-full h-9 bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] text-xs font-semibold px-3 text-slate-700 shadow-none">
                  <span data-slot="select-value" className={cn("flex flex-1 text-left", !levelId && "text-slate-400 font-normal")}>
                    {levels.find((l) => l.id === levelId)?.name || "Select level"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="cert-duration" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Exam Duration</Label>
              <Input
                id="cert-duration"
                value={examDuration}
                onChange={(e) => setExamDuration(e.target.value)}
                placeholder="e.g., 90 minutes"
                required
                className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cert-questions" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Total Questions</Label>
              <Input
                id="cert-questions"
                type="number"
                min="1"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                placeholder="e.g., 65"
                required
                className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="cert-cost" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Exam Cost ($)</Label>
              <Input
                id="cert-cost"
                type="number"
                min="0"
                step="0.01"
                value={examCost}
                onChange={(e) => setExamCost(e.target.value)}
                placeholder="e.g., 100"
                required
                className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cert-mode" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Exam Mode</Label>
              <Input
                id="cert-mode"
                value={examMode}
                onChange={(e) => setExamMode(e.target.value)}
                placeholder="e.g., online or in-person"
                required
                className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert-order" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Display Order</Label>
            <Input
              id="cert-order"
              type="number"
              min="1"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="e.g., 1"
              required
              className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none w-full"
            />
          </div>

          {/* Badge Image Upload */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Badge Image</Label>
            {badgeImageUrl ? (
              <div className="relative flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-none">
                <img
                  src={badgeImageUrl}
                  alt="Badge preview"
                  className="h-14 w-14 rounded-lg object-contain bg-white border border-slate-100 p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">
                    Badge image uploaded
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Click remove to clear
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#ff9900]/40 px-6 py-7 text-center transition-all bg-slate-50/50 hover:bg-slate-50 disabled:opacity-50 cursor-pointer group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 group-hover:bg-[#FFF8F2] transition-colors">
                    <Upload className="h-5 w-5 text-slate-400 group-hover:text-[#ff9900] transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700">
                      {isUploading ? "Uploading..." : "Click to upload badge image"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      PNG, JPG, SVG up to 5MB
                    </p>
                  </div>
                </button>
                {uploadError && (
                  <p className="text-xs text-red-500 font-semibold mt-1">{uploadError}</p>
                )}
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <DialogFooter 
            className="mt-6 bg-slate-50/90 border-t border-slate-100 p-6 flex flex-row justify-end gap-3 rounded-b-[20px]"
            style={{ marginLeft: "-24px", marginRight: "-24px", marginBottom: "-24px" }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-[8px] font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isUploading}
              className="bg-[#0B0F19] hover:bg-[#1E293B] text-white px-4 py-2 rounded-[8px] font-bold text-xs transition-all shadow-md cursor-pointer border border-[#1e293b]/50 disabled:opacity-50"
            >
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
