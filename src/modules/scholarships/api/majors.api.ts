import { http } from '@/shared/api/http'
import type { Major } from '@/modules/scholarships/types'

export const majorsApi = {
  list: () => http.get<Major[]>('/majors').then((r) => r.data),
}
