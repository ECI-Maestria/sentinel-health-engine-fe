import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/lib/env'
import { TokenStorage } from '@/infrastructure/storage/TokenStorage'
import { ApiError } from '@/core/domain/shared/ApiError'

// ---------------------------------------------------------------------------
// Deferred store accessor — breaks the circular import cycle.
// The store module is resolved lazily at call-time, not at import-time.
// ---------------------------------------------------------------------------
type AuthStoreGetState = {
  accessToken: string | null
  setTokenPair: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

let _getAuthState: (() => AuthStoreGetState) | null = null

export function registerAuthStoreAccessor(fn: () => AuthStoreGetState): void {
  _getAuthState = fn
}

function getAuthState(): AuthStoreGetState {
  if (!_getAuthState) {
    throw new Error('Auth store accessor not registered')
  }
  return _getAuthState()
}

// ---------------------------------------------------------------------------
// Refresh-token queue helpers
// ---------------------------------------------------------------------------
interface QueueItem {
  resolve: (token: string) => void
  reject: (reason: unknown) => void
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

interface ErrorResponseData {
  error?: string
  message?: string
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((item) => {
    if (error !== null) {
      item.reject(error)
    } else if (token !== null) {
      item.resolve(token)
    }
  })
  failedQueue = []
}

function toApiError(error: AxiosError<ErrorResponseData>): ApiError {
  const status = error.response?.status ?? 0
  const data = error.response?.data
  const message = data?.error ?? data?.message ?? error.message ?? 'Error desconocido'
  return new ApiError(message, status)
}

function clearAuthAndRedirect(): void {
  getAuthState().clearAuth()
  window.location.href = '/login'
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach access token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAuthState().accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// Response interceptor — auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponseData>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(toApiError(error))
    }

    const refreshToken = TokenStorage.get()

    if (!refreshToken) {
      clearAuthAndRedirect()
      return Promise.reject(toApiError(error))
    }

    // Another request is already refreshing — queue this one
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((newAccessToken) => {
        if (!originalRequest.headers) {
          originalRequest.headers = {}
        }
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<RefreshResponse>(
        `${env.apiUrl}/v1/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )

      getAuthState().setTokenPair(data.accessToken, data.refreshToken)
      processQueue(null, data.accessToken)

      if (!originalRequest.headers) {
        originalRequest.headers = {}
      }
      originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`

      return apiClient(originalRequest)
    } catch (refreshError: unknown) {
      processQueue(refreshError, null)
      clearAuthAndRedirect()
      return Promise.reject(
        refreshError instanceof Error ? refreshError : toApiError(error),
      )
    } finally {
      isRefreshing = false
    }
  },
)

// ---------------------------------------------------------------------------
// Secondary clients (analytics-service, calendar-service)
// Attach Bearer token but no retry logic — simpler auth-only clients.
// ---------------------------------------------------------------------------
function createSimpleAuthClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = getAuthState().accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorResponseData>) => Promise.reject(toApiError(error)),
  )

  return client
}

export const analyticsClient = createSimpleAuthClient(env.analyticsUrl)
export const calendarClient  = createSimpleAuthClient(env.calendarUrl)
