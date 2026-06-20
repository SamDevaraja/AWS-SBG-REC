import type {
  Event,
  Registration,
  Ticket,
  AttendanceLog,
  Announcement,
  CreateEventDto,
  UpdateEventDto,
  CreateRegistrationDto,
  CreateAnnouncementDto,
  VerifyTicketDto,
  VerifyTicketResponse,
  PaginationParams,
  PaginatedResponse,
  DashboardStats,
  EventStats,
  PopularEvent,
  TimeSeriesData,
  StatusCount,
  EventRegistrationCount,
  AttendanceStats,
} from '../types';

const API_BASE = '/api';

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(
      `API error ${res.status}: ${res.statusText}${errorBody ? ` - ${errorBody}` : ''}`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

// ── Events ───────────────────────────────────────────────────────────────────

export async function fetchEvents(params?: PaginationParams): Promise<PaginatedResponse<Event>> {
  return fetcher(`/events${buildQueryString(params as Record<string, unknown>)}`);
}

export async function fetchEvent(id: string): Promise<Event> {
  return fetcher(`/events/${id}`);
}

export async function createEvent(data: CreateEventDto): Promise<Event> {
  return fetcher('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
  return fetcher(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  return fetcher(`/events/${id}`, { method: 'DELETE' });
}

export async function archiveEvent(id: string): Promise<Event> {
  return fetcher(`/events/${id}/archive`, { method: 'PATCH' });
}

export async function publishEvent(id: string): Promise<Event> {
  return fetcher(`/events/${id}/publish`, { method: 'PATCH' });
}

export async function closeRegistration(id: string): Promise<Event> {
  return fetcher(`/events/${id}/close-registration`, { method: 'PATCH' });
}

export async function reopenRegistration(id: string): Promise<Event> {
  return fetcher(`/events/${id}/reopen-registration`, { method: 'PATCH' });
}

export async function duplicateEvent(id: string): Promise<Event> {
  return fetcher(`/events/${id}/duplicate`, { method: 'POST' });
}

// ── Registrations ────────────────────────────────────────────────────────────

export async function fetchRegistrations(
  params?: PaginationParams,
): Promise<PaginatedResponse<Registration>> {
  return fetcher(`/registrations${buildQueryString(params as Record<string, unknown>)}`);
}

export async function fetchRegistration(id: string): Promise<Registration> {
  return fetcher(`/registrations/${id}`);
}

export async function createRegistration(data: CreateRegistrationDto): Promise<Registration> {
  return fetcher('/registrations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cancelRegistration(id: string): Promise<Registration> {
  return fetcher(`/registrations/${id}/cancel`, { method: 'PATCH' });
}

export async function fetchEventRegistrations(
  eventId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<Registration>> {
  return fetcher(
    `/registrations/event/${eventId}${buildQueryString(params as Record<string, unknown>)}`,
  );
}

export async function fetchRegistrationsByUser(
  userId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<Registration>> {
  return fetcher(
    `/registrations/user/${userId}${buildQueryString(params as Record<string, unknown>)}`,
  );
}

export async function getRegistrationCount(eventId: string): Promise<{ count: number }> {
  return fetcher(`/registrations/count/${eventId}`);
}

// ── Tickets ──────────────────────────────────────────────────────────────────

export async function fetchTickets(params?: PaginationParams): Promise<PaginatedResponse<Ticket>> {
  return fetcher(`/tickets${buildQueryString(params as Record<string, unknown>)}`);
}

export async function fetchTicket(id: string): Promise<Ticket> {
  return fetcher(`/tickets/${id}`);
}

export async function fetchTicketByCode(code: string): Promise<Ticket> {
  return fetcher(`/tickets/code/${code}`);
}

export async function regenerateTicket(id: string): Promise<Ticket> {
  return fetcher(`/tickets/${id}/regenerate`, { method: 'POST' });
}

export async function fetchTicketsByEvent(
  eventId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<Ticket>> {
  return fetcher(`/tickets/event/${eventId}${buildQueryString(params as Record<string, unknown>)}`);
}

export async function fetchTicketsByUser(
  userId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<Ticket>> {
  return fetcher(`/tickets/user/${userId}${buildQueryString(params as Record<string, unknown>)}`);
}

export async function emailTicket(id: string): Promise<{ success: boolean }> {
  return fetcher(`/tickets/${id}/email`, { method: 'POST' });
}

export async function generateBulkTickets(data: {
  eventId: string;
  registrationIds?: string[];
  sendEmail?: boolean;
  createAnnouncement?: boolean;
}): Promise<{ message: string; count: number }> {
  return fetcher('/tickets/generate-bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function regenerateBulkTickets(data: {
  ticketIds: string[];
  sendEmail?: boolean;
}): Promise<{ message: string; count: number }> {
  return fetcher('/tickets/regenerate-bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Attendance ───────────────────────────────────────────────────────────────

export async function fetchAttendance(
  params?: PaginationParams,
): Promise<PaginatedResponse<Ticket>> {
  return fetcher(`/attendance${buildQueryString(params as Record<string, unknown>)}`);
}

export async function verifyTicket(data: VerifyTicketDto): Promise<VerifyTicketResponse> {
  return fetcher('/attendance/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAttendanceByEvent(eventId: string): Promise<AttendanceLog[]> {
  return fetcher(`/attendance/event/${eventId}`);
}

export async function fetchAttendanceByUser(userId: string): Promise<AttendanceLog[]> {
  return fetcher(`/attendance/user/${userId}`);
}

export async function getAttendanceStats(eventId: string): Promise<AttendanceStats> {
  return fetcher(`/attendance/stats/${eventId}`);
}

// ── Analytics ────────────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return fetcher('/analytics/dashboard');
}

export async function fetchEventStats(eventId: string): Promise<EventStats> {
  return fetcher(`/analytics/events/${eventId}`);
}

export async function fetchPopularEvents(limit?: number): Promise<PopularEvent[]> {
  return fetcher(`/analytics/popular-events${limit ? `?limit=${limit}` : ''}`);
}

export async function fetchRegistrationsOverTime(): Promise<TimeSeriesData[]> {
  return fetcher('/analytics/registrations-over-time');
}

export async function fetchAttendanceOverTime(): Promise<TimeSeriesData[]> {
  return fetcher('/analytics/attendance-over-time');
}

export async function fetchEventsByStatus(): Promise<StatusCount[]> {
  return fetcher('/analytics/events-by-status');
}

export async function fetchRegistrationsByEvent(): Promise<EventRegistrationCount[]> {
  return fetcher('/analytics/registrations-by-event');
}

// ── Announcements ────────────────────────────────────────────────────────────

export async function fetchAnnouncements(eventId?: string): Promise<Announcement[]> {
  if (eventId) {
    return fetcher(`/announcements/event/${eventId}`);
  }
  return fetcher('/announcements');
}

export async function createAnnouncement(data: CreateAnnouncementDto): Promise<Announcement> {
  return fetcher('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  return fetcher(`/announcements/${id}`, { method: 'DELETE' });
}
