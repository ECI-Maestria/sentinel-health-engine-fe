import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { authRepository } from '@/infrastructure/http/AuthApiRepository'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/core/domain/auth/User'

export function useCurrentUser(): UseQueryResult<User, Error> {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = accessToken !== null && user !== null

  return useQuery<User, Error>({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User> => {
      const fetchedUser = await authRepository.getMe()
      setUser(fetchedUser)
      return fetchedUser
    },
    enabled: isAuthenticated,
  })
}
