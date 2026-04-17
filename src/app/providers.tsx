import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuthStore } from '@/store/auth.store'
import { TokenStorage } from '@/infrastructure/storage/TokenStorage'
import { authRepository } from '@/infrastructure/http/AuthApiRepository'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

export interface ProvidersProps {
  children: React.ReactNode
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setTokenPair, setUser, clearAuth, setInitialized } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function initAuth() {
      const storedRefreshToken = TokenStorage.get()
      if (!storedRefreshToken) {
        setInitialized()
        return
      }

      try {
        const tokenPair = await authRepository.refresh(storedRefreshToken)
        setTokenPair(tokenPair.accessToken, tokenPair.refreshToken)

        const user = await authRepository.getMe()
        setUser(user)
      } catch {
        clearAuth()
        TokenStorage.clear()
      } finally {
        setInitialized()
      }
    }

    void initAuth()
  }, [setTokenPair, setUser, clearAuth, setInitialized])

  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
