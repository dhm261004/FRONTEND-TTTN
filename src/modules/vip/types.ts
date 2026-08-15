export type VipSubject = 'candidate' | 'partner' | 'mentor'

export interface VipSubjectStatus {
  has_profile: boolean
  vip_expires_at: string | null
  is_vip: boolean
  price: number
}

export type VipStatus = Record<VipSubject, VipSubjectStatus | null>

export interface VipPurchaseResult {
  id: string
  subject: VipSubject
  price: number
  vip_expires_at: string
  purchased_at: string
}
