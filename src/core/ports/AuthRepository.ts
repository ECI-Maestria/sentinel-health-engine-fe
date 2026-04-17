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

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<TokenPair>
  refresh(refreshToken: string): Promise<TokenPair>
  getMe(): Promise<User>
  registerCaretaker(payload: RegisterCaretakerPayload): Promise<User>
  forgotPassword(payload: ForgotPasswordPayload): Promise<void>
  verifyResetCode(payload: VerifyResetCodePayload): Promise<VerifyResetCodeResult>
  resetPassword(payload: ResetPasswordPayload): Promise<void>
  changePassword(payload: ChangePasswordPayload): Promise<void>
}
