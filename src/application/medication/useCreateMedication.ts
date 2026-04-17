import { useMutation, useQueryClient } from '@tanstack/react-query'
import { medicationRepository } from '@/infrastructure/http/MedicationApiRepository'
import type { CreateMedicationPayload } from '@/core/domain/medication/Medication'

export function useCreateMedication(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMedicationPayload) =>
      medicationRepository.create(patientId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['medications', patientId] })
    },
  })
}
