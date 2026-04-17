import { useMutation } from '@tanstack/react-query'
import { analyticsClient } from '@/infrastructure/http/client'

interface GenerateReportPayload {
  patientId: string
  from: string
  to: string
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: async ({ patientId, from, to }: GenerateReportPayload) => {
      const { data } = await analyticsClient.post<{ url?: string; message?: string }>(
        `/v1/patients/${patientId}/reports/generate`,
        { from, to },
        { responseType: 'blob' },
      )
      return data
    },
  })
}
