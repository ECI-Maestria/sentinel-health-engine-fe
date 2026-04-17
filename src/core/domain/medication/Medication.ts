export type MedicationFrequency =
  | 'DAILY'
  | 'TWICE_DAILY'
  | 'THREE_TIMES_DAILY'
  | 'EVERY_8_HOURS'
  | 'EVERY_12_HOURS'
  | 'WEEKLY'
  | 'AS_NEEDED'

export interface Medication {
  id: string
  patientId: string
  prescribedBy: string
  name: string
  dosage: string
  frequency: MedicationFrequency
  scheduledTimes: string[]
  startDate: string
  endDate?: string | null
  notes: string
  isActive: boolean
  createdAt: string
}

export interface CreateMedicationPayload {
  name: string
  dosage: string
  frequency: MedicationFrequency
  scheduledTimes?: string[]
  startDate: string
  endDate?: string
  notes?: string
}

export interface MedicationListResponse {
  medications: Medication[]
}
