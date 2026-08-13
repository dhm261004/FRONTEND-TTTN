export interface Major {
  id: number
  code: string
  name: string
}

export interface ScholarshipCertificateRequirement {
  id: string
  certificate_type: string
}

export interface Scholarship {
  id: string
  title: string
  partner_profile_id: string | null
  description: string
  image_url: string | null
  degree: string
  value_type: string
  funding_percentage: number | null
  is_no_essay: boolean
  min_gpa: number | null
  location_province_cities: string[]
  start_date: string | null
  deadline: string
  is_active: boolean
  total_slots: number | null
  total_budget: number | null
  created_at: string
  majors: Major[]
  required_certificates: ScholarshipCertificateRequirement[]
}

export interface ScholarshipListParams {
  q?: string
  degree?: string
  value_type?: string
  is_active?: boolean
  location_province_city?: string
  major_id?: number
  partner_profile_id?: string
  gpa?: number
  page?: number
  limit?: number
}

export interface PartnerProfile {
  id: string
  company_name: string
  logo_url: string | null
  cover_image_url: string | null
  description: string | null
  website_url: string | null
  industry_sector: string | null
  founding_year: number | null
  company_size: string | null
  headquarters_address: string | null
  province_city: string | null
  linkedin_url: string | null
  facebook_url: string | null
  approval_status: 'pending' | 'approved' | 'rejected'
}

export type InteractionType = 'saved' | 'hidden'

export interface Interaction {
  id: string
  scholarship_id: string
  interaction_type: InteractionType
  created_at: string
  updated_at: string
}

export type ApplicationStatus = 'pending' | 'won' | 'rejected'

export interface ApplicationCertificate {
  id: string
  certificate_type: string
  certificate_score: string
  attachment_url: string | null
}

export interface Application {
  id: string
  scholarship_id: string
  status: ApplicationStatus
  submitted_cv_url: string | null
  submitted_essay_url: string | null
  certificates: ApplicationCertificate[]
  created_at: string
  updated_at: string
}

export interface MatchCriterion {
  criterion: string
  score: number
  max_score: number
  applicable: boolean
  reason: string
}

export type MatchLabel = 'very_good_fit' | 'good_fit' | 'partial_fit' | 'low_fit'

export interface MatchResult {
  scholarship_id: string
  title: string
  degree: string
  value_type: string
  deadline: string
  is_active: boolean
  score: number
  label: MatchLabel
  breakdown: MatchCriterion[]
}
