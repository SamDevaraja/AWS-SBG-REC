export * from '@shared/api';

import { fetcher, buildQueryString } from '@shared/api';
import type {
  Event,
  Registration,
  Ticket,
  AttendanceLog,
  Announcement,
  CrewDashboardData,
  CrewTask,
  Incident,
  VerifyTicketResponse,
} from './types';

// ── Crew Operations ─────────────────────────────────────────────────────────

export async function fetchCrewDashboard(): Promise<CrewDashboardData> {
  return fetcher('/crew/dashboard');
}

export async function fetchCrewEvents(): Promise<
  (Event & { assignedRole: string; attendeeCount: number })[]
> {
  return fetcher('/crew/events');
}

export async function fetchCrewAttendance(params?: { search?: string }): Promise<AttendanceLog[]> {
  return fetcher(`/crew/attendance${buildQueryString(params as Record<string, unknown>)}`);
}

export async function markCrewAttendance(data: {
  ticketCode: string;
  scannerId?: string;
}): Promise<{ success: boolean; status: string; ticket?: Ticket }> {
  return fetcher('/crew/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyCrewTicket(ticketCode: string): Promise<VerifyTicketResponse> {
  return fetcher(`/crew/tickets/verify?ticketCode=${encodeURIComponent(ticketCode)}`);
}

export async function searchCrewRegistrations(query: string): Promise<Registration[]> {
  return fetcher(`/crew/registrations/search?query=${encodeURIComponent(query)}`);
}

export async function fetchCrewAnnouncements(): Promise<Announcement[]> {
  return fetcher('/crew/announcements');
}

export async function createCrewIncident(data: {
  title: string;
  description: string;
  priority: string;
  eventId: string;
  attachmentUrl?: string;
}): Promise<Incident> {
  return fetcher('/crew/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchCrewIncidents(): Promise<Incident[]> {
  return fetcher('/crew/incidents');
}

export async function fetchCrewTasks(): Promise<CrewTask[]> {
  return fetcher('/crew/tasks');
}

export async function updateCrewTaskStatus(id: string, status: string): Promise<CrewTask> {
  return fetcher(`/crew/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
