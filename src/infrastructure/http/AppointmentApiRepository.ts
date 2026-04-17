import { calendarClient } from '@/infrastructure/http/client'
import type { AppointmentRepository } from '@/core/ports/AppointmentRepository'
import type {
  Appointment,
  AppointmentListResponse,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '@/core/domain/appointment/Appointment'

class AppointmentApiRepository implements AppointmentRepository {
  async list(patientId: string): Promise<AppointmentListResponse> {
    const { data } = await calendarClient.get<AppointmentListResponse>(
      `/v1/patients/${patientId}/appointments`,
    )
    return data
  }

  async getById(patientId: string, apptId: string): Promise<Appointment> {
    const { data } = await calendarClient.get<Appointment>(
      `/v1/patients/${patientId}/appointments/${apptId}`,
    )
    return data
  }

  async create(patientId: string, payload: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await calendarClient.post<Appointment>(
      `/v1/patients/${patientId}/appointments`,
      payload,
    )
    return data
  }

  async update(
    patientId: string,
    apptId: string,
    payload: UpdateAppointmentPayload,
  ): Promise<Appointment> {
    const { data } = await calendarClient.put<Appointment>(
      `/v1/patients/${patientId}/appointments/${apptId}`,
      payload,
    )
    return data
  }

  async remove(patientId: string, apptId: string): Promise<void> {
    await calendarClient.delete(`/v1/patients/${patientId}/appointments/${apptId}`)
  }
}

export const appointmentRepository = new AppointmentApiRepository()
