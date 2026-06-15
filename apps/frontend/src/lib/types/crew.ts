export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  seats: number;
  image: string;
  description: string;
  registered: boolean;
  type: "event" | "class";
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface WorkAssignment {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  deadline: string;
  status: "pending" | "in-progress" | "submitted" | "approved" | "rejected";
  rejectionReason?: string;
}

export interface AttendanceRecord {
  eventId: string;
  eventTitle: string;
  date: string;
  status: "present" | "absent";
  type: "event" | "class";
}

export interface RoadmapItem {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  completed: boolean;
  inProgress: boolean;
}
