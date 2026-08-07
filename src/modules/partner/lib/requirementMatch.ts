import type { Scholarship } from '@/modules/partner/types'

export type RequirementStatus = 'pass' | 'fail' | 'neutral'

export interface RequirementResult {
  status: RequirementStatus
  text: string
}

export function certificateMatches(candidateType: string, requiredType: string) {
  const a = candidateType.trim().toLowerCase()
  const b = requiredType.trim().toLowerCase()
  return a.includes(b) || b.includes(a)
}

export function gpaRequirementCheck(scholarship: Scholarship, candidateGpa: number | null): RequirementResult {
  if (scholarship.min_gpa == null) return { status: 'neutral', text: 'Học bổng không yêu cầu GPA tối thiểu.' }
  if (candidateGpa == null) return { status: 'fail', text: `Ứng viên chưa khai báo GPA (yêu cầu tối thiểu ${scholarship.min_gpa}).` }
  if (candidateGpa >= scholarship.min_gpa) {
    return { status: 'pass', text: `GPA ${candidateGpa} đạt yêu cầu tối thiểu ${scholarship.min_gpa}.` }
  }
  return { status: 'fail', text: `GPA ${candidateGpa} chưa đạt yêu cầu tối thiểu ${scholarship.min_gpa}.` }
}

export function majorsRequirementCheck(scholarship: Scholarship, targetMajors: string[]): RequirementResult {
  if (scholarship.majors.length === 0) return { status: 'neutral', text: 'Học bổng không giới hạn ngành học.' }
  const names = scholarship.majors.map((m) => m.name).join(', ')
  if (targetMajors.length === 0) return { status: 'neutral', text: `Ứng viên chưa khai báo ngành mục tiêu (học bổng cần: ${names}).` }
  const codes = scholarship.majors.map((m) => m.code.toLowerCase())
  const matched = targetMajors.some((m) => codes.includes(m.trim().toLowerCase()))
  return matched
    ? { status: 'pass', text: `Ngành mục tiêu của ứng viên khớp với: ${names}.` }
    : { status: 'fail', text: `Ngành mục tiêu của ứng viên không khớp (học bổng cần: ${names}).` }
}
