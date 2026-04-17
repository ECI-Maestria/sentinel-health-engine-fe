import { useMutation, useQueryClient } from '@tanstack/react-query'
import { caretakerRepository } from '@/infrastructure/http/CaretakerApiRepository'
import type { UnlinkCaretakerPayload } from '@/core/domain/caretaker/Caretaker'

export function useUnlinkCaretaker(patientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UnlinkCaretakerPayload) =>
      caretakerRepository.unlinkCaretaker(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['caretakers', patientId] })
    },
  })
}
