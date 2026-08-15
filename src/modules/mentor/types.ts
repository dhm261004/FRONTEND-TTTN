export interface MentorCertificate {
  id: string
  name: string
  issued_by: string | null
  attachment_url: string | null
  created_at: string
}

export interface MentorAchievement {
  id: string
  title: string
  description: string | null
  created_at: string
}

export interface MentorService {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  benefits: string[]
  total_sessions: number
  is_active: boolean
  created_at: string
}

export interface MentorProfile {
  id: string
  full_name: string | null
  job_title: string | null
  bio: string | null
  avatar_url: string | null
  vip_expires_at: string | null
  created_at: string
  reviews_count?: number
  average_rating?: number | null
}

export interface MentorProfileDetailed extends MentorProfile {
  average_rating: number | null
  certificates: MentorCertificate[]
  achievements: MentorAchievement[]
  services: MentorService[]
}

export interface MentorProfilePayload {
  full_name?: string
  job_title?: string
  bio?: string
}

export interface MentorServicePayload {
  name: string
  description?: string
  duration_minutes: number
  price: number
  benefits?: string[]
  total_sessions: number
}

export interface MentorServiceUpdatePayload extends Partial<MentorServicePayload> {
  is_active?: boolean
}

export interface MentorPurchaseCandidate {
  candidate_profile_id: string
  full_name: string | null
  avatar_url: string | null
  email: string
}

export interface MentorServicePurchaseWithCandidate {
  id: string
  mentor_service_id: string
  service_name: string
  price: number
  total_sessions: number
  remaining_sessions: number
  purchased_at: string
  candidate: MentorPurchaseCandidate
}

export interface ListPurchasesParams {
  service_id?: string
  page?: number
  limit?: number
}

// Purchase as seen by the candidate who bought it — the mentor_* fields are enriched server-side
// (join through mentor_service.mentor_profile) so the "packages I bought" screen can show/link the mentor
// without a second round-trip; they're null only if a purchase somehow outlives its mentor_service.
export interface MentorPurchase {
  id: string
  mentor_service_id: string
  service_name: string
  price: number
  total_sessions: number
  remaining_sessions: number
  purchased_at: string
  mentor_profile_id: string | null
  mentor_full_name: string | null
  mentor_job_title: string | null
  mentor_avatar_url: string | null
}

export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'rescheduled'

export interface MentoringSession {
  id: string
  purchase_id: string
  mentor_profile_id: string
  candidate_profile_id: string
  topic: string
  note: string | null
  start_time: string
  end_time: string
  meeting_url: string | null
  status: SessionStatus
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

export interface CreateSessionPayload {
  topic: string
  note?: string
  start_time: string
  end_time: string
}

export interface SubmitReviewPayload {
  rating: number
  comment?: string
}

export interface UpdateSessionPayload {
  status?: SessionStatus
  start_time?: string
  end_time?: string
  meeting_url?: string | null
  cancel_reason?: string | null
}

export interface MentorReview {
  id: string
  purchase_id: string
  mentor_profile_id: string
  service_name: string | null
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface MentorReviewCandidate {
  full_name: string | null
  avatar_url: string | null
}

export interface MentorReviewWithCandidate {
  id: string
  purchase_id: string
  mentor_profile_id: string
  service_name: string | null
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  candidate: MentorReviewCandidate
}

export interface ListReviewsParams {
  page?: number
  limit?: number
}

export interface StudentCertificate {
  id: string
  certificate_type: string
  certificate_score: string
  attachment_url: string | null
  issued_at: string | null
  created_at: string
  updated_at: string
}

export interface StudentKeyValueItem {
  id: string
  title: string
  description: string | null
  created_at: string
}

export interface StudentProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  date_of_birth: string | null
  province_city: string | null
  ward: string | null
  financial_need_level: string | null
  target_majors: string[]
  current_school: string | null
  current_degree_level: string | null
  gpa: number | null
  avatar_url: string | null
  cv_url: string | null
  impact_leadership_score: number | null
  impact_leadership_reason: string | null
  cv_analyzed_at: string | null
  updated_at: string
  certificates: StudentCertificate[]
  activities: StudentKeyValueItem[]
  awards: StudentKeyValueItem[]
  purchases: MentorPurchase[]
  sessions: MentoringSession[]
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: Pagination
}
