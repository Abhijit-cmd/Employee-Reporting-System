export interface Role {
  id: number
  roleName: string
}

export interface StoredUser {
  id: number
  name: string
  email: string
  phone?: string | null
  employeeId: string | null
  // Backend returns role as a string from JWT payload,
  // and as a Role object from the profile endpoint
  role: Role | string
}

export interface ReportStatus {
  id: number
  statusName: string
}

export interface Report {
  id: number
  mmyyyy: string
  businessOwner: string
  preparedBy: string
  reviewedBy: string
  customersRegistered: number
  suppliersRegistered: number
  newBrandProducts: number
  successStories: number
  websiteVisitors: number
  challenges?: string | null
  salesBooking?: string | null
  targetVsAchievement?: string | null
  accomplishments?: string | null
  createdAt: string
  reportStatus: ReportStatus
  user?: {
    id: number
    name: string
    employeeId: string | null
    role?: Role | string
  }
}

export interface Department {
  id: number
  name: string
}

export type AppraisalSection = 'KPI' | 'COMPETENCY' | 'CREDIT_CONTROL'

export interface KpiTemplate {
  id: number
  departmentId: number
  name: string
  description?: string | null
  displayOrder: number
  section: AppraisalSection
  weight: number | null
}

export interface ApiEmployee {
  id: number
  employeeId: string | null
  name: string
  email: string
  phone: string | null
  status: string
  createdAt: string
  role?: Role | string
  departmentId?: number | null
  managerId?: number | null
  designation?: string | null
  location?: string | null
  department?: { id: number; name: string } | null
  manager?: { id: number; name: string; employeeId: string | null } | null
}

export interface Target {
  id: number
  userId: number
  targetTitle: string
  description?: string | null
  targetValue: number
  achievedValue: number
  targetMonth: string | null
  targetYear: number
  createdAt: string
  updatedAt: string
  employee?: {
    id: number
    name: string
    employeeId: string | null
  }
}

export interface AppraisalKpiEntry {
  id: number
  kpiTemplateId: number | null
  kpiName: string
  section: AppraisalSection
  weight: number | null
  target?: string | null
  achievement?: string | null
  score: number
  comment?: string | null
}

export interface Appraisal {
  id: number
  raisedById: number
  userId: number
  departmentName: string
  periodMonth?: number | null
  periodYear: number
  periodQuarter?: number | null
  status: 'Pending' | 'Acknowledged'
  overallComment?: string | null
  creditControlComment?: string | null
  selfAchievements?: string | null
  selfChallenges?: string | null
  selfImprovements?: string | null
  selfSupportNeeded?: string | null
  managerStrengths?: string | null
  managerDevelopmentAreas?: string | null
  actionPromotion: boolean
  actionSalaryIncrement: boolean
  actionPerformanceIncentive: boolean
  actionTrainingDevelopment: boolean
  actionRoleEnhancement: boolean
  finalRating?: number | null
  ceoName?: string | null
  ceoSignDate?: string | null
  hrName?: string | null
  hrSignDate?: string | null
  acknowledgedAt?: string | null
  createdAt: string
  updatedAt: string
  kpiEntries: AppraisalKpiEntry[]
  raisedBy?: { id: number; name: string; employeeId: string | null }
  user?: {
    id: number
    name: string
    employeeId: string | null
    designation?: string | null
    location?: string | null
    department?: { name: string } | null
  }
}

/** Helper to extract the role name regardless of shape */
export function getRoleName(role: Role | string | undefined | null): string {
  if (!role) return ''
  if (typeof role === 'string') return role
  return role.roleName ?? ''
}
