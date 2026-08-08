import { http } from '@/shared/api/http'
import type {
  MentorAchievement,
  MentorCertificate,
  MentorProfile,
  MentorProfileDetailed,
  MentorProfilePayload,
} from '@/modules/mentor/types'

export const mentorProfileApi = {
  // GET /mentors/me is the only endpoint that returns certificates/achievements/services/average_rating —
  // create/update/uploadAvatar return the shallow profile, so callers must merge into existing detailed state.
  getMe: () => http.get<MentorProfileDetailed>('/mentors/me').then((r) => r.data),
  create: (payload: MentorProfilePayload) => http.post<MentorProfile>('/mentors/me', payload).then((r) => r.data),
  update: (payload: MentorProfilePayload) => http.patch<MentorProfile>('/mentors/me', payload).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<MentorProfile>('/mentors/me/avatar', form).then((r) => r.data)
  },
  createCertificate: (payload: { name: string; issued_by?: string }) =>
    http.post<MentorCertificate>('/mentors/me/certificates', payload).then((r) => r.data),
  deleteCertificate: (id: string) =>
    http.delete<{ deleted: boolean }>(`/mentors/me/certificates/${id}`).then((r) => r.data),
  uploadCertificateAttachment: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<MentorCertificate>(`/mentors/me/certificates/${id}/attachment`, form).then((r) => r.data)
  },
  createAchievement: (payload: { title: string; description?: string }) =>
    http.post<MentorAchievement>('/mentors/me/achievements', payload).then((r) => r.data),
  deleteAchievement: (id: string) =>
    http.delete<{ deleted: boolean }>(`/mentors/me/achievements/${id}`).then((r) => r.data),
}
