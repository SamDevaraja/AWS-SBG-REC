// Constants and types used across the application

// =============================================================================
// EVENT CATEGORIES
// =============================================================================

export const EVENT_CATEGORIES = ['All', 'Workshop', 'Bootcamp', 'AI/ML', 'DevOps', 'Analytics'] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

// =============================================================================
// EVENT STATUSES
// =============================================================================

export const EVENT_STATUSES = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  ENDED: 'Ended',
} as const;

export type EventStatus = (typeof EVENT_STATUSES)[keyof typeof EVENT_STATUSES];

// =============================================================================
// TICKET STATUSES
// =============================================================================

export const TICKET_STATUSES = {
  REGISTERED: 'Registered',
  TICKET_NOT_YET_AVAILABLE: 'Ticket Not Yet Available',
  TICKET_AVAILABLE: 'Ticket Available',
  CANCELLED: 'Cancelled',
} as const;

export type TicketStatus = (typeof TICKET_STATUSES)[keyof typeof TICKET_STATUSES];

// =============================================================================
// REGISTRATION STATUSES
// =============================================================================

export const REGISTRATION_STATUSES = {
  REGISTERED: 'Registered',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
} as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[keyof typeof REGISTRATION_STATUSES];

// =============================================================================
// ATTENDANCE STATUSES
// =============================================================================

export const ATTENDANCE_STATUSES = {
  ABSENT: 'Absent',
  ATTENDED: 'Attended',
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[keyof typeof ATTENDANCE_STATUSES];

// =============================================================================
// FILTER OPTIONS
// =============================================================================

export const AVAILABILITY_FILTERS = [
  { value: 'All', label: 'All Seats Status' },
  { value: 'Available', label: 'Seats Available' },
  { value: 'Full', label: 'Fully Booked / Ended' },
] as const;

// =============================================================================
// LOCAL STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  TICKETS: 'cloud_enthusiasts_tickets',
} as const;

// =============================================================================
// APP CONSTANTS
// =============================================================================

export const APP_NAME = 'Cloud Enthusiasts';
export const ORGANIZATION_NAME = 'Cloud Enthusiasts Club Team';
