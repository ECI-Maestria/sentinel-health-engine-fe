import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentRepository } from '@/infrastructure/http/AppointmentApiRepository'

export function useDeleteAppointment(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (apptId: string) => appointmentRepository.remove(patientId, apptId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments', patientId] })
    },
  })
}
