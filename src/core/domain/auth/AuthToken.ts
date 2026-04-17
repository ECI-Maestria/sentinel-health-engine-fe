export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCaretakerPayload {
  firstName: string
  lastName: string
  email: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyResetCodePayload {
  code: string
}

export interface VerifyResetCodeResult {
  maskedEmail: string
}

export interface ResetPasswordPayload {
  code: string
  newPassword: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}
