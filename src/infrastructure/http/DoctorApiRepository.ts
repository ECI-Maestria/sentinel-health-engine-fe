import { apiClient } from '@/infrastructure/http/client'
import type { DoctorRepository, CreateDoctorPayload, DoctorListResponse } from '@/core/ports/DoctorRepository'
import type { DoctorDashboardResponse } from '@/core/domain/doctor/DoctorDashboard'
import type { User } from '@/core/domain/auth/User'

class DoctorApiRepository implements DoctorRepository {
  async getDashboard(): Promise<DoctorDashboardResponse> {
    const { data } = await apiClient.get<DoctorDashboardResponse>('/v1/doctor/dashboard')
    return data
  }

  async listDoctors(): Promise<DoctorListResponse> {
    const { data } = await apiClient.get<DoctorListResponse>('/v1/doctors')
    return data
  }

  async createDoctor(payload: CreateDoctorPayload): Promise<User> {
    const { data } = await apiClient.post<User>('/v1/doctors', payload)
    return data
  }
}

export const doctorRepository = new DoctorApiRepository()
