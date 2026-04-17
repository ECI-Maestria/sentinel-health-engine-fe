import { useQuery } from '@tanstack/react-query'
import { doctorRepository } from '@/infrastructure/http/DoctorApiRepository'

export function useDoctorDashboard() {
  return useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: () => doctorRepository.getDashboard(),
    select: (data) => data.patients,
    refetchInterval: 30_000,
  })
}
