import { http } from '@/shared/api/http'
import type { Interaction, InteractionType } from '@/modules/scholarships/types'

export const interactionsApi = {
  // Lưu ý: backend đọc query param "type" (không phải "interaction_type") cho endpoint này —
  // xem scholarships.controller.ts#listInteractions (request.query.type).
  listMine: (type?: InteractionType) =>
    http.get<Interaction[]>('/me/interactions', { params: type ? { type } : undefined }).then((r) => r.data),
  create: (scholarshipId: string, interactionType: InteractionType) =>
    http
      .post<Interaction>(`/scholarships/${scholarshipId}/interactions`, { interaction_type: interactionType })
      .then((r) => r.data),
  update: (id: string, interactionType: InteractionType) =>
    http.patch<Interaction>(`/interactions/${id}`, { interaction_type: interactionType }).then((r) => r.data),
  remove: (id: string) => http.delete<{ deleted: boolean }>(`/interactions/${id}`).then((r) => r.data),
}
