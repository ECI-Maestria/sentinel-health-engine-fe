import type {
  Patient,
  CreatePatientPayload,
  PatientListResponse,
  PatientCompleteProfile,
} from '@/core/domain/patient/Patient'

export interface PatientRepository {
  createPatient(payload: CreatePatientPayload): Promise<Patient>
  listPatients(): Promise<PatientListResponse>
  getCompleteProfile(patientId: string): Promise<PatientCompleteProfile>
}
