import { api } from "@/lib/api";
import {
  CareerRoleListItem,
  CareerRoleDetail,
  PathwayResponse,
  CareerOpportunity,
} from "@/lib/types";

export const careerPathwaysService = {
  // Career Role CRUD
  listRoles: () => api.get<CareerRoleListItem[]>("/admin/career-roles"),

  getRoleById: (id: string) =>
    api.get<CareerRoleDetail>(`/admin/career-roles/${id}`),

  createRole: (data: { name: string; description: string }) =>
    api.post<CareerRoleListItem>("/admin/career-roles", data),

  updateRole: (id: string, data: { name?: string; description?: string }) =>
    api.patch<CareerRoleListItem>(`/admin/career-roles/${id}`, data),

  deleteRole: (id: string) =>
    api.delete<{ deleted: boolean }>(`/admin/career-roles/${id}`),

  // Pathway Management
  updatePathway: (roleId: string, certificationIds: string[]) =>
    api.put<PathwayResponse>(`/admin/career-roles/${roleId}/pathway`, {
      certificationIds,
    }),

  // Career Opportunity CRUD
  createOpportunity: (
    roleId: string,
    data: { title: string; displayOrder: number }
  ) =>
    api.post<CareerOpportunity>(
      `/admin/career-roles/${roleId}/opportunities`,
      data
    ),

  updateOpportunity: (
    opportunityId: string,
    data: { title?: string; displayOrder?: number }
  ) =>
    api.patch<CareerOpportunity>(
      `/admin/opportunities/${opportunityId}`,
      data
    ),

  deleteOpportunity: (opportunityId: string) =>
    api.delete<{ deleted: boolean }>(
      `/admin/opportunities/${opportunityId}`
    ),
};
