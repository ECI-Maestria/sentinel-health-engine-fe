import { useQuery } from '@tanstack/react-query'
import { alertsRepository } from '@/infrastructure/http/AlertsApiRepository'

export function useAlertStats(patientId: string | null) {
  return useQuery({
    queryKey: ['alert-stats', patientId],
    queryFn: () => alertsRepository.getStats(patientId!),
    enabled: patientId !== null,
    refetchInterval: 30_000,
  })
}
