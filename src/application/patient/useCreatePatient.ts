import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patientRepository } from '@/infrastructure/http/PatientApiRepository'
import type { CreatePatientPayload } from '@/core/domain/patient/Patient'

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePatientPayload) =>
      patientRepository.createPatient(payload),
    onSuccess: () => {
      // Invalidate the patient list so the table re-fetches automatically
      void queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
