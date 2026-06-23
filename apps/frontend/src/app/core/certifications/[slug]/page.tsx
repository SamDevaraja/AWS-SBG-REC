"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificationsService } from "@/services/certifications";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { DomainCard } from "@/components/certifications/domain-card";
import { DomainFormDialog } from "@/components/certifications/domain-form-dialog";
import { CertificationFormDialog } from "@/components/certifications/certification-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
import {
  Plus,
  ArrowLeft,
  Clock,
  HelpCircle,
  DollarSign,
  Monitor,
  Pencil,
  Trash2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CertificationLevel } from "@/lib/types";

const levelBadgeConfig: Record<string, { badgeClass: string; color: string }> = {
  Foundational: { 
    badgeClass: "bg-[#F1F5F9] text-[#5A6572] border-[#5A6572]/25 hover:bg-[#F1F5F9]",
    color: "#5A6572"
  },
  Associate: { 
    badgeClass: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/25 hover:bg-[#F0F7FF]",
    color: "#0972D3"
  },
  Professional: { 
    badgeClass: "bg-[#E6F8FA] text-[#00627A] border-[#00A4B4]/25 hover:bg-[#E6F8FA]",
    color: "#0083A0"
  },
  Specialty: { 
    badgeClass: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/25 hover:bg-[#F8F5FF]",
    color: "#5A30A6"
  }
};

const levels: CertificationLevel[] = [
  { id: "420c7078-1da5-4b25-8664-5cc95e74d9bb", name: "Foundational", displayOrder: 1 },
  { id: "5e610d7a-2cc2-4d58-900a-a99aa02ec842", name: "Associate", displayOrder: 2 },
  { id: "f7c48608-4a7c-4bec-a081-ae344a9f3a9f", name: "Professional", displayOrder: 3 },
  { id: "73da091e-5042-4b93-acb0-8ce56fe826e2", name: "Specialty", displayOrder: 4 },
];

export default function CertificationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: certification,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["certification-detail", slug],
    queryFn: () => certificationsService.getBySlug(slug),
  });

  const { data: dbLevels } = useQuery({
    queryKey: ["certification-levels"],
    queryFn: () => certificationsService.listLevels(),
  });

  const createDomainMutation = useMutation({
    mutationFn: (data: { name: string; weightage: number; displayOrder: number }) =>
      certificationsService.createDomain(certification!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail", slug] });
      toast.success("Domain added");
      setAddDomainOpen(false);
    },
    onError: () => toast.error("Failed to add domain"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof certificationsService.update>[1]) =>
      certificationsService.update(certification!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification updated");
      setEditOpen(false);
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update certification");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => certificationsService.delete(certification!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certification deleted");
      router.push("/core/certifications");
    },
    onError: () => toast.error("Failed to delete certification"),
  });

  if (isLoading) return <LoadingSpinner text="Loading certification..." />;

  if (error || !certification) {
    return (
      <div>
        <Link
          href="/core/certifications"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Certifications
        </Link>
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive font-medium">
          Failed to load certification details.
        </div>
      </div>
    );
  }

  const infoItems = [
    { icon: Clock, label: "Duration", value: certification.examDuration || "90 min" },
    { icon: HelpCircle, label: "Questions", value: `${certification.totalQuestions ?? 65} Questions` },
    { icon: DollarSign, label: "Exam Cost", value: `$${certification.examCost ?? 100} USD` },
    { icon: Monitor, label: "Exam Mode", value: certification.examMode || "Online or Pearson VUE" },
  ];

  const levelName = certification.level.name;
  const config = levelBadgeConfig[levelName] ?? levelBadgeConfig.Foundational;

  return (
    <div className="bg-slate-50/30 min-h-screen pb-24">
      {/* Header Navigation Bar - Simple & Dedicated */}
      <header className="bg-white border-b border-slate-200/80 py-4 shadow-sm sticky top-0 z-30 px-6 sm:px-10 lg:px-14">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Breadcrumbs & Title Stack */}
          <div className="flex flex-col gap-1 min-w-0">
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <Link 
                href={`/core/certifications?level=${levelName.toLowerCase()}`}
                className="hover:text-slate-850 transition-colors flex items-center gap-1 text-[#ff9900] font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#ff9900]" />
                <span>Certifications</span>
              </Link>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-400 font-normal">{levelName}</span>
            </nav>

            <div className="flex items-center mt-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">
                {certification.title}
              </h1>
            </div>
          </div>

          {/* Level Badges, Code & Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Badge variant="outline" className={cn("text-[9px] font-extrabold px-2 py-0.5 rounded-[4px] uppercase border", config.badgeClass)}>
              {levelName}
            </Badge>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider font-bold bg-slate-100 border border-slate-200/80 rounded-[4px] px-1.5 py-0.5 shadow-sm">
              {certification.examCode}
            </span>

            <Separator orientation="vertical" className="h-5 bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-800 font-semibold cursor-pointer h-8 rounded-[8px] text-xs"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-100 hover:text-red-750 font-semibold cursor-pointer h-8 rounded-[8px] text-xs"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full px-6 sm:px-10 lg:px-14 py-8">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Column: Domains list (Width: 9/12) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                Exam Domains ({certification.domains.length})
              </h2>
              <Button 
                size="sm" 
                onClick={() => setAddDomainOpen(true)}
                className="bg-[#0B0F19] hover:bg-[#1E293B] text-white cursor-pointer h-8 rounded-[8px] text-xs font-bold"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Domain
              </Button>
            </div>

            {certification.domains.length === 0 ? (
              <EmptyState
                icon={Plus}
                title="No domains"
                description="Add domains to organize the certification content."
                action={
                  <Button size="sm" onClick={() => setAddDomainOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Domain
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {certification.domains
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((domain, index) => (
                    <DomainCard
                      key={domain.id}
                      domain={domain}
                      certificationId={certification.id}
                      index={index}
                      levelName={levelName}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar (Width: 3/12) */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
            {/* Certification Badge Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 flex items-center justify-center mb-3">
                {certification.badgeImageUrl ? (
                  <img
                    src={certification.badgeImageUrl}
                    alt={certification.title}
                    className="h-full w-full object-contain animate-fade-in"
                  />
                ) : (
                  <GraduationCap className="h-16 w-16 text-slate-300" />
                )}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                AWS Certified
              </span>
              <span className="text-[11px] font-extrabold text-slate-850 tracking-tight leading-snug max-w-[180px]">
                {certification.title.replace("AWS Certified ", "")}
              </span>
            </div>

            {/* Exam Details Sidebar */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-slate-800 tracking-tight">Exam Details</h2>
              <div className="space-y-3">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <item.icon className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">{item.label}</p>
                      <p className="text-xs font-bold text-slate-700 leading-none">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Add Domain Dialog */}
      <DomainFormDialog
        open={addDomainOpen}
        onOpenChange={setAddDomainOpen}
        onSubmit={(data) => createDomainMutation.mutate(data)}
        isLoading={createDomainMutation.isPending}
      />

      {/* Edit Certification Dialog */}
      <CertificationFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={(data) => updateMutation.mutate(data)}
        initialData={certification}
        levels={dbLevels || levels}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Certification Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{certification.title}&rdquo;
              and all its domains and topics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
