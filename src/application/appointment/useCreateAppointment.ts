import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentRepository } from '@/infrastructure/http/AppointmentApiRepository'
import type { CreateAppointmentPayload } from '@/core/domain/appointment/Appointment'

export function useCreateAppointment(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      appointmentRepository.create(patientId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments', patientId] })
    },
  })
}
