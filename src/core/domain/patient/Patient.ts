import type { User } from '@/core/domain/auth/User'

/** A Patient is a User with role PATIENT. We reuse the same shape. */
export type Patient = User

export interface CreatePatientPayload {
  firstName: string
  lastName: string
  email: string
}

export interface PatientListResponse {
  patients: Patient[]
}

export interface DeviceInfo {
  id: string
  deviceIdentifier: string
  platform: string
  name: string
  isActive: boolean
  lastSeenAt?: string
  createdAt: string
}

export interface CaretakerRelation {
  patientId: string
  caretakerId: string
  fullName: string
  email: string
  linkedAt: string
}

export interface PatientCompleteProfile {
  patient: Patient
  devices: DeviceInfo[]
  caretakers: CaretakerRelation[]
}
