"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CareerRoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string }) => void;
  isLoading?: boolean;
}

export function CareerRoleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CareerRoleFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">
            Create Career Role
          </DialogTitle>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Define a new career pathway for learners.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="role-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Role Name
            </Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cloud Architect"
              required
              className="h-10 bg-slate-50/40 border border-slate-200 rounded-[10px] px-3.5 text-slate-800 placeholder:text-slate-400/80 placeholder:text-[11.5px] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#ff9900]/15 focus:border-[#ff9900] focus-visible:ring-2 focus-visible:ring-[#ff9900]/15 focus-visible:border-[#ff9900] transition-all font-normal text-xs"
            />
            <p className="text-[10px] font-semibold text-slate-400">
              Slug will be auto-generated from the name.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Design and guide structural blueprints for cloud deployment."
              rows={3}
              required
              className="bg-slate-50/40 border border-slate-200 rounded-[10px] p-3 text-slate-800 placeholder:text-slate-400/80 placeholder:text-[11.5px] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#ff9900]/15 focus:border-[#ff9900] focus-visible:ring-2 focus-visible:ring-[#ff9900]/15 focus-visible:border-[#ff9900] transition-all font-normal text-xs resize-none"
            />
          </div>

          <DialogFooter className="-mx-6 -mb-6 mt-8 p-6 bg-slate-50/75 border-t border-slate-100 rounded-b-[inherit]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs rounded-[10px] h-10 px-5 shadow-sm transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim() || !description.trim()}
              className="bg-[#0B0F19] hover:bg-[#1E293B] text-white border border-[#1e293b]/50 font-bold text-xs rounded-[10px] h-10 px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
