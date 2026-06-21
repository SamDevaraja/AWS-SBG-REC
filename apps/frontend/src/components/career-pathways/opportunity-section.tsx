"use client";

import { useState } from "react";
import { CareerOpportunity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, BriefcaseBusiness } from "lucide-react";
import { OpportunityFormDialog } from "./opportunity-form-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { careerPathwaysService } from "@/services/career-pathways";
import { toast } from "sonner";

interface OpportunitySectionProps {
  roleId: string;
  opportunities: CareerOpportunity[];
}

export function OpportunitySection({
  roleId,
  opportunities,
}: OpportunitySectionProps) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpp, setEditOpp] = useState<CareerOpportunity | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...opportunities].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const createMutation = useMutation({
    mutationFn: (data: { title: string; displayOrder: number }) =>
      careerPathwaysService.createOpportunity(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-role-detail", roleId] });
      toast.success("Opportunity added");
      setAddOpen(false);
    },
    onError: () => toast.error("Failed to add opportunity"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; displayOrder?: number }) =>
      careerPathwaysService.updateOpportunity(editOpp!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-role-detail", roleId] });
      toast.success("Opportunity updated");
      setEditOpp(null);
    },
    onError: () => toast.error("Failed to update opportunity"),
  });

  const deleteMutation = useMutation({
    mutationFn: careerPathwaysService.deleteOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-role-detail", roleId] });
      toast.success("Opportunity deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete opportunity"),
  });

  return (
    <>
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 m-0">
            <BriefcaseBusiness size={14} className="text-[#FF9900]" />
            Career Opportunities
          </h3>
          <Button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0B0F19] hover:bg-[#1E293B] text-white rounded-[6px] text-[11px] font-bold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer border-none"
          >
            <Plus size={12} className="stroke-[3]" />
            Add
          </Button>
        </div>

        {sorted.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200/60 rounded-xl bg-slate-50/30 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/50 flex items-center justify-center mb-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] text-slate-400">
              <BriefcaseBusiness size={14} className="stroke-[1.5]" />
            </div>
            <p className="text-[12px] font-semibold text-slate-655 m-0">No target opportunities</p>
            <p className="text-[11px] text-slate-400 mt-1 mb-0 max-w-[200px] leading-normal font-normal">
              Link career roles and job targets to this certification pathway.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5 p-0 m-0 list-none">
            {sorted.map((opp) => (
              <li
                key={opp.id}
                className="group flex items-center justify-between rounded-lg border border-slate-300 bg-white p-3 hover:border-slate-350 shadow-[0_1px_2px_rgba(0,0,0,0.01)] transition-all duration-200"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-150 text-[10.5px] font-bold text-slate-500">
                    {opp.displayOrder}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-700 truncate">{opp.title}</span>
                </span>
                
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditOpp(opp)}
                    className="h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                    title="Edit opportunity"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => setDeleteId(opp.id)}
                    className="h-6 w-6 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-650 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                    title="Delete opportunity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Opportunity */}
      <OpportunityFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Opportunity */}
      <OpportunityFormDialog
        open={!!editOpp}
        onOpenChange={(open) => !open && setEditOpp(null)}
        onSubmit={(data) => updateMutation.mutate(data)}
        initialData={editOpp ?? undefined}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this opportunity? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
