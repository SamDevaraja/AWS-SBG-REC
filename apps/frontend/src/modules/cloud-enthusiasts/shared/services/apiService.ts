import { Event, DynamicFormField, Registration, Ticket } from '../types';

export interface RegisterPayload {
  fullName: string;
  rollNumber: string;
  department: string;
  email: string;
  responses: Record<string, string>;
}

// ── Mapper Functions ─────────────────────────────────────────────────────────

function mapBackendEventToFrontend(e: any): Event {
  if (!e) return e;
  return {
    event_id: e.id,
    title: e.title,
    category: e.category || '',
    short_description: e.shortDescription || '',
    full_description: e.description || '',
    banner_url: e.posterImage || '/default-event-poster.png',
    venue: e.venue || '',
    mode: e.mode || '',
    max_capacity: e.capacity || 0,
    start_datetime: e.date || '',
    end_datetime: e.endDatetime || '',
    registration_deadline: e.registrationDeadline || '',
    event_status: e.status === 'COMPLETED' || e.status === 'ARCHIVED' || e.status === 'Ended' ? 'Ended' : (e.status === 'ONGOING' || e.status === 'Ongoing' ? 'Ongoing' : 'Upcoming'),
    registered: e._count?.registrations || e.registered || 0,
    created_at: e.createdAt || '',
    updated_at: e.updatedAt || '',
    agenda: e.agendaJson || e.agenda || [],
    speaker_details: (e.speakerDetailsJson || e.speakers || []).map((s: any) => ({
      name: s.name,
      designation: s.role || s.designation,
      bio: s.bio,
      avatar_url: s.photo || s.avatar_url,
      linkedin_url: s.linkedinUrl || s.linkedin_url || '',
    })),
  };
}

function mapBackendTicketToFrontend(t: any): Ticket {
  if (!t) return t;
  return {
    ticket_id: t.id,
    registration_id: t.registrationId,
    event_id: t.eventId,
    ticket_status: t.status,
    ticket_code: t.ticketCode,
    event_title: t.eventTitle,
    event_date: t.eventDate,
    event_time: t.eventTime,
    event_venue: t.eventVenue,
    user_name: t.userName,
    user_roll: t.userRoll,
    user_email: t.userEmail,
    qr_code_url: t.qrCodeUrl,
    scanned_at: t.scannedAt,
    scanner_id: t.scannerId,
    attendance_status: t.attendanceStatus,
  };
}

function mapBackendRegistrationToFrontend(r: any): Registration {
  if (!r) return r;
  return {
    registration_id: r.id,
    user_id: r.userId,
    event_id: r.eventId,
    registration_date: r.registrationDate || r.createdAt,
    registration_status: r.status,
    email_sent: r.emailSent || false,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    responses: r.responses || {},
  };
}

function mapBackendFormFieldToFrontend(f: any, eventId: string): DynamicFormField {
  return {
    field_id: f.id,
    event_id: f.eventId || eventId,
    field_label: f.label,
    field_type: (f.type || 'text').toLowerCase() as any,
    is_required: f.isRequired || false,
    field_order: f.fieldOrder || 0,
    select_options: f.options?.values || f.select_options || [],
  };
}

// ── API Service Object ───────────────────────────────────────────────────────

export const apiService = {
  async getEvents(filters?: {
    search?: string;
    category?: string;
    availability?: string;
  }): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.availability) params.append('availability', filters.availability);

    try {
      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) {
        console.error('[apiService.getEvents] Fetch failed:', res.status, res.statusText);
        try {
          const text = await res.text();
          console.error('[apiService.getEvents] Error response body:', text);
        } catch (_) {}
        throw new Error('Failed to fetch events');
      }
      const data = await res.json();
      
      // Extract events array and map to frontend snake_case schema
      const rawEvents = data.data?.data || data.data || [];
      return Array.isArray(rawEvents) ? rawEvents.map(mapBackendEventToFrontend) : [];
    } catch (err) {
      console.error('[apiService.getEvents] Exception caught during fetch:', err);
      throw err;
    }
  },

  async getEventById(eventId: string): Promise<{ event: Event; formFields: DynamicFormField[] }> {
    const res = await fetch(`/api/events/${eventId}`);
    if (!res.ok) throw new Error('Failed to fetch event details');
    const data = await res.json();
    
    const backendEvent = data.data;
    if (!backendEvent) {
      throw new Error('Event not found');
    }

    return {
      event: mapBackendEventToFrontend(backendEvent),
      formFields: (backendEvent.formFields || []).map((f: any) => mapBackendFormFieldToFrontend(f, eventId)),
    };
  },

  async registerForEvent(
    eventId: string,
    payload: RegisterPayload
  ): Promise<{ registration: Registration; ticket: Ticket; warning?: string }> {
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to complete registration');
    }
    
    return {
      registration: mapBackendRegistrationToFrontend(data.data.registration),
      ticket: mapBackendTicketToFrontend(data.data.ticket),
      warning: data.warning,
    };
  },

  async getMyTickets(): Promise<Ticket[]> {
    try {
      // For attendees, we rely on local storage because we don't have a session-based backend endpoint
      const rawTickets = localStorage.getItem('aws_sgb_rec_tickets');
      const localTickets = rawTickets ? JSON.parse(rawTickets) : [];
      return localTickets.map((t: any) => ({
        ticket_id: t.ticketId,
        registration_id: t.regId,
        event_id: t.eventId,
        ticket_status: 'Ticket Available',
        ticket_code: t.ticketId.split('-')[0].toUpperCase(),
        event_title: t.eventTitle,
        event_date: t.date,
        event_time: t.time,
        user_name: t.name,
        user_email: t.email,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.ticketId}`,
      }));
    } catch (error) {
      console.error('Failed to parse local tickets:', error);
      return [];
    }
  },

  async getTicketVerification(ticketId: string): Promise<{
    success: boolean;
    status: string;
    ticket?: Ticket;
    event?: Event;
    error?: string;
  }> {
    const res = await fetch(`/api/tickets/${ticketId}`);
    if (!res.ok) throw new Error('Failed to verify ticket');
    const data = await res.json();
    
    return {
      success: data.success,
      status: data.status || '',
      ticket: data.data?.ticket ? mapBackendTicketToFrontend(data.data.ticket) : undefined,
      event: data.data?.event ? mapBackendEventToFrontend(data.data.event) : undefined,
      error: data.error,
    };
  },

  async markAttendance(ticketId: string, scannerId: string): Promise<{
    success: boolean;
    ticket?: Ticket;
    error?: string;
  }> {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scannerId }),
    });
    const data = await res.json();
    return {
      success: data.success,
      ticket: data.data?.ticket ? mapBackendTicketToFrontend(data.data.ticket) : undefined,
      error: data.error,
    };
  },
};
