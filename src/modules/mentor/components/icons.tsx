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

export const IconGraduationCap = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m12 4 9 4.5-9 4.5-9-4.5Z" strokeLinejoin="round" />
    <path d="M6.5 11v4.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V11" strokeLinecap="round" />
  </Icon>
)

export const IconAward = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="5.5" />
    <path d="m8.5 13.5-1.5 6 5-2.5 5 2.5-1.5-6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
  </Icon>
)

export const IconPencil = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m4 20 1-4.5L15.5 5l3.5 3.5L8.5 19 4 20Z" strokeLinejoin="round" />
    <path d="m13.5 6.5 4 4" strokeLinecap="round" />
  </Icon>
)

export const IconX = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
  </Icon>
)

export const IconArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 12h16M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconSparkle = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path
      d="M12 3.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path d="M19 15.5c.3 1.4 1 2.1 2.4 2.4-1.4.3-2.1 1-2.4 2.4-.3-1.4-1-2.1-2.4-2.4 1.4-.3 2.1-1 2.4-2.4Z" strokeLinejoin="round" />
  </Icon>
)

export const IconQuote = (p: SVGProps<SVGSVGElement>) => (
  <Icon fill="currentColor" stroke="none" {...p}>
    <path d="M9.5 6C6.5 6 4 8.7 4 12.3 4 15.4 6.1 18 9 18h.3c-.4 1.7-1.6 3-3.3 3.3v2.2c3.4-.4 6-3.3 6-7.3V12c0-3.3-1.1-6-2.5-6ZM19 6c-3 0-5.5 2.7-5.5 6.3 0 3.1 2.1 5.7 5 5.7h.3c-.4 1.7-1.6 3-3.3 3.3v2.2c3.4-.4 6-3.3 6-7.3V12c0-3.3-1.1-6-2.5-6Z" />
  </Icon>
)

export const IconMapPin = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" strokeLinejoin="round" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
)

export const IconMessageCircle = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.4-3.6A7.96 7.96 0 0 1 4 12Z" strokeLinejoin="round" strokeLinecap="round" />
  </Icon>
)
