export interface VitalReading {
  id: string
  deviceId: string
  patientId: string
  heartRate: number
  spO2: number
  measuredAt: string
  receivedAt: string
}

export interface VitalRangeStats {
  min: number
  max: number
  avg: number
}

export interface VitalSummary {
  heartRate: VitalRangeStats
  spO2: VitalRangeStats
  count: number
}

export interface VitalsHistoryResponse {
  readings: VitalReading[]
}
