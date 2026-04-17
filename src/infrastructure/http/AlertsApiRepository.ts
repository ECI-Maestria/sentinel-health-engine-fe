import { analyticsClient } from '@/infrastructure/http/client'
import type { AlertsRepository } from '@/core/ports/AlertsRepository'
import type { AlertHistoryResponse, AlertStats } from '@/core/domain/alert/Alert'

class AlertsApiRepository implements AlertsRepository {
  async getHistory(patientId: string, severity?: string): Promise<AlertHistoryResponse> {
    const params: Record<string, string> = {}
    if (severity) params.severity = severity
    const { data } = await analyticsClient.get<AlertHistoryResponse>(
      `/v1/patients/${patientId}/alerts/history`,
      { params },
    )
    return data
  }

  async getStats(patientId: string): Promise<AlertStats> {
    const { data } = await analyticsClient.get<AlertStats>(
      `/v1/patients/${patientId}/alerts/stats`,
    )
    return data
  }

  async acknowledgeAlert(patientId: string, alertId: string): Promise<void> {
    await analyticsClient.patch(
      `/v1/patients/${patientId}/alerts/${alertId}/acknowledge`,
    )
  }
}

export const alertsRepository = new AlertsApiRepository()
