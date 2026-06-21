"use client";

import { useState, useEffect } from "react";
import { CareerOpportunity } from "@/lib/types";
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
import { Loader2 } from "lucide-react";

interface OpportunityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; displayOrder: number }) => void;
  initialData?: CareerOpportunity;
  isLoading?: boolean;
}

export function OpportunityFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: OpportunityFormDialogProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    initialData?.displayOrder?.toString() ?? ""
  );

  // Sync state with initialData when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setDisplayOrder(initialData?.displayOrder?.toString() ?? "");
    }
  }, [open, initialData]);

  const isEdit = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      displayOrder: parseInt(displayOrder, 10),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-slate-200 shadow-xl p-6 no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {isEdit ? "Edit Opportunity" : "Add Opportunity"}
          </DialogTitle>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isEdit ? "Modify target opportunity details." : "Link a target job opportunity for this pathway."}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="opp-title" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Job Title
            </Label>
            <Input
              id="opp-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cloud Architect"
              required
              className="h-10 bg-slate-50/40 border border-slate-200 rounded-[10px] px-3.5 text-slate-800 placeholder:text-slate-400/80 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#ff9900]/15 focus:border-[#ff9900] focus-visible:ring-2 focus-visible:ring-[#ff9900]/15 focus-visible:border-[#ff9900] transition-all font-normal text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opp-order" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Display Order
            </Label>
            <Input
              id="opp-order"
              type="number"
              min="1"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="e.g., 1"
              required
              className="h-10 bg-slate-50/40 border border-slate-200 rounded-[10px] px-3.5 text-slate-800 placeholder:text-slate-400/80 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#ff9900]/15 focus:border-[#ff9900] focus-visible:ring-2 focus-visible:ring-[#ff9900]/15 focus-visible:border-[#ff9900] transition-all font-normal text-sm"
            />
          </div>

          <DialogFooter className="-mx-6 -mb-6 mt-8 p-6 bg-slate-50/75 border-t border-slate-100 rounded-b-[inherit]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs rounded-[10px] h-10 px-5 shadow-sm transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !title.trim() || !displayOrder.trim()}
              className="bg-[#0B0F19] hover:bg-[#1E293B] text-white border border-[#1e293b]/50 font-bold text-xs rounded-[10px] h-10 px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Update Opportunity" : "Add Opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
