import type { SVGProps } from 'react'

function Icon(props: SVGProps<SVGSVGElement>) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} />
}

export const IconFolder = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" strokeLinejoin="round" />
  </Icon>
)

export const IconUser = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
  </Icon>
)

export const IconLock = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
  </Icon>
)

export const IconCreditCard = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" strokeLinecap="round" />
  </Icon>
)

export const IconGraduationCap = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m2 9 10-5 10 5-10 5-10-5Z" strokeLinejoin="round" />
    <path d="M6 11v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" strokeLinecap="round" />
  </Icon>
)

export const IconBookmark = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 4h12v17l-6-4-6 4V4Z" strokeLinejoin="round" />
  </Icon>
)

export const IconLightbulb = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.2.9 2.1h5.2c0-.9.3-1.6.9-2.1A6 6 0 0 0 12 3Z" strokeLinejoin="round" />
  </Icon>
)

export const IconMegaphone = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 10v4a1 1 0 0 0 1 1h2l4 4V5L6 9H4a1 1 0 0 0-1 1Z" strokeLinejoin="round" />
    <path d="M15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14" strokeLinecap="round" />
  </Icon>
)

export const IconMail = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconPackage = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m3 7 9-4 9 4-9 4-9-4Z" strokeLinejoin="round" />
    <path d="M3 7v10l9 4 9-4V7M12 11v10" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconCalendar = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" strokeLinecap="round" />
  </Icon>
)

export const IconPlusCircle = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" strokeLinecap="round" />
  </Icon>
)

export const IconAward = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="5.5" />
    <path d="m8.5 13.5-1.5 6 5-2.5 5 2.5-1.5-6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconX = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
  </Icon>
)
