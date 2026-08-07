import { http } from '@/shared/api/http'
import type { Application, ApplicationCertificate, ApplicationStatus } from '@/modules/scholarships/types'

export const applicationsApi = {
  listMine: (status?: ApplicationStatus) =>
    http.get<Application[]>('/me/applications', { params: status ? { status } : undefined }).then((r) => r.data),
  get: (id: string) => http.get<Application>(`/applications/${id}`).then((r) => r.data),
  create: (scholarshipId: string) =>
    http.post<Application>(`/scholarships/${scholarshipId}/applications`, {}).then((r) => r.data),
  cancel: (id: string) => http.delete<{ deleted: boolean }>(`/applications/${id}`).then((r) => r.data),
  uploadCv: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<Application>(`/applications/${id}/cv`, form).then((r) => r.data)
  },
  uploadEssay: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<Application>(`/applications/${id}/essay`, form).then((r) => r.data)
  },
  upsertCertificate: (id: string, certificateType: string, certificateScore: string) =>
    http
      .post<ApplicationCertificate>(`/applications/${id}/certificates`, {
        certificate_type: certificateType,
        certificate_score: certificateScore,
      })
      .then((r) => r.data),
  deleteCertificate: (id: string, certificateId: string) =>
    http.delete<{ deleted: boolean }>(`/applications/${id}/certificates/${certificateId}`).then((r) => r.data),
  uploadCertificateAttachment: (id: string, certificateId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<ApplicationCertificate>(`/applications/${id}/certificates/${certificateId}/attachment`, form).then((r) => r.data)
  },
}
