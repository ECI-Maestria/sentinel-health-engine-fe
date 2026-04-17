import { useQuery } from '@tanstack/react-query'
import { patientRepository } from '@/infrastructure/http/PatientApiRepository'

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => patientRepository.listPatients(),
    select: (data) => data.patients,
  })
}
