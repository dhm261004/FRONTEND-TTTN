import { http } from '@/shared/api/http'
import type { CandidateCertificate, CandidateProfile, CandidateProfileUpdatePayload } from '@/modules/candidate/types'

export const candidateProfileApi = {
  getMe: () => http.get<CandidateProfile>('/candidates/me').then((r) => r.data),
  updateMe: (payload: CandidateProfileUpdatePayload) =>
    http.patch<CandidateProfile>('/candidates/me', payload).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<CandidateProfile>('/candidates/me/avatar', form).then((r) => r.data)
  },
  listCertificates: () => http.get<CandidateCertificate[]>('/candidates/me/certificates').then((r) => r.data),
  createCertificate: (payload: { certificate_type: string; certificate_score: string; issued_at?: string | null }) =>
    http.post<CandidateCertificate>('/candidates/me/certificates', payload).then((r) => r.data),
  deleteCertificate: (id: string) =>
    http.delete<{ deleted: boolean }>(`/candidates/me/certificates/${id}`).then((r) => r.data),
  uploadCertificateAttachment: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<CandidateCertificate>(`/candidates/me/certificates/${id}/attachment`, form).then((r) => r.data)
  },
}
