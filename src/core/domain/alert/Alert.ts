export interface RuleViolation {
  ruleName: string
  metricName: string
  actualValue: number
}

export interface AlertRecord {
  id: string
  patientId: string
  readingId: string
  message: string
  severity: 'WARNING' | 'CRITICAL'
  status: string
  violations: RuleViolation[]
  createdAt: string
}

export interface AlertStats {
  total: number
  warning: number
  critical: number
  lastAlertAt?: string
}

export interface AlertHistoryResponse {
  alerts: AlertRecord[]
}
