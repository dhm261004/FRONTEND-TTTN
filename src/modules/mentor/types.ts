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
  job_title: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  reviews_count?: number
}

export interface MentorProfileDetailed extends MentorProfile {
  average_rating: number | null
  certificates: MentorCertificate[]
  achievements: MentorAchievement[]
  services: MentorService[]
}

export interface MentorProfilePayload {
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

export interface UpdateSessionPayload {
  status?: SessionStatus
  start_time?: string
  end_time?: string
  meeting_url?: string | null
  cancel_reason?: string | null
}

export interface MentorReviewCandidate {
  full_name: string | null
  avatar_url: string | null
}

export interface MentorReviewWithCandidate {
  id: string
  purchase_id: string
  mentor_profile_id: string
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

export interface StudentProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  date_of_birth: string | null
  province_city: string | null
  ward: string | null
  financial_need_level: string | null
  is_first_generation: boolean
  target_majors: string[]
  current_school: string | null
  gpa: number | null
  extracurriculars: string | null
  awards: string | null
  avatar_url: string | null
  certificates: StudentCertificate[]
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
