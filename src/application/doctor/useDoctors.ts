import { useQuery } from '@tanstack/react-query'
import { doctorRepository } from '@/infrastructure/http/DoctorApiRepository'

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorRepository.listDoctors(),
    select: (data) => data.doctors,
  })
}
