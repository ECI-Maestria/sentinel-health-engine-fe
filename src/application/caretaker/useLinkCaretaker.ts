import { useMutation, useQueryClient } from '@tanstack/react-query'
import { caretakerRepository } from '@/infrastructure/http/CaretakerApiRepository'
import type { LinkCaretakerPayload } from '@/core/domain/caretaker/Caretaker'

export function useLinkCaretaker(patientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LinkCaretakerPayload) =>
      caretakerRepository.linkCaretaker(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['caretakers', patientId] })
    },
  })
}
