import { useMutation, useQueryClient } from '@tanstack/react-query'
import { medicationRepository } from '@/infrastructure/http/MedicationApiRepository'

export function useDeactivateMedication(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (medId: string) => medicationRepository.deactivate(patientId, medId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['medications', patientId] })
    },
  })
}
