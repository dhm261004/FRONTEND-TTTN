import { http } from '@/shared/api/http'
import type { PaginatedResult } from '@/shared/api/types'
import type { ApplicationWithCandidate, ScholarshipApplicationsParams } from '@/modules/partner/types'

export const applicationsApi = {
  listForScholarship: (scholarshipId: string, params: ScholarshipApplicationsParams) =>
    http
      .get<PaginatedResult<ApplicationWithCandidate>>(`/scholarships/${scholarshipId}/applications`, { params })
      .then((r) => r.data),
  updateStatus: (applicationId: string, status: 'won' | 'rejected') =>
    http.patch<ApplicationWithCandidate>(`/applications/${applicationId}/status`, { status }).then((r) => r.data),
  exportForScholarship: (scholarshipId: string, params: Omit<ScholarshipApplicationsParams, 'page' | 'limit'>) =>
    http
      .get(`/scholarships/${scholarshipId}/applications/export`, { params, responseType: 'blob' })
      .then((r) => r.data as Blob),
}
