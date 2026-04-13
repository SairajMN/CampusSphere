export type UserRole = "principal" | "hod" | "staff" | "cr";

export type EventStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "archived";

export type NotificationPriority = "critical" | "high" | "medium" | "low";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  year?: number;
  section?: string;
  avatar?: string;
}

export interface EventTarget {
  departments: string[];
  years: number[];
  sections: string[];
  includeAll: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "document";
  uri: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  organizer: string;
  organizerId: string;
  department: string;
  status: EventStatus;
  priority: "urgent" | "upcoming" | "regular";
  category: string;
  maxCapacity?: number;
  registeredCount: number;
  tags: string[];
  attachments: Attachment[];
  target: EventTarget;
  registrationUrl?: string;
  registrationDeadline?: string;
  fee?: number;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  viewCount: number;
  isRegistered?: boolean;
  imageUri?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  type: "event_created" | "event_approved" | "event_cancelled" | "reminder" | "update" | "announcement";
  eventId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  event: Event;
  submittedBy: User;
  submittedAt: string;
  reviewedBy?: User;
  reviewedAt?: string;
  comments?: string;
  status: "pending" | "approved" | "rejected";
}

export interface AnalyticsSummary {
  totalEvents: number;
  publishedEvents: number;
  pendingApprovals: number;
  totalRegistrations: number;
  totalViews: number;
  topEvents: { title: string; views: number; registrations: number }[];
  departmentStats: { dept: string; events: number; registrations: number }[];
  weeklyActivity: { day: string; events: number }[];
}

export interface ScanResult {
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  organizer?: string;
  description?: string;
  registrationUrl?: string;
  confidence: Record<string, number>;
}
