export interface User {
  user_id: string;
  full_name: string;
  email: string;
  roll_number: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface SpeakerDetail {
  name: string;
  designation?: string;
  bio?: string;
  avatar_url?: string;
  linkedin_url?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ResourceLink {
  label: string;
  url: string;
}

export interface Event {
  event_id: string;
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  mode: 'Online' | 'In-Person' | string;
  banner_url: string;
  start_datetime: string;
  end_datetime?: string;
  registration_deadline: string;
  max_capacity: number;
  venue: string;
  meeting_link?: string;
  event_status: 'Upcoming' | 'Ongoing' | 'Ended' | string;
  created_at: string;
  updated_at: string;
  
  // Dynamic computed registered count
  registered?: number;
  
  // Future-proofing fields for rich content sections
  agenda?: string[];
  speaker_details?: SpeakerDetail[];
  faqs?: FAQ[];
  guidelines?: string[];
  resources?: ResourceLink[];
  rules?: string[];
}

export interface Registration {
  registration_id: string;
  user_id: string;
  event_id: string;
  registration_date: string;
  registration_status: 'Registered' | 'Pending' | 'Cancelled' | string;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
  responses?: Record<string, string>; // Dynamic response dictionary fieldName -> value
}

export interface DynamicFormField {
  field_id: string;
  event_id: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'date' | 'url' | 'number';
  is_required: boolean;
  field_order: number;
  select_options?: string[]; // Possible values for select, radio, etc.
}

export interface RegistrationResponse {
  response_id: string;
  registration_id: string;
  field_id: string;
  response_value: string;
}

export interface Ticket {
  ticket_id: string;
  registration_id: string;
  event_id: string;
  ticket_status: 'Registered' | 'Ticket Not Yet Available' | 'Ticket Available' | 'Cancelled' | string;
  ticket_code?: string;
  event_title?: string;
  event_date?: string;
  event_time?: string;
  event_venue?: string;
  user_name?: string;
  user_roll?: string;
  user_email?: string;
  
  // Attendance and QR verification support
  qr_code_url?: string;
  scanned_at?: string;
  scanner_id?: string;
  attendance_status?: 'Absent' | 'Attended' | string;
}
