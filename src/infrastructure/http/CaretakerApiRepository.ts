import { apiClient } from '@/infrastructure/http/client'
import type { CaretakerRepository } from '@/core/ports/CaretakerRepository'
import type {
  CaretakerListResponse,
  LinkCaretakerPayload,
  UnlinkCaretakerPayload,
  MyPatientsResponse,
} from '@/core/domain/caretaker/Caretaker'

class CaretakerApiRepository implements CaretakerRepository {
  async listCaretakers(patientId: string): Promise<CaretakerListResponse> {
    const { data } = await apiClient.get<CaretakerListResponse>(
      `/v1/patients/${patientId}/caretakers`,
    )
    return data
  }

  async linkCaretaker({ patientId, caretakerEmail }: LinkCaretakerPayload): Promise<void> {
    await apiClient.post(`/v1/patients/${patientId}/caretakers`, {
      caretakerEmail,
    })
  }

  async unlinkCaretaker({ patientId, caretakerId }: UnlinkCaretakerPayload): Promise<void> {
    await apiClient.delete(`/v1/patients/${patientId}/caretakers/${caretakerId}`)
  }

  async getMyPatients(): Promise<MyPatientsResponse> {
    const { data } = await apiClient.get<MyPatientsResponse>('/v1/caretakers/me/patients')
    return data
  }
}

export const caretakerRepository = new CaretakerApiRepository()
