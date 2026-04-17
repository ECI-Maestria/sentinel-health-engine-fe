import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useAlerts } from './useAlerts'
import { alertsRepository } from '@/infrastructure/http/AlertsApiRepository'

vi.mock('@/infrastructure/http/AlertsApiRepository', () => ({
  alertsRepository: { getHistory: vi.fn() },
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client }, children)
}

describe('useAlerts', () => {
  beforeEach(() => {
    vi.mocked(alertsRepository.getHistory).mockReset()
  })

  it('does not fetch when patientId is null', () => {
    renderHook(() => useAlerts(null), { wrapper })
    expect(alertsRepository.getHistory).not.toHaveBeenCalled()
  })

  it('fetches alerts when patientId is provided', async () => {
    vi.mocked(alertsRepository.getHistory).mockResolvedValue({ alerts: [] })
    const { result } = renderHook(() => useAlerts('patient-001'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(alertsRepository.getHistory).toHaveBeenCalledWith('patient-001', undefined)
  })

  it('passes severity filter to repository', async () => {
    vi.mocked(alertsRepository.getHistory).mockResolvedValue({ alerts: [] })
    const { result } = renderHook(() => useAlerts('patient-001', 'CRITICAL'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(alertsRepository.getHistory).toHaveBeenCalledWith('patient-001', 'CRITICAL')
  })

  it('returns the alerts array from response', async () => {
    const alerts = [
      { id: 'a1', severity: 'WARNING', message: 'SpO2 baja', patientId: 'patient-001',
        readingId: 'r1', status: 'SENT', violations: [], createdAt: '2026-01-01T00:00:00Z' },
    ]
    vi.mocked(alertsRepository.getHistory).mockResolvedValue({ alerts })
    const { result } = renderHook(() => useAlerts('patient-001'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(alerts)
  })

  it('returns undefined data while loading', () => {
    vi.mocked(alertsRepository.getHistory).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useAlerts('patient-001'), { wrapper })
    expect(result.current.data).toBeUndefined()
  })

  it('is in error state when repository throws', async () => {
    vi.mocked(alertsRepository.getHistory).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useAlerts('patient-001'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
