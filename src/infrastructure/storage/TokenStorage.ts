const REFRESH_TOKEN_KEY = 'she_refresh_token'

export const TokenStorage = {
  get(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  set(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },
  clear(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
