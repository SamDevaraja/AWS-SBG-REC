"use client";

import { useState } from "react";
import { DomainListItem, Topic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Pencil, Trash2, Plus, BookOpen } from "lucide-react";
import { DomainFormDialog } from "./domain-form-dialog";
import { TopicFormDialog } from "./topic-form-dialog";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { certificationsService } from "@/services/certifications";

const levelBadgeConfig: Record<string, { badgeClass: string; color: string }> = {
  Foundational: { 
    badgeClass: "bg-[#FFF8F2] text-[#EC7211] border-[#FF9900]/25 hover:bg-[#FFF8F2]",
    color: "#FF9900"
  },
  Associate: { 
    badgeClass: "bg-[#F0F7FF] text-[#0972D3] border-[#2E90FF]/25 hover:bg-[#F0F7FF]",
    color: "#0972D3"
  },
  Professional: { 
    badgeClass: "bg-[#EFF6FF] text-[#1D4ED8] border-[#3B82F6]/25 hover:bg-[#EFF6FF]",
    color: "#1D4ED8"
  },
  Specialty: { 
    badgeClass: "bg-[#F8F5FF] text-[#5A30A6] border-[#8C60D6]/25 hover:bg-[#F8F5FF]",
    color: "#5A30A6"
  }
};

interface DomainCardProps {
  domain: DomainListItem;
  certificationId: string;
  index: number;
  levelName?: string;
}

export function DomainCard({ domain, certificationId, index, levelName }: DomainCardProps) {
  const queryClient = useQueryClient();
  const [editDomainOpen, setEditDomainOpen] = useState(false);
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteDomainConfirm, setDeleteDomainConfirm] = useState(false);
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);

  const updateDomainMutation = useMutation({
    mutationFn: (data: { name?: string; weightage?: number; displayOrder?: number }) =>
      certificationsService.updateDomain(domain.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Domain updated");
      setEditDomainOpen(false);
    },
    onError: () => toast.error("Failed to update domain"),
  });

  const deleteDomainMutation = useMutation({
    mutationFn: () => certificationsService.deleteDomain(domain.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Domain deleted");
      setDeleteDomainConfirm(false);
    },
    onError: () => toast.error("Failed to delete domain"),
  });

  const createTopicMutation = useMutation({
    mutationFn: (data: { name: string; displayOrder: number }) =>
      certificationsService.createTopic(domain.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Topic added");
      setAddTopicOpen(false);
    },
    onError: () => toast.error("Failed to add topic"),
  });

  const updateTopicMutation = useMutation({
    mutationFn: (data: { name?: string; displayOrder?: number }) =>
      certificationsService.updateTopic(editTopic!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Topic updated");
      setEditTopic(null);
    },
    onError: () => toast.error("Failed to update topic"),
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (topicId: string) => certificationsService.deleteTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-detail"] });
      toast.success("Topic deleted");
      setDeleteTopicId(null);
    },
    onError: () => toast.error("Failed to delete topic"),
  });

  const config = levelBadgeConfig[levelName || "Foundational"] ?? levelBadgeConfig.Foundational;
  const hoverTextClasses: Record<string, string> = {
    Foundational: "group-hover:text-[#EC7211]",
    Associate: "group-hover:text-[#0972D3]",
    Professional: "group-hover:text-[#1D4ED8]",
    Specialty: "group-hover:text-[#5A30A6]",
  };
  const hoverClass = hoverTextClasses[levelName || "Foundational"] ?? hoverTextClasses.Foundational;

  return (
    <>
      <div className="group rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
              {index + 1}
            </span>
            <div>
              <h3 className={cn("font-bold text-slate-800 leading-snug transition-colors duration-200", hoverClass)}>
                {domain.name}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">
                Domain Weightage: {domain.weightage}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-[4px] border", config.badgeClass)}>
              {domain.weightage}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-700! hover:bg-slate-100! rounded-md cursor-pointer transition-colors duration-150"
              onClick={() => setEditDomainOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-600! hover:bg-red-50! rounded-md cursor-pointer transition-colors duration-150"
              onClick={() => setDeleteDomainConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Weightage Progress Bar */}
        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ 
              width: `${domain.weightage}%`,
              backgroundColor: config.color 
            }}
          />
        </div>

        {/* Separator and Topics */}
        <Separator className="my-4 border-slate-100" />
        <div className="ml-9">
          <p className="mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Syllabus Topics
          </p>

          {domain.topics.length === 0 ? (
            <p className="text-sm text-slate-400 py-1 font-medium">
              No topics yet. Add one below.
            </p>
          ) : (
            <ul className="space-y-1">
              {[...domain.topics]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((topic) => (
                  <li
                    key={topic.id}
                    className="group/topic flex items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-slate-50 transition-colors -mx-3"
                  >
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="text-slate-400 text-xs font-bold">{topic.displayOrder}.</span>
                      <span>{topic.name}</span>
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/topic:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-slate-700! hover:bg-slate-100! rounded-md cursor-pointer transition-colors duration-150"
                        onClick={() =>
                          setEditTopic({
                            id: topic.id,
                            domainId: domain.id,
                            name: topic.name,
                            displayOrder: topic.displayOrder,
                            createdAt: "",
                            updatedAt: "",
                          })
                        }
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600! hover:bg-red-50! rounded-md cursor-pointer transition-colors duration-150"
                        onClick={() => setDeleteTopicId(topic.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          )}

          <Button
            variant="ghost"
            className="mt-4 w-full bg-slate-50/45 hover:bg-slate-100/60! border border-dashed border-slate-200/80 hover:border-slate-300 text-slate-500 hover:text-slate-700! font-bold transition-all duration-150 cursor-pointer h-9 rounded-[10px] text-xs shadow-none flex items-center justify-center gap-1.5"
            onClick={() => setAddTopicOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-500" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Edit Domain Dialog */}
      <DomainFormDialog
        open={editDomainOpen}
        onOpenChange={setEditDomainOpen}
        onSubmit={(data) => updateDomainMutation.mutate(data)}
        initialData={{
          id: domain.id,
          certificationId,
          name: domain.name,
          weightage: domain.weightage,
          displayOrder: domain.displayOrder,
          createdAt: "",
          updatedAt: "",
        }}
        isLoading={updateDomainMutation.isPending}
      />

      {/* Add Topic Dialog */}
      <TopicFormDialog
        open={addTopicOpen}
        onOpenChange={setAddTopicOpen}
        onSubmit={(data) => createTopicMutation.mutate(data)}
        isLoading={createTopicMutation.isPending}
      />

      {/* Edit Topic Dialog */}
      <TopicFormDialog
        open={!!editTopic}
        onOpenChange={(open) => !open && setEditTopic(null)}
        onSubmit={(data) => updateTopicMutation.mutate(data)}
        initialData={editTopic ?? undefined}
        isLoading={updateTopicMutation.isPending}
      />

      {/* Delete Domain Confirmation */}
      <AlertDialog
        open={deleteDomainConfirm}
        onOpenChange={setDeleteDomainConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Domain</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{domain.name}&rdquo; and all
              its topics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDomainMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Topic Confirmation */}
      <AlertDialog
        open={!!deleteTopicId}
        onOpenChange={(open) => !open && setDeleteTopicId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this topic? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTopicId && deleteTopicMutation.mutate(deleteTopicId)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
