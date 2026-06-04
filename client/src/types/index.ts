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

export interface ApiEmployee {
  id: number
  employeeId: string | null
  name: string
  email: string
  phone: string | null
  status: string
  createdAt: string
  role?: Role | string
}

export function getRoleName(role: Role | string | undefined | null): string {
  if (!role) return ''
  if (typeof role === 'string') return role
  return role.roleName ?? ''
}
