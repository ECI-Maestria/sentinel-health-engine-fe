import { analyticsClient } from '@/infrastructure/http/client'
import type { VitalsRepository } from '@/core/ports/VitalsRepository'
import type { VitalReading, VitalSummary, VitalsHistoryResponse } from '@/core/domain/vital/Vital'

class VitalsApiRepository implements VitalsRepository {
  async getHistory(patientId: string): Promise<VitalsHistoryResponse> {
    const { data } = await analyticsClient.get<VitalsHistoryResponse>(
      `/v1/patients/${patientId}/vitals/history`,
    )
    return data
  }

  async getLatest(patientId: string): Promise<VitalReading | null> {
    try {
      const { data } = await analyticsClient.get<VitalReading>(
        `/v1/patients/${patientId}/vitals/latest`,
      )
      return data
    } catch (error: unknown) {
      // 404 means no readings yet — not an error
      if (
        error !== null &&
        typeof error === 'object' &&
        'status' in error &&
        (error as { status: number }).status === 404
      ) {
        return null
      }
      throw error
    }
  }

  async getSummary(patientId: string): Promise<VitalSummary> {
    const { data } = await analyticsClient.get<VitalSummary>(
      `/v1/patients/${patientId}/vitals/summary`,
    )
    return data
  }
}

export const vitalsRepository = new VitalsApiRepository()
