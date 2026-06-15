'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type {
  PaginationParams,
  CreateEventDto,
  UpdateEventDto,
  CreateRegistrationDto,
  CreateAnnouncementDto,
  VerifyTicketDto,
} from './types';

// ── Events ───────────────────────────────────────────────────────────────────

export function useEvents(params?: PaginationParams) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => api.fetchEvents(params),
    staleTime: 3 * 60 * 1000, // events list: 3 min
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => api.fetchEvent(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventDto) => api.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) => api.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// ── Registrations ────────────────────────────────────────────────────────────

export function useRegistrations(params?: PaginationParams) {
  return useQuery({
    queryKey: ['registrations', params],
    queryFn: () => api.fetchRegistrations(params),
  });
}

export function useRegistration(id: string) {
  return useQuery({
    queryKey: ['registration', id],
    queryFn: () => api.fetchRegistration(id),
    enabled: !!id,
  });
}

export function useRegistrationsByEvent(eventId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['registrations', 'event', eventId, params],
    queryFn: () => api.fetchEventRegistrations(eventId, params),
    enabled: !!eventId,
  });
}

export function useRegistrationsByUser(userId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['registrations', 'user', userId, params],
    queryFn: () => api.fetchRegistrationsByUser(userId, params),
    enabled: !!userId,
  });
}

export function useRegistrationCount(eventId: string) {
  return useQuery({
    queryKey: ['registrationCount', eventId],
    queryFn: () => api.getRegistrationCount(eventId),
    enabled: !!eventId,
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRegistrationDto) => api.createRegistration(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registrationCount', variables.eventId] });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cancelRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
}

// ── Tickets ──────────────────────────────────────────────────────────────────

export function useTickets(params?: PaginationParams) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => api.fetchTickets(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.fetchTicket(id),
    enabled: !!id,
  });
}

export function useTicketByCode(code: string) {
  return useQuery({
    queryKey: ['ticket', 'code', code],
    queryFn: () => api.fetchTicketByCode(code),
    enabled: !!code,
  });
}

export function useTicketsByEvent(eventId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['tickets', 'event', eventId, params],
    queryFn: () => api.fetchTicketsByEvent(eventId, params),
    enabled: !!eventId,
  });
}

export function useTicketsByUser(userId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['tickets', 'user', userId, params],
    queryFn: () => api.fetchTicketsByUser(userId, params),
    enabled: !!userId,
  });
}

export function useRegenerateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.regenerateTicket(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useEmailTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.emailTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

// ── Attendance ───────────────────────────────────────────────────────────────

export function useAttendance(params?: PaginationParams) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => api.fetchAttendance(params),
  });
}

export function useAttendanceByEvent(eventId: string) {
  return useQuery({
    queryKey: ['attendance', 'event', eventId],
    queryFn: () => api.fetchAttendanceByEvent(eventId),
    enabled: !!eventId,
  });
}

export function useAttendanceByUser(userId: string) {
  return useQuery({
    queryKey: ['attendance', 'user', userId],
    queryFn: () => api.fetchAttendanceByUser(userId),
    enabled: !!userId,
  });
}

export function useAttendanceStats(eventId: string) {
  return useQuery({
    queryKey: ['attendanceStats', eventId],
    queryFn: () => api.getAttendanceStats(eventId),
    enabled: !!eventId,
  });
}

export function useVerifyTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VerifyTicketDto) => api.verifyTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

// ── Analytics ────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.fetchDashboardStats(),
    staleTime: 10 * 60 * 1000, // stats change rarely — cache 10 min
  });
}

export function useEventStats(eventId: string) {
  return useQuery({
    queryKey: ['analytics', 'event', eventId],
    queryFn: () => api.fetchEventStats(eventId),
    enabled: !!eventId,
  });
}

export function usePopularEvents(limit?: number) {
  return useQuery({
    queryKey: ['analytics', 'popular', limit],
    queryFn: () => api.fetchPopularEvents(limit),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRegistrationsOverTime() {
  return useQuery({
    queryKey: ['analytics', 'registrationsOverTime'],
    queryFn: () => api.fetchRegistrationsOverTime(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAttendanceOverTime() {
  return useQuery({
    queryKey: ['analytics', 'attendanceOverTime'],
    queryFn: () => api.fetchAttendanceOverTime(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useEventsByStatus() {
  return useQuery({
    queryKey: ['analytics', 'eventsByStatus'],
    queryFn: () => api.fetchEventsByStatus(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRegistrationsByEventStats() {
  return useQuery({
    queryKey: ['analytics', 'registrationsByEvent'],
    queryFn: () => api.fetchRegistrationsByEvent(),
    staleTime: 10 * 60 * 1000,
  });
}

// ── Announcements ────────────────────────────────────────────────────────────

export function useAnnouncements(eventId: string) {
  return useQuery({
    queryKey: ['announcements', eventId],
    queryFn: () => api.fetchAnnouncements(eventId),
    enabled: !!eventId,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementDto) => api.createAnnouncement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements', variables.eventId] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// ── Crew Hooks ──────────────────────────────────────────────────────────────

export function useCrewDashboard() {
  return useQuery({
    queryKey: ['crew', 'dashboard'],
    queryFn: () => api.fetchCrewDashboard(),
    staleTime: 2 * 1000, // refresh stats slightly more frequently
  });
}

export function useCrewEvents() {
  return useQuery({
    queryKey: ['crew', 'events'],
    queryFn: () => api.fetchCrewEvents(),
  });
}

export function useCrewAttendance(params?: { search?: string }) {
  return useQuery({
    queryKey: ['crew', 'attendance', params],
    queryFn: () => api.fetchCrewAttendance(params),
  });
}

export function useMarkCrewAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { ticketCode: string; scannerId?: string }) => api.markCrewAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['crew', 'attendance'] });
    },
  });
}

export function useVerifyCrewTicket(ticketCode: string) {
  return useQuery({
    queryKey: ['crew', 'verify', ticketCode],
    queryFn: () => api.verifyCrewTicket(ticketCode),
    enabled: !!ticketCode,
  });
}

export function useSearchCrewRegistrations(query: string) {
  return useQuery({
    queryKey: ['crew', 'registrations', 'search', query],
    queryFn: () => api.searchCrewRegistrations(query),
    enabled: query !== undefined && query !== null,
  });
}

export function useCrewAnnouncements() {
  return useQuery({
    queryKey: ['crew', 'announcements'],
    queryFn: () => api.fetchCrewAnnouncements(),
  });
}

export function useCreateCrewIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      priority: string;
      eventId: string;
      attachmentUrl?: string;
    }) => api.createCrewIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['crew', 'incidents'] });
    },
  });
}

export function useCrewIncidents() {
  return useQuery({
    queryKey: ['crew', 'incidents'],
    queryFn: () => api.fetchCrewIncidents(),
  });
}

export function useCrewTasks() {
  return useQuery({
    queryKey: ['crew', 'tasks'],
    queryFn: () => api.fetchCrewTasks(),
  });
}

export function useUpdateCrewTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateCrewTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['crew', 'tasks'] });
    },
  });
}
