export interface CandidateProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
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
  updated_at: string
}

export interface CandidateProfileUpdatePayload {
  full_name?: string | null
  phone?: string | null
  date_of_birth?: string | null
  province_city?: string | null
  ward?: string | null
  financial_need_level?: string | null
  is_first_generation?: boolean
  target_majors?: string[]
  current_school?: string | null
  gpa?: number | null
  extracurriculars?: string | null
  awards?: string | null
}

export interface CandidateCertificate {
  id: string
  certificate_type: string
  certificate_score: string
  attachment_url: string | null
  issued_at: string | null
  created_at: string
  updated_at: string
}
