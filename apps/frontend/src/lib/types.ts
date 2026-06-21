import type { Event } from '@shared/types';
export * from '@shared/types';

export interface CrewTask {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  event?: {
    title: string;
  };
}

export interface Incident {
  id: string;
  eventId: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  event?: {
    title: string;
  };
}

export interface CrewDashboardData {
  stats: {
    assignedEventsCount: number;
    todayEventsCount: number;
    totalCheckIns: number;
    pendingTasksCount: number;
  };
  todayEvents: Event[]; // Maps to shared Event type
  pendingTasks: CrewTask[];
  recentActivity: Array<{
    id: string;
    type: 'CHECK_IN' | 'INCIDENT' | string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

// ── Certification & Career Pathway Types ──────────────────

export interface CertificationLevel {
  id: string;
  name: string;
  displayOrder: number;
}

export interface CertificationListItem {
  id: string;
  title: string;
  slug: string;
  examCode: string;
  badgeImageUrl: string | null;
  level: string | { id: string; name: string };
  displayOrder: number;
  examDuration?: string;
  totalQuestions?: number;
  examCost?: number;
  examMode?: string;
  domains?: DomainListItem[];
}

export interface TopicListItem {
  id: string;
  name: string;
  displayOrder: number;
}

export interface DomainListItem {
  id: string;
  name: string;
  weightage: number;
  displayOrder: number;
  topics: TopicListItem[];
}

export interface CertificationDetail {
  id: string;
  title: string;
  slug: string;
  examCode: string;
  examDuration: string;
  totalQuestions: number;
  examCost: number;
  examMode: string;
  badgeImageUrl: string | null;
  displayOrder: number;
  level: {
    id: string;
    name: string;
  };
  domains: DomainListItem[];
}

export interface Domain {
  id: string;
  certificationId: string;
  name: string;
  weightage: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  domainId: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CareerRoleListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    certifications: number;
    opportunities: number;
  };
}

export interface CareerRoleDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  certifications: RoleCertification[];
  opportunities: CareerOpportunity[];
}

export interface RoleCertification {
  id: string;
  roleId: string;
  certificationId: string;
  pathOrder: number;
  certification: {
    id: string;
    title: string;
    slug: string;
    examCode: string;
    badgeImageUrl: string | null;
    level: {
      id: string;
      name: string;
    };
  };
}

export interface PathwayEntry {
  pathOrder: number;
  certification: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface PathwayResponse {
  roleId: string;
  pathway: {
    pathOrder: number;
    certification: {
      id: string;
      title: string;
      slug: string;
      examCode: string;
      badgeImageUrl: string | null;
      level: {
        id: string;
        name: string;
      };
    };
  }[];
}

export interface CareerOpportunity {
  id: string;
  roleId: string;
  title: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearnerPathwayListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface LearnerPathwayDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  pathway: {
    pathOrder: number;
    certification: {
      id: string;
      title: string;
      slug: string;
      examCode: string;
      badgeImageUrl: string | null;
      level: {
        id: string;
        name: string;
      };
    };
  }[];
  opportunities: {
    id: string;
    title: string;
    displayOrder: number;
  }[];
}

export type CareerPathwayListItem = LearnerPathwayListItem;
export type CareerPathwayDetail = LearnerPathwayDetail;

export interface LevelGroup {
  levelName: string;
  certifications: {
    id: string;
    title: string;
    slug: string;
    examCode: string;
    displayOrder: number;
  }[];
}

