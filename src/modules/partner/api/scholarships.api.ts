import { http } from '@/shared/api/http'
import type { PaginatedResult } from '@/shared/api/types'
import type { Scholarship, ScholarshipCertificateRequirement, ScholarshipListParams, ScholarshipPayload } from '@/modules/partner/types'

export const scholarshipsApi = {
  list: (params: ScholarshipListParams) =>
    http.get<PaginatedResult<Scholarship>>('/scholarships', { params }).then((r) => r.data),
  get: (id: string) => http.get<Scholarship>(`/scholarships/${id}`).then((r) => r.data),
  create: (payload: ScholarshipPayload) => http.post<Scholarship>('/scholarships', payload).then((r) => r.data),
  update: (id: string, payload: Partial<ScholarshipPayload>) =>
    http.patch<Scholarship>(`/scholarships/${id}`, payload).then((r) => r.data),
  remove: (id: string) => http.delete<{ deleted: boolean }>(`/scholarships/${id}`).then((r) => r.data),
  uploadImage: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<Scholarship>(`/scholarships/${id}/image`, form).then((r) => r.data)
  },
  addMajor: (id: string, majorId: number) =>
    http.post<{ attached: boolean }>(`/scholarships/${id}/majors`, { major_id: majorId }).then((r) => r.data),
  removeMajor: (id: string, majorId: number) =>
    http.delete<{ detached: boolean }>(`/scholarships/${id}/majors/${majorId}`).then((r) => r.data),
  addRequirement: (id: string, certificateType: string) =>
    http
      .post<ScholarshipCertificateRequirement>(`/scholarships/${id}/requirements`, { certificate_type: certificateType })
      .then((r) => r.data),
  removeRequirement: (id: string, requirementId: string) =>
    http.delete<{ deleted: boolean }>(`/scholarships/${id}/requirements/${requirementId}`).then((r) => r.data),
}
