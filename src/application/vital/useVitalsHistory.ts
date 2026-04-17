import { useQuery } from '@tanstack/react-query'
import { vitalsRepository } from '@/infrastructure/http/VitalsApiRepository'

export function useVitalsHistory(patientId: string | null) {
  return useQuery({
    queryKey: ['vitals-history', patientId],
    queryFn: () => vitalsRepository.getHistory(patientId!),
    select: (data) => data.readings,
    enabled: patientId !== null,
    refetchInterval: 30_000,
  })
}
