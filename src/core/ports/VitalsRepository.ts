import type { VitalReading, VitalSummary, VitalsHistoryResponse } from '@/core/domain/vital/Vital'

export interface VitalsRepository {
  getHistory(patientId: string): Promise<VitalsHistoryResponse>
  getLatest(patientId: string): Promise<VitalReading | null>
  getSummary(patientId: string): Promise<VitalSummary>
}
