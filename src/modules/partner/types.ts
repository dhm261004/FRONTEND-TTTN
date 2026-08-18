export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

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
  approval_status: ApprovalStatus
  vip_expires_at: string | null
}

export interface MajorGroup {
  id: number
  code: string
  name: string
}

export interface Major {
  id: number
  code: string
  name: string
  group_id: number
  group_name: string
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
  is_vip_exclusive: boolean
  min_gpa: number | null
  location_province_cities: string[]
  start_date: string | null
  deadline: string
  is_active: boolean
  is_hidden: boolean
  total_slots: number | null
  total_budget: number | null
  created_at: string
  majors: Major[]
  required_certificates: ScholarshipCertificateRequirement[]
}

export interface PartnerStatsByUniversity {
  university: string
  selected_count: number
}

export interface PartnerStatsByProgram {
  scholarship_id: string
  title: string
  total_slots: number | null
  applications_count: number
  pending_count: number
  selected_count: number
  rejected_count: number
  slots_remaining: number | null
}

export interface PartnerStats {
  total_scholarships: number
  total_applications: number
  pending_applications: number
  selected_applications: number
  rejected_applications: number
  approval_rate: number | null
  by_university: PartnerStatsByUniversity[]
  by_program: PartnerStatsByProgram[]
}

export interface PartnerStatsParams {
  scholarship_id?: string
  from?: string
  to?: string
}

export type ApplicationStatus = 'pending' | 'won' | 'rejected'

export interface ApplicationCertificateInfo {
  id: string
  certificate_type: string
  certificate_score: string
  attachment_url: string | null
}

export interface ApplicationCandidate {
  candidate_profile_id: string
  full_name: string | null
  avatar_url: string | null
  email: string
  current_school: string | null
  gpa: number | null
  province_city: string | null
  financial_need_level: string | null
  target_majors: string[]
}

export interface ApplicationWithCandidate {
  id: string
  scholarship_id: string
  status: ApplicationStatus
  submitted_cv_url: string | null
  submitted_essay_url: string | null
  certificates: ApplicationCertificateInfo[]
  created_at: string
  updated_at: string
  candidate: ApplicationCandidate
}

export type ApplicationSort =
  | 'created_at_desc' | 'created_at_asc' | 'gpa_desc' | 'gpa_asc' | 'certificate_score_desc' | 'certificate_score_asc'

export interface ScholarshipApplicationsParams {
  status?: ApplicationStatus
  q?: string
  certificate_type?: string
  certificate_min_score?: number
  sort?: ApplicationSort
  page?: number
  limit?: number
}

export interface ScholarshipListParams {
  q?: string
  is_active?: boolean
  partner_profile_id?: string
  page?: number
  limit?: number
}

export interface ScholarshipPayload {
  title: string
  description: string
  degree: string
  value_type: string
  funding_percentage?: number | null
  is_no_essay?: boolean
  is_vip_exclusive?: boolean
  min_gpa?: number | null
  location_province_cities?: string[]
  start_date?: string | null
  deadline: string
  is_active?: boolean
  total_slots?: number | null
  total_budget?: number | null
  major_ids?: number[]
  required_certificates?: string[]
}
