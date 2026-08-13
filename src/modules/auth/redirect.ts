import type { UserPublic } from '@/modules/auth/types'

export function getPostLoginRedirect(user: UserPublic): string {
  if (user.roles.includes('partner')) return '/doi-tac'
  if (user.roles.includes('mentor')) return '/co-van'
  return '/'
}
