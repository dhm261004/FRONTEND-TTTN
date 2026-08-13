export interface CandidateProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  date_of_birth: string | null
  province_city: string | null
  ward: string | null
  financial_need_level: string | null
  target_majors: string[]
  current_school: string | null
  current_degree_level: string | null
  gpa: number | null
  cv_url: string | null
  impact_leadership_score: number | null
  impact_leadership_reason: string | null
  cv_analyzed_at: string | null
  updated_at: string
}

export interface CandidateProfileUpdatePayload {
  full_name?: string | null
  phone?: string | null
  date_of_birth?: string | null
  province_city?: string | null
  ward?: string | null
  financial_need_level?: string | null
  target_majors?: string[]
  current_school?: string | null
  current_degree_level?: string | null
  gpa?: number | null
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

export interface CandidateActivity {
  id: string
  title: string
  description: string | null
  created_at: string
}

export interface CandidateAward {
  id: string
  title: string
  description: string | null
  created_at: string
}
