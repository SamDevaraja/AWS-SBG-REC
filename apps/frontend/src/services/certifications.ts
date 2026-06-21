import { api } from "@/lib/api";
import {
  CertificationListItem,
  CertificationDetail,
  CertificationLevel,
  Domain,
  Topic,
} from "@/lib/types";

export const certificationsService = {
  list: () => api.get<CertificationListItem[]>("/certifications"),

  getBySlug: (slug: string) =>
    api.get<CertificationDetail>(`/certifications/${slug}`),

  // Admin Certification CRUD
  adminList: () =>
    api.get<(CertificationListItem & { id: string; isActive: boolean })[]>(
      "/admin/certifications"
    ),

  adminGetById: (id: string) =>
    api.get<CertificationDetail>(`/admin/certifications/${id}`),

  create: (data: {
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
  }) => api.post<CertificationDetail>("/admin/certifications", data),

  update: (
    id: string,
    data: {
      title?: string;
      examCode?: string;
      examDuration?: string;
      totalQuestions?: number;
      examCost?: number;
      examMode?: string;
      displayOrder?: number;
      levelId?: string;
      badgeImageUrl?: string;
      isActive?: boolean;
    }
  ) => api.patch<CertificationDetail>(`/admin/certifications/${id}`, data),

  delete: (id: string) =>
    api.delete<{ deleted: boolean }>(`/admin/certifications/${id}`),

  // Levels (dynamic from admin endpoint)
  listLevels: () => api.get<CertificationLevel[]>("/admin/levels"),

  // Domain CRUD
  createDomain: (
    certificationId: string,
    data: { name: string; weightage: number; displayOrder: number }
  ) =>
    api.post<Domain>(
      `/admin/certifications/${certificationId}/domains`,
      data
    ),

  updateDomain: (
    domainId: string,
    data: { name?: string; weightage?: number; displayOrder?: number }
  ) => api.patch<Domain>(`/admin/domains/${domainId}`, data),

  deleteDomain: (domainId: string) =>
    api.delete<{ deleted: boolean }>(`/admin/domains/${domainId}`),

  // Topic CRUD
  createTopic: (
    domainId: string,
    data: { name: string; displayOrder: number }
  ) => api.post<Topic>(`/admin/domains/${domainId}/topics`, data),

  updateTopic: (
    topicId: string,
    data: { name?: string; displayOrder?: number }
  ) => api.patch<Topic>(`/admin/topics/${topicId}`, data),

  deleteTopic: (topicId: string) =>
    api.delete<{ deleted: boolean }>(`/admin/topics/${topicId}`),
};
