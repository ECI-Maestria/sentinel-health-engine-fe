import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doctorRepository } from '@/infrastructure/http/DoctorApiRepository'
import type { CreateDoctorPayload } from '@/core/ports/DoctorRepository'

export function useCreateDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDoctorPayload) => doctorRepository.createDoctor(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}
