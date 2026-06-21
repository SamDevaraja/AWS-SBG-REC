import { api } from "@/lib/api";
import {
  CertificationListItem,
  CertificationDetail,
  CareerPathwayListItem,
  CareerPathwayDetail,
} from "@/lib/types";

export const certificationsService = {
  list: () => api.get<CertificationListItem[]>("/certifications"),
  getBySlug: (slug: string) =>
    api.get<CertificationDetail>(`/certifications/${slug}`),
};

export const careerPathwaysService = {
  list: () => api.get<CareerPathwayDetail[]>("/career-pathways"),
  getBySlug: (slug: string) =>
    api.get<CareerPathwayDetail>(`/career-pathways/${slug}`),
};
