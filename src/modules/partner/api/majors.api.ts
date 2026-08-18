import { http } from '@/shared/api/http'
import type { Major, MajorGroup } from '@/modules/partner/types'

export const majorsApi = {
  list: () => http.get<Major[]>('/majors').then((r) => r.data),
}

export const majorGroupsApi = {
  list: () => http.get<MajorGroup[]>('/major-groups').then((r) => r.data),
}
