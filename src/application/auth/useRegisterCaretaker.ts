import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { authRepository } from '@/infrastructure/http/AuthApiRepository'
import type { RegisterCaretakerPayload } from '@/core/domain/auth/AuthToken'
import type { User } from '@/core/domain/auth/User'

export function useRegisterCaretaker(): UseMutationResult<User, Error, RegisterCaretakerPayload> {
  return useMutation<User, Error, RegisterCaretakerPayload>({
    mutationFn: (payload: RegisterCaretakerPayload): Promise<User> =>
      authRepository.registerCaretaker(payload),
  })
}
