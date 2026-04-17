import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useAlerts } from './useAlerts'

const mockGetHistory = vi.fn()

vi.mock('@/infrastructure/http/AlertsApiRepository', () => ({
  alertsRepository: { getHistory: mockGetHistory },
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client }, children)
}

describe('useAlerts', () => {
  beforeEach(() => {
    mockGetHistory.mockReset()
  })

  it('does not fetch when patientId is null', () => {
    renderHook(() => useAlerts(null), { wrapper })
    expect(mockGetHistory).not.toHaveBeenCalled()
  })

  it('fetches alerts when patientId is provided', async () => {
    mockGetHistory.mockResolvedValue({ alerts: [] })
    const { result } = renderHook(() => useAlerts('patient-001'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetHistory).toHaveBeenCalledWith('patient-001', undefined)
  })

  it('passes severity filter to repository', async () => {
    mockGetHistory.mockResolvedValue({ alerts: [] })
    const { result } = renderHook(() => useAlerts('patient-001', 'CRITICAL'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetHistory).toHaveBeenCalledWith('patient-001', 'CRITICAL')
  })

  it('returns the alerts array from response', async () => {
    const alerts = [
      { id: 'a1', severity: 'WARNING', message: 'SpO2 baja', patientId: 'patient-001',
        readingId: 'r1', status: 'SENT', violations: [], createdAt: '2026-01-01T00:00:00Z' },
    ]
    mockGetHistory.mockResolvedValue({ alerts })
    const { result } = renderHook(() => useAlerts('patient-001'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(alerts)
  })

  it('returns undefined data while loading', () => {
    mockGetHistory.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useAlerts('patient-001'), { wrapper })
    expect(result.current.data).toBeUndefined()
  })

  it('is in error state when repository throws', async () => {
    mockGetHistory.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useAlerts('patient-001'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
