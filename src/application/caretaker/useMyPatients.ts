import { useQuery } from '@tanstack/react-query'
import { caretakerRepository } from '@/infrastructure/http/CaretakerApiRepository'

export function useMyPatients() {
  return useQuery({
    queryKey: ['my-patients'],
    queryFn: () => caretakerRepository.getMyPatients(),
  })
}
