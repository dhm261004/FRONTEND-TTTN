import { http } from '@/shared/api/http'
import type { PaginatedResult } from '@/shared/api/types'
import type { ListNotificationsParams, Notification } from '@/modules/notifications/types'

export const notificationsApi = {
  listMine: (params?: ListNotificationsParams) =>
    http.get<PaginatedResult<Notification> & { unread_count: number }>('/notifications/me', { params }).then((r) => r.data),
  markRead: (id: string) => http.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => http.patch<{ status: string }>('/notifications/me/read-all').then((r) => r.data),
}
