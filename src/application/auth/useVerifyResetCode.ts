import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { authRepository } from '@/infrastructure/http/AuthApiRepository'
import type { VerifyResetCodePayload, VerifyResetCodeResult } from '@/core/domain/auth/AuthToken'

export function useVerifyResetCode(): UseMutationResult<
  VerifyResetCodeResult,
  Error,
  VerifyResetCodePayload
> {
  return useMutation<VerifyResetCodeResult, Error, VerifyResetCodePayload>({
    mutationFn: (payload: VerifyResetCodePayload): Promise<VerifyResetCodeResult> =>
      authRepository.verifyResetCode(payload),
  })
}
