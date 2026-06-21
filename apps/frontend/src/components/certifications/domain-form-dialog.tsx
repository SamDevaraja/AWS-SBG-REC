"use client";

import { useState } from "react";
import { Domain } from "@/lib/types";
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

interface DomainFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; weightage: number; displayOrder: number }) => void;
  initialData?: Domain;
  isLoading?: boolean;
}

export function DomainFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: DomainFormDialogProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [weightage, setWeightage] = useState(
    initialData?.weightage?.toString() ?? ""
  );
  const [displayOrder, setDisplayOrder] = useState(
    initialData?.displayOrder?.toString() ?? ""
  );

  const isEdit = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      weightage: parseFloat(weightage),
      displayOrder: parseInt(displayOrder, 10),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-[20px] border border-slate-200 bg-white p-6 shadow-2xl animate-in duration-200">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-lg font-black text-slate-800 tracking-tight">
            {isEdit ? "Edit Domain" : "Add Domain"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="domain-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Domain Name</Label>
            <Input
              id="domain-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cloud Concepts"
              required
              className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="domain-weightage" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Weightage (%)</Label>
              <Input
                id="domain-weightage"
                type="number"
                min="0"
                max="100"
                value={weightage}
                onChange={(e) => setWeightage(e.target.value)}
                placeholder="e.g., 24"
                required
                className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="domain-order" className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 block">Display Order</Label>
              <Input
                id="domain-order"
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="e.g., 1"
                required
                className="bg-slate-50 border border-slate-200 focus:border-[#ff9900]/50 focus:bg-white rounded-[8px] h-9 text-xs font-semibold px-3 text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:ring-1 focus:ring-[#ff9900]/20 transition-all duration-200 shadow-none w-full"
              />
            </div>
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
              disabled={isLoading}
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
