export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  title: string
  scheduledAt: string
  location: string
  notes: string
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentPayload {
  title: string
  scheduledAt: string   // RFC3339
  location?: string
  notes?: string
}

export interface UpdateAppointmentPayload {
  title?: string
  scheduledAt?: string
  location?: string
  notes?: string
  status?: AppointmentStatus
}

export interface AppointmentListResponse {
  appointments: Appointment[]
}
