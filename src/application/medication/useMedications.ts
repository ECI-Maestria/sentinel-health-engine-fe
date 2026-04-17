import { useQuery } from '@tanstack/react-query'
import { medicationRepository } from '@/infrastructure/http/MedicationApiRepository'

export function useMedications(patientId: string | null) {
  return useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => medicationRepository.list(patientId!),
    select: (data) => data.medications,
    enabled: patientId !== null,
  })
}
