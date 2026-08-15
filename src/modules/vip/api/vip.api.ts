import { http } from '@/shared/api/http'
import type { VipPurchaseResult, VipStatus, VipSubject } from '@/modules/vip/types'

export const vipApi = {
  getStatus: () => http.get<VipStatus>('/vip/status').then((r) => r.data),
  purchase: (subject: VipSubject) => http.post<VipPurchaseResult>('/vip/purchase', { subject }).then((r) => r.data),
  listPurchases: (subject?: VipSubject) =>
    http.get<VipPurchaseResult[]>('/vip/purchases', { params: subject ? { subject } : undefined }).then((r) => r.data),
}
