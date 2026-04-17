import { useMutation } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { authRepository } from '@/infrastructure/http/AuthApiRepository'
import { useAuthStore } from '@/store/auth.store'
import type { LoginCredentials } from '@/core/domain/auth/AuthToken'

export function useLogin(): UseMutationResult<void, Error, LoginCredentials> {
  const setTokenPair = useAuthStore((s) => s.setTokenPair)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation<void, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials): Promise<void> => {
      const tokenPair = await authRepository.login(credentials)
      setTokenPair(tokenPair.accessToken, tokenPair.refreshToken)
      const user = await authRepository.getMe()
      setUser(user)
    },
  })
}
