import { http } from '@/shared/api/http'
import type { StudentProfile } from '@/modules/mentor/types'

export const mentorStudentsApi = {
  getProfile: (candidateProfileId: string) =>
    http.get<StudentProfile>(`/mentors/me/students/${candidateProfileId}`).then((r) => r.data),
}
