export type ActivityLogType =
  | 'reservation_created'
  | 'reservation_approved'
  | 'reservation_declined'
  | 'reservation_endorsed'
  | 'reservation_moved';

export interface ActivityLog {
  id: string;
  type: ActivityLogType;
  title: string;
  description: string;
  created_at: string;
}

export interface ActivityLogGroup {
  label: string;
  items: ActivityLog[];
}
