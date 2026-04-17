import { calendarClient } from '@/infrastructure/http/client'
import type { MedicationRepository } from '@/core/ports/MedicationRepository'
import type {
  Medication,
  MedicationListResponse,
  CreateMedicationPayload,
} from '@/core/domain/medication/Medication'

class MedicationApiRepository implements MedicationRepository {
  async list(patientId: string): Promise<MedicationListResponse> {
    const { data } = await calendarClient.get<MedicationListResponse>(
      `/v1/patients/${patientId}/medications`,
    )
    return data
  }

  async create(patientId: string, payload: CreateMedicationPayload): Promise<Medication> {
    const { data } = await calendarClient.post<Medication>(
      `/v1/patients/${patientId}/medications`,
      payload,
    )
    return data
  }

  async deactivate(patientId: string, medId: string): Promise<void> {
    await calendarClient.delete(`/v1/patients/${patientId}/medications/${medId}`)
  }
}

export const medicationRepository = new MedicationApiRepository()
