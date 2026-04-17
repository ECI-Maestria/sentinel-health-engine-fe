import { useMutation } from '@tanstack/react-query'
import { authRepository } from '@/infrastructure/http/AuthApiRepository'
import type { ChangePasswordPayload } from '@/core/domain/auth/AuthToken'

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authRepository.changePassword(payload),
  })
}
