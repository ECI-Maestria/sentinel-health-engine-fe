import type {
  Medication,
  MedicationListResponse,
  CreateMedicationPayload,
} from '@/core/domain/medication/Medication'

export interface MedicationRepository {
  list(patientId: string): Promise<MedicationListResponse>
  create(patientId: string, payload: CreateMedicationPayload): Promise<Medication>
  deactivate(patientId: string, medId: string): Promise<void>
}
