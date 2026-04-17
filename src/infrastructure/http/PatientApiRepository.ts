import { apiClient } from '@/infrastructure/http/client'
import type { PatientRepository } from '@/core/ports/PatientRepository'
import type {
  Patient,
  CreatePatientPayload,
  PatientListResponse,
  PatientCompleteProfile,
} from '@/core/domain/patient/Patient'

class PatientApiRepository implements PatientRepository {
  async createPatient(payload: CreatePatientPayload): Promise<Patient> {
    const { data } = await apiClient.post<Patient>('/v1/patients', payload)
    return data
  }

  async listPatients(): Promise<PatientListResponse> {
    const { data } = await apiClient.get<PatientListResponse>('/v1/patients')
    return data
  }

  async getCompleteProfile(patientId: string): Promise<PatientCompleteProfile> {
    const { data } = await apiClient.get<PatientCompleteProfile>(
      `/v1/patients/${patientId}/profile/complete`,
    )
    return data
  }
}

export const patientRepository = new PatientApiRepository()
