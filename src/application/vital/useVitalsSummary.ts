import { useQuery } from '@tanstack/react-query'
import { vitalsRepository } from '@/infrastructure/http/VitalsApiRepository'

export function useVitalsSummary(patientId: string | null) {
  return useQuery({
    queryKey: ['vitals-summary', patientId],
    queryFn: () => vitalsRepository.getSummary(patientId!),
    enabled: patientId !== null,
    refetchInterval: 30_000,
  })
}
