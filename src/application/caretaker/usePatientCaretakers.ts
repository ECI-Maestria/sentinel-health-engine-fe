import { useQuery } from '@tanstack/react-query'
import { caretakerRepository } from '@/infrastructure/http/CaretakerApiRepository'

export function usePatientCaretakers(patientId: string | null) {
  return useQuery({
    queryKey: ['caretakers', patientId],
    queryFn: () => caretakerRepository.listCaretakers(patientId!),
    select: (data) => data.caretakers,
    enabled: patientId !== null,
  })
}
