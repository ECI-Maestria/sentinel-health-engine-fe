import type { DoctorDashboardResponse } from '@/core/domain/doctor/DoctorDashboard'
import type { User } from '@/core/domain/auth/User'

export interface CreateDoctorPayload {
  firstName: string
  lastName: string
  email: string
}

export interface DoctorListResponse {
  doctors: User[]
}

export interface DoctorRepository {
  getDashboard(): Promise<DoctorDashboardResponse>
  listDoctors(): Promise<DoctorListResponse>
  createDoctor(payload: CreateDoctorPayload): Promise<User>
}
