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
