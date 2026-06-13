import type { AppraisalSection } from '../../types'

export type ActionKey =
  | 'actionPromotion'
  | 'actionSalaryIncrement'
  | 'actionPerformanceIncentive'
  | 'actionTrainingDevelopment'
  | 'actionRoleEnhancement'

export const SECTION_LABELS: Record<AppraisalSection, string> = {
  KPI: 'Key Performance Indicators (KPIs)',
  COMPETENCY: 'Competency & Behavioural',
  CREDIT_CONTROL: 'Collections & Credit Control',
}

export const SECTION_ORDER: AppraisalSection[] = ['KPI', 'COMPETENCY', 'CREDIT_CONTROL']

export const RATING_DEFINITIONS: { score: number; label: string }[] = [
  { score: 5, label: 'Outstanding' },
  { score: 4, label: 'Exceeds Expectations' },
  { score: 3, label: 'Meets Expectations' },
  { score: 2, label: 'Needs Improvement' },
  { score: 1, label: 'Unsatisfactory' },
]

export function ratingLabel(score: number | null | undefined): string {
  return RATING_DEFINITIONS.find(r => r.score === score)?.label ?? ''
}

export const RECOMMENDED_ACTIONS: { key: ActionKey; label: string }[] = [
  { key: 'actionPromotion', label: 'Promotion' },
  { key: 'actionSalaryIncrement', label: 'Salary Increment' },
  { key: 'actionPerformanceIncentive', label: 'Performance Incentive' },
  { key: 'actionTrainingDevelopment', label: 'Training & Development' },
  { key: 'actionRoleEnhancement', label: 'Role Enhancement' },
]

/** Weighted average score (Σ score·weight / Σ weight) over entries that carry a weight. */
export function weightedTotalScore(entries: { score: number; weight?: number | null }[]): number | null {
  const weighted = entries.filter(e => typeof e.weight === 'number' && (e.weight as number) > 0)
  if (weighted.length === 0) return null
  const sumWeight = weighted.reduce((s, e) => s + (e.weight as number), 0)
  const sumScore = weighted.reduce((s, e) => s + e.score * (e.weight as number), 0)
  return sumWeight > 0 ? sumScore / sumWeight : null
}

export function formatTotalScore(score: number | null): string {
  return score === null ? '—' : `${score.toFixed(1)} / 5`
}
