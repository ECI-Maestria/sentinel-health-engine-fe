import { useQuery } from '@tanstack/react-query'
import { vitalsRepository } from '@/infrastructure/http/VitalsApiRepository'

export function useLatestVitals(patientId: string | null) {
  return useQuery({
    queryKey: ['vitals-latest', patientId],
    queryFn: () => vitalsRepository.getLatest(patientId!),
    enabled: patientId !== null,
    refetchInterval: 30_000, // refresh every 30 s
  })
}
