import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import { LoginPage } from '@/presentation/pages/LoginPage/LoginPage'
import { RegisterCaretakerPage } from '@/presentation/pages/RegisterCaretakerPage/RegisterCaretakerPage'
import { ForgotPasswordPage } from '@/presentation/pages/ForgotPasswordPage/ForgotPasswordPage'
import { DashboardPage } from '@/presentation/pages/DashboardPage/DashboardPage'
import { ChangePasswordPage } from '@/presentation/pages/ChangePasswordPage/ChangePasswordPage'
import { PatientsPage } from '@/presentation/pages/PatientsPage/PatientsPage'
import { MyCaretakersPage } from '@/presentation/pages/MyCaretakersPage/MyCaretakersPage'
import { MyPatientsPage } from '@/presentation/pages/MyPatientsPage/MyPatientsPage'
import { AlertsPage } from '@/presentation/pages/AlertsPage/AlertsPage'
import { VitalsPage } from '@/presentation/pages/VitalsPage/VitalsPage'
import { AppointmentsPage } from '@/presentation/pages/AppointmentsPage/AppointmentsPage'
import { DoctorsPage } from '@/presentation/pages/DoctorsPage/DoctorsPage'
import { MedicationsPage } from '@/presentation/pages/MedicationsPage/MedicationsPage'
import { ProfilePage } from '@/presentation/pages/ProfilePage/ProfilePage'

function RootRedirect() {
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = accessToken !== null && user !== null

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    )
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  )
}

function ProtectedRoute() {
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = accessToken !== null && user !== null

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterCaretakerPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: '/patients',
        element: <PatientsPage />,
      },
      {
        path: '/my-caretakers',
        element: <MyCaretakersPage />,
      },
      {
        path: '/my-patients',
        element: <MyPatientsPage />,
      },
      {
        path: '/alerts',
        element: <AlertsPage />,
      },
      {
        path: '/vitals',
        element: <VitalsPage />,
      },
      {
        path: '/appointments',
        element: <AppointmentsPage />,
      },
      {
        path: '/doctors',
        element: <DoctorsPage />,
      },
      {
        path: '/medications',
        element: <MedicationsPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
    ],
  },
])
