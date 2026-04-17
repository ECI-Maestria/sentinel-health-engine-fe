import { useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsRepository } from '@/infrastructure/http/AlertsApiRepository'

export function useAcknowledgeAlert(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (alertId: string) =>
      alertsRepository.acknowledgeAlert(patientId, alertId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alerts', patientId] })
    },
  })
}
