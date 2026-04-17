import { Role } from '@/core/domain/auth/User'

export interface DashboardPatient {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: Role
  isActive: boolean
  deviceCount: number
  caretakerCount: number
  createdAt: string
}

export interface DoctorDashboardResponse {
  patients: DashboardPatient[]
}
