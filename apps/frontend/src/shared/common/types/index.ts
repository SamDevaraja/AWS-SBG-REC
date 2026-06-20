export * from './auth';

// ── Enums & String Unions ───────────────────────────────────────────────────

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'ARCHIVED';

export type EventMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED';

export type NotificationType =
  | 'REGISTRATION_SUCCESS'
  | 'TICKET_GENERATED'
  | 'EVENT_REMINDER'
  | 'EVENT_UPDATE';

export type FieldType =
  | 'TEXT'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'TEXTAREA';

// ── Core Models ──────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt: string;
  user?: User;
  role?: Role;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  roles?: UserRole[];
}

export interface Event {
  id: string;
  title: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  posterImage?: string;
  venue?: string;
  mode?: EventMode;
  capacity?: number;
  date?: string;
  time?: string;
  registrationDeadline?: string;
  status: EventStatus;
  registrationFormType: 'DEFAULT' | 'CUSTOM';
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  organizer?: User;
  agenda?: EventAgenda[];
  speakers?: EventSpeaker[];
  formFields?: FormField[];
  registrations?: Registration[];
  tickets?: Ticket[];
  announcements?: Announcement[];
  _count?: {
    registrations?: number;
    [key: string]: number | undefined;
  };
}

export interface EventAgenda {
  id: string;
  eventId: string;
  title: string;
  speaker?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventSpeaker {
  id: string;
  eventId: string;
  name: string;
  role?: string;
  organization?: string;
  bio?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  eventId: string;
  label: string;
  type: FieldType;
  isRequired: boolean;
  fieldOrder: number;
  options?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registrationDate: string;
  status: RegistrationStatus;
  name: string;
  roll_number: string;
  email: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  event?: Event;
  answers?: RegistrationAnswer[];
  ticket?: Ticket;
}

export interface RegistrationAnswer {
  id: string;
  registrationId: string;
  fieldId: string;
  value: string | number | boolean | string[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  registrationId: string;
  eventId: string;
  ticketCode: string;
  qrCodeUrl?: string;
  status: TicketStatus;
  scannedAt?: string;
  scannerId?: string;
  createdAt: string;
  updatedAt: string;
  registration?: Registration;
  event?: Event;
  attendance?: AttendanceLog[];
  userName?: string;
  userRoll?: string;
  userEmail?: string;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  attendanceStatus?: string;
}

export interface AttendanceLog {
  id: string;
  ticketId: string;
  userId: string;
  eventId: string;
  scannedAt: string;
  scannerId: string;
  ticket?: Ticket;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  user?: User;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

export interface Announcement {
  id: string;
  eventId: string;
  title: string;
  message: string;
  type: string;
  sendEmail: boolean;
  createdAt: string;
  updatedAt: string;
  event?: Event;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateEventDto {
  organizerId: string;
  title: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  posterImage?: string;
  venue?: string;
  mode?: EventMode;
  capacity?: number;
  date?: string;
  time?: string;
  registrationDeadline?: string;
  status?: EventStatus;
  registrationFormType?: 'DEFAULT' | 'CUSTOM';
  agenda?: CreateAgendaDto[];
  speakers?: CreateSpeakerDto[];
  formFields?: CreateFormFieldDto[];
}

export type UpdateEventDto = Partial<CreateEventDto>;

export interface CreateAgendaDto {
  title: string;
  speaker?: string;
  startTime: string;
  endTime: string;
}

export interface CreateSpeakerDto {
  name: string;
  role?: string;
  organization?: string;
  bio?: string;
  photo?: string;
}

export interface CreateFormFieldDto {
  label: string;
  type: FieldType;
  isRequired?: boolean;
  fieldOrder?: number;
  options?: Record<string, unknown>;
}

export interface UpdateFormFieldDto extends CreateFormFieldDto {
  id?: string;
}

export interface CreateRegistrationDto {
  userId: string;
  eventId: string;
  name: string;
  roll_number: string;
  email: string;
  department: string;
  answers?: RegistrationAnswerDto[];
}

export interface RegistrationAnswerDto {
  fieldId: string;
  value: string | number | boolean | string[];
}

export interface CreateAnnouncementDto {
  eventId: string;
  title: string;
  message: string;
  type?: string;
  sendEmail?: boolean;
}

export interface VerifyTicketDto {
  ticketCode: string;
  scannerId: string;
  eventId: string;
}

// ── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  status?: string;
  mode?: string;
  eventId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalUsers: number;
  totalTickets: number;
  recentEvents: Event[];
  registrationsOverTime: { date: string; count: number }[];
}

export interface EventStats {
  eventId: string;
  totalRegistrations: number;
  totalTickets: number;
  checkedIn: number;
  capacity: number;
  registrationTrend: { date: string; count: number }[];
}

export interface PopularEvent {
  eventId: string;
  title: string;
  registrationCount: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface EventRegistrationCount {
  eventId: string;
  title: string;
  count: number;
}

export interface AttendanceStats {
  totalRegistered: number;
  totalScanned: number;
  totalPending: number;
  scanRate: number;
}

export interface VerifyTicketResponse {
  valid: boolean;
  status: string;
  registration?: Registration;
  ticket?: Ticket;
}
