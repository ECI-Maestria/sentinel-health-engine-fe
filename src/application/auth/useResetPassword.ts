import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { authRepository } from '@/infrastructure/http/AuthApiRepository'
import type { ResetPasswordPayload } from '@/core/domain/auth/AuthToken'

export function useResetPassword(): UseMutationResult<void, Error, ResetPasswordPayload> {
  return useMutation<void, Error, ResetPasswordPayload>({
    mutationFn: (payload: ResetPasswordPayload): Promise<void> =>
      authRepository.resetPassword(payload),
  })
}
