import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { authRepository } from '@/infrastructure/http/AuthApiRepository'
import type { ForgotPasswordPayload } from '@/core/domain/auth/AuthToken'

export function useForgotPassword(): UseMutationResult<void, Error, ForgotPasswordPayload> {
  return useMutation<void, Error, ForgotPasswordPayload>({
    mutationFn: (payload: ForgotPasswordPayload): Promise<void> =>
      authRepository.forgotPassword(payload),
  })
}
