import { useQuery } from '@tanstack/react-query'
import { alertsRepository } from '@/infrastructure/http/AlertsApiRepository'

export function useAlerts(patientId: string | null, severity?: string) {
  return useQuery({
    queryKey: ['alerts', patientId, severity],
    queryFn: () => alertsRepository.getHistory(patientId!, severity),
    select: (data) => data.alerts,
    enabled: patientId !== null,
    refetchInterval: 30_000,
  })
}
