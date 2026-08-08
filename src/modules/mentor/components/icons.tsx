import type { SVGProps } from 'react'

function Icon(props: SVGProps<SVGSVGElement>) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} />
}

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

export const IconWallet = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18M16 14h2" strokeLinecap="round" />
  </Icon>
)

export const IconBriefcase = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
  </Icon>
)

export const IconIdCard = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="12" r="2" />
    <path d="M6 16c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5M15 10h4M15 14h4" strokeLinecap="round" />
  </Icon>
)

export const IconStar = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m12 3 2.6 5.8 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20l1.4-6.3-4.8-4.3 6.4-.6Z" strokeLinejoin="round" />
  </Icon>
)

export const IconCalendarClock = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="15" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    <circle cx="15.5" cy="15" r="3.5" />
    <path d="M15.5 13.3V15l1.2.9" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconCheckCircle = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconXCircle = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
  </Icon>
)

export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconUsers = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.8 20c0-3.5 3-5.5 6.2-5.5s6.2 2 6.2 5.5" strokeLinecap="round" />
    <path d="M16 8.2a3.2 3.2 0 1 1 0 6.4M21.2 20c0-2.9-2-4.7-4.7-5.3" strokeLinecap="round" />
  </Icon>
)

export const IconPlusCircle = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" strokeLinecap="round" />
  </Icon>
)
