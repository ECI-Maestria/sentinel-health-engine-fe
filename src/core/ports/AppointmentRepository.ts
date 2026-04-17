import type {
  Appointment,
  AppointmentListResponse,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '@/core/domain/appointment/Appointment'

export interface AppointmentRepository {
  list(patientId: string): Promise<AppointmentListResponse>
  getById(patientId: string, apptId: string): Promise<Appointment>
  create(patientId: string, payload: CreateAppointmentPayload): Promise<Appointment>
  update(patientId: string, apptId: string, payload: UpdateAppointmentPayload): Promise<Appointment>
  remove(patientId: string, apptId: string): Promise<void>
}
