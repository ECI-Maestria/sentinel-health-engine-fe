import { Navigate } from 'react-router-dom'
import { Role } from '@/core/domain/auth/User'
import { useAuthStore } from '@/store/auth.store'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import { DoctorDashboardPage } from '@/presentation/pages/DoctorDashboardPage/DoctorDashboardPage'
import { PatientDashboardPage } from '@/presentation/pages/PatientDashboardPage/PatientDashboardPage'
import { CaretakerDashboardPage } from '@/presentation/pages/CaretakerDashboardPage/CaretakerDashboardPage'

export function DashboardPage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    )
  }

  if (user.role === Role.DOCTOR) return <DoctorDashboardPage />
  if (user.role === Role.PATIENT) return <PatientDashboardPage />
  if (user.role === Role.CARETAKER) return <CaretakerDashboardPage />

  return <Navigate to="/login" replace />
}
