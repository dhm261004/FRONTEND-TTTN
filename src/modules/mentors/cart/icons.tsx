import type { SVGProps } from 'react'

function Icon(props: SVGProps<SVGSVGElement>) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} />
}

export const IconCart = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9.5" cy="20.5" r="1.3" />
    <circle cx="17.5" cy="20.5" r="1.3" />
  </Icon>
)

export const IconTrash = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-8 0 .8 12.2A2 2 0 0 0 9.8 21h4.4a2 2 0 0 0 2-1.8L17 7" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const IconMinus = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 12h12" strokeLinecap="round" />
  </Icon>
)

export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 6v12M6 12h12" strokeLinecap="round" />
  </Icon>
)
