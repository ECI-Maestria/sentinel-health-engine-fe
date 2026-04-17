import type { AlertHistoryResponse, AlertStats } from '@/core/domain/alert/Alert'

export interface AlertsRepository {
  getHistory(patientId: string, severity?: string): Promise<AlertHistoryResponse>
  getStats(patientId: string): Promise<AlertStats>
  acknowledgeAlert(patientId: string, alertId: string): Promise<void>
}
