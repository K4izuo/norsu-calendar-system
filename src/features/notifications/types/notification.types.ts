export interface AppNotification {
  id: string
  type: string
  data: {
    reservation_id: number
    title: string
    date: string
    time_start: string
    time_end: string
    message: string
    type: string
  }
  read_at: string | null
  created_at: string
}
