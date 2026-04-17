import { apiClient } from '@/infrastructure/http/client'
import type { AuthRepository } from '@/core/ports/AuthRepository'
import type {
  LoginCredentials,
  TokenPair,
  RegisterCaretakerPayload,
  ForgotPasswordPayload,
  VerifyResetCodePayload,
  VerifyResetCodeResult,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from '@/core/domain/auth/AuthToken'
import type { User } from '@/core/domain/auth/User'

class AuthApiRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>('/v1/auth/login', credentials)
    return data
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>('/v1/auth/refresh', { refreshToken })
    return data
  }

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/v1/users/me')
    return data
  }

  async registerCaretaker(payload: RegisterCaretakerPayload): Promise<User> {
    const { data } = await apiClient.post<User>('/v1/caretakers/register', payload)
    return data
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post('/v1/auth/forgot-password', payload)
  }

  async verifyResetCode(payload: VerifyResetCodePayload): Promise<VerifyResetCodeResult> {
    const { data } = await apiClient.post<VerifyResetCodeResult>(
      '/v1/auth/verify-reset-code',
      payload,
    )
    return data
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post('/v1/auth/reset-password', payload)
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post('/v1/auth/change-password', payload)
  }
}

export const authRepository = new AuthApiRepository()
