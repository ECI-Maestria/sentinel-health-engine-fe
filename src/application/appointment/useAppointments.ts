import { useQuery } from '@tanstack/react-query'
import { appointmentRepository } from '@/infrastructure/http/AppointmentApiRepository'

export function useAppointments(patientId: string | null) {
  return useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => appointmentRepository.list(patientId!),
    select: (data) => data.appointments,
    enabled: patientId !== null,
  })
}
