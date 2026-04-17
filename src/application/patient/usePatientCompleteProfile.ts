import { useQuery } from '@tanstack/react-query'
import { patientRepository } from '@/infrastructure/http/PatientApiRepository'

export function usePatientCompleteProfile(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: () => patientRepository.getCompleteProfile(patientId!),
    enabled: patientId !== null,
  })
}
