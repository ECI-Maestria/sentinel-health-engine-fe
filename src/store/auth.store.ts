import { create } from 'zustand'
import type { User } from '@/core/domain/auth/User'
import { TokenStorage } from '@/infrastructure/storage/TokenStorage'
import { registerAuthStoreAccessor } from '@/infrastructure/http/client'

interface AuthState {
  accessToken: string | null
  user: User | null
  isInitialized: boolean
  setTokenPair: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setInitialized: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,
  isInitialized: false,

  get isAuthenticated() {
    const state = get()
    return state.accessToken !== null && state.user !== null
  },

  setTokenPair(accessToken: string, refreshToken: string): void {
    TokenStorage.set(refreshToken)
    set({ accessToken })
  },

  setUser(user: User): void {
    set({ user })
  },

  clearAuth(): void {
    TokenStorage.clear()
    set({ accessToken: null, user: null })
  },

  setInitialized(): void {
    set({ isInitialized: true })
  },
}))

// Register the store accessor with the HTTP client to break the circular
// import cycle: client.ts cannot import auth.store.ts directly because
// auth.store.ts imports client.ts (via AuthApiRepository).
registerAuthStoreAccessor(() => ({
  accessToken: useAuthStore.getState().accessToken,
  setTokenPair: useAuthStore.getState().setTokenPair,
  clearAuth: useAuthStore.getState().clearAuth,
}))
