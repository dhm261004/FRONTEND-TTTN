export interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface ListNotificationsParams {
  unread_only?: boolean
  page?: number
  limit?: number
}
