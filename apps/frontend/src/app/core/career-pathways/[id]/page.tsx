"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { careerPathwaysService } from "@/services/career-pathways";
import { certificationsService } from "@/services/certifications";
import { usePathwayBuilder } from "@/hooks/use-pathway-builder";
import { PageHeader } from "@/components/page-header";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CertificationSelector } from "@/components/career-pathways/certification-selector";
import { SelectedPathwayList } from "@/components/career-pathways/selected-pathway-list";
import { OpportunitySection } from "@/components/career-pathways/opportunity-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Save, Loader2, Pencil, Trash2, Route, Copy } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { LevelGroup } from "@/lib/types";

export default function PathwayBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch career role
  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ["career-role-detail", id],
    queryFn: () => careerPathwaysService.getRoleById(id),
  });

  // Fetch all certifications (use admin endpoint, always refetch fresh)
  const { data: allCerts, isLoading: certsLoading } = useQuery({
    queryKey: ["admin-certifications-for-pathway"],
    queryFn: certificationsService.adminList,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Group certifications by level (admin endpoint returns level as object)
  const levels: LevelGroup[] = useMemo(() => {
    if (!allCerts) return [];
    const grouped = new Map<string, LevelGroup>();
    for (const cert of allCerts) {
      const levelName =
        typeof cert.level === "string" ? cert.level : cert.level.name;
      if (!grouped.has(levelName)) {
        grouped.set(levelName, {
          levelName,
          certifications: [],
        });
      }
      grouped.get(levelName)!.certifications.push(cert);
    }
    return Array.from(grouped.values());
  }, [allCerts]);

  // Pathway builder hook
  const pathway = usePathwayBuilder({
    initialPathway: role?.certifications ?? [],
  });

  // Save pathway mutation
  const savePathwayMutation = useMutation({
    mutationFn: () => careerPathwaysService.updatePathway(id, pathway.selectedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-role-detail", id] });
      toast.success("Pathway saved successfully");
    },
    onError: () => toast.error("Failed to save pathway"),
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string }) =>
      careerPathwaysService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-role-detail", id] });
      toast.success("Role updated");
      setIsEditingRole(false);
    },
    onError: () => toast.error("Failed to update role"),
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: careerPathwaysService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-roles"] });
      toast.success("Role deleted");
      router.push("/core/certifications?tab=pathways");
    },
    onError: () => toast.error("Failed to delete role"),
  });

  const isLoading = roleLoading || certsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FA] flex items-center justify-center py-20">
        <LoadingSpinner text="Loading pathway builder..." />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FA] text-[#1A1C1E] py-6 px-4 sm:py-8 sm:px-8">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6">
          <Link
            href="/core/certifications?tab=pathways"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FF9900] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Career Pathways
          </Link>
          <div className="rounded-lg border border-red-100 bg-red-50/20 p-4 text-sm text-red-660 font-medium">
            Career role not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-[#1A1C1E] relative py-6 px-4 sm:py-8 sm:px-8 overflow-y-auto premium-scrollbar scroll-smooth">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 z-10 relative">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2.5">
              <Link href="/core/dashboard" className="hover:text-[#FF9900] transition-colors font-semibold">Admin</Link>
              <span className="text-slate-300">/</span>
              <Link href="/core/certifications?tab=pathways" className="hover:text-[#FF9900] transition-colors font-semibold">Career Pathways</Link>
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight leading-none m-0">
                {role.name}
              </h1>
            </div>
            <p className="text-[13px] text-slate-500 font-normal mt-2.5">
              Configure the certification pathway sequence and align matching career opportunities for the {role.name} role.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={() => {
                setEditName(role.name);
                setEditDescription(role.description);
                setIsEditingRole(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              <Pencil size={13} className="text-slate-500" />
              Edit Role
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-650 rounded-[6px] text-[12px] font-semibold transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer border-none"
            >
              <Trash2 size={13} className="text-red-500" />
              Delete Role
            </Button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-12 mt-2">
          {/* LEFT: Role Info + Selected Pathway + Save Actions + Opportunities */}
          <div className="lg:col-span-5 space-y-6">
            {/* Role Info */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5 m-0">
                <Route size={14} className="text-[#FF9900]" />
                Role Information
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role Name</span>
                  <span className="text-sm font-semibold text-slate-800 leading-tight">{role.name}</span>
                </div>
                <div>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Slug / Route ID</span>
                  <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200/60 rounded-[6px] px-2.5 py-1 w-fit shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="font-mono text-[11px] text-slate-600 font-semibold select-all leading-none">
                      {role.slug}
                    </span>
                    <div className="w-px h-3 bg-slate-200 mx-1 shrink-0" />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(role.slug);
                        toast.success("Slug copied to clipboard");
                      }}
                      className="p-0.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                      title="Copy Slug"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                </div>
                <div>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</span>
                  <div className="bg-slate-50/50 border border-slate-200/40 rounded-lg p-3.5">
                    <p className="text-[12.5px] text-slate-500 leading-relaxed font-normal m-0">
                      {role.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Pathway Sequence */}
            <SelectedPathwayList
              selectedIds={pathway.selectedIds}
              onRemove={pathway.deselectCertification}
              onClear={pathway.clearSelection}
            />

            {/* Save Button */}
            <Button
              className={`w-full py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                pathway.hasChanges()
                  ? "bg-[#232F3E] hover:bg-slate-800 text-white hover:-translate-y-0.5 hover:shadow-md"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              disabled={!pathway.hasChanges() || savePathwayMutation.isPending}
              onClick={() => savePathwayMutation.mutate()}
            >
              {savePathwayMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{pathway.hasChanges() ? "Save Pathway Changes" : "No Changes to Save"}</span>
            </Button>

            {/* Opportunities */}
            <OpportunitySection
              roleId={id}
              opportunities={role.opportunities}
            />
          </div>

          {/* RIGHT: Certification Selector */}
          <div className="lg:col-span-7">
            <CertificationSelector
              levels={levels}
              selectedIds={pathway.selectedIds}
              getOrder={pathway.getOrder}
              onToggle={pathway.toggleCertification}
            />
          </div>
        </div>
      </div>

      {/* Edit Role Dialog */}
      <AlertDialog open={isEditingRole} onOpenChange={setIsEditingRole}>
        <AlertDialogContent className="max-w-md rounded-2xl border border-slate-200 shadow-xl p-6 no-scrollbar">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              Edit Career Role
            </AlertDialogTitle>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Modify the career pathway details.
            </p>
          </AlertDialogHeader>
          <div className="space-y-4 py-2 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Role Name
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10 bg-slate-50/40 border border-slate-200 rounded-[10px] px-3.5 text-slate-800 placeholder:text-slate-400/80 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#ff9900]/15 focus:border-[#ff9900] focus-visible:ring-2 focus-visible:ring-[#ff9900]/15 focus-visible:border-[#ff9900] transition-all font-normal text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="bg-slate-50/40 border border-slate-200 rounded-[10px] p-3 text-slate-800 placeholder:text-slate-400/80 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#ff9900]/15 focus:border-[#ff9900] focus-visible:ring-2 focus-visible:ring-[#ff9900]/15 focus-visible:border-[#ff9900] transition-all font-normal text-sm resize-none"
              />
            </div>
          </div>
          <AlertDialogFooter className="-mx-6 -mb-6 mt-8 rounded-b-[inherit] p-6 bg-slate-50/75 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <AlertDialogCancel className="border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs rounded-[10px] h-10 px-5 shadow-sm transition-all cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#0B0F19] hover:bg-[#1E293B] text-white border border-[#1e293b]/50 font-bold text-xs rounded-[10px] h-10 px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
              onClick={() =>
                updateRoleMutation.mutate({
                  id,
                  name: editName,
                  description: editDescription,
                })
              }
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Role Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-[20px] border border-slate-200 shadow-xl p-6 no-scrollbar">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-800 tracking-tight">Delete Career Role</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-xs leading-relaxed mt-2">
              This will permanently delete &ldquo;{role.name}&rdquo; and all its
              pathway links and opportunities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-6 -mb-6 mt-8 rounded-b-[inherit] p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <AlertDialogCancel className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-[10px] text-xs font-bold transition-all shadow-xs cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="px-5 py-2 bg-red-650 hover:bg-red-750 text-white rounded-[10px] text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
              onClick={() => deleteRoleMutation.mutate(id)}
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
