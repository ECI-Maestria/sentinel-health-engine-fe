import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './auth.store'
import { Role } from '@/core/domain/auth/User'
import type { User } from '@/core/domain/auth/User'

vi.mock('@/infrastructure/http/client', () => ({
  registerAuthStoreAccessor: vi.fn(),
}))

vi.mock('@/infrastructure/storage/TokenStorage', () => ({
  TokenStorage: {
    set: vi.fn(),
    get: vi.fn(() => null),
    clear: vi.fn(),
  },
}))

const mockUser: User = {
  id: 'user-001',
  firstName: 'Ana',
  lastName: 'García',
  fullName: 'Ana García',
  email: 'ana@hospital.com',
  role: Role.DOCTOR,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isInitialized: false,
    })
  })

  it('starts with null accessToken and user', () => {
    const { accessToken, user } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(user).toBeNull()
  })

  it('starts with isInitialized false', () => {
    expect(useAuthStore.getState().isInitialized).toBe(false)
  })

  it('setTokenPair updates accessToken', () => {
    useAuthStore.getState().setTokenPair('access-123', 'refresh-456')
    expect(useAuthStore.getState().accessToken).toBe('access-123')
  })

  it('setTokenPair persists refresh token to TokenStorage', async () => {
    const { TokenStorage } = await import('@/infrastructure/storage/TokenStorage')
    useAuthStore.getState().setTokenPair('access-123', 'refresh-456')
    expect(TokenStorage.set).toHaveBeenCalledWith('refresh-456')
  })

  it('setUser updates the user state', () => {
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('clearAuth resets accessToken and user to null', () => {
    useAuthStore.setState({ accessToken: 'access-123', user: mockUser })
    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('clearAuth calls TokenStorage.clear', async () => {
    const { TokenStorage } = await import('@/infrastructure/storage/TokenStorage')
    useAuthStore.getState().clearAuth()
    expect(TokenStorage.clear).toHaveBeenCalled()
  })

  it('setInitialized sets isInitialized to true', () => {
    useAuthStore.getState().setInitialized()
    expect(useAuthStore.getState().isInitialized).toBe(true)
  })
})
