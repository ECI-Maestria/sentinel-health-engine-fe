import { Navigate, Link } from 'react-router-dom'
import { Role } from '@/core/domain/auth/User'
import { useAuthStore } from '@/store/auth.store'
import { DoctorLayout } from '@/presentation/templates/DoctorLayout/DoctorLayout'
import { PatientLayout } from '@/presentation/templates/PatientLayout/PatientLayout'
import { CaretakerLayout } from '@/presentation/templates/CaretakerLayout/CaretakerLayout'

function roleName(role: Role): string {
  if (role === Role.DOCTOR) return 'Médico'
  if (role === Role.PATIENT) return 'Paciente'
  return 'Cuidador'
}

function roleColor(role: Role): string {
  if (role === Role.DOCTOR) return 'bg-primary-100 text-primary-700'
  if (role === Role.PATIENT) return 'bg-blue-100 text-blue-700'
  return 'bg-violet-100 text-violet-700'
}

function avatarColor(role: Role): string {
  if (role === Role.DOCTOR) return 'bg-primary-100 text-primary-700'
  if (role === Role.PATIENT) return 'bg-blue-100 text-blue-700'
  return 'bg-violet-100 text-violet-700'
}

function ProfileContent() {
  const { user } = useAuthStore()
  if (!user) return null

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Profile header card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold ${avatarColor(user.role)}`}>
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.fullName}</h1>
            <span className={`mt-1 inline-flex rounded-full px-3 py-0.5 text-sm font-medium ${roleColor(user.role)}`}>
              {roleName(user.role)}
            </span>
            <p className="mt-1 text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Personal info card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Información Personal</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500">Nombre</span>
            <span className="text-sm font-medium text-gray-900">{user.firstName}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500">Apellido</span>
            <span className="text-sm font-medium text-gray-900">{user.lastName}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500">Correo electrónico</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500">Rol</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColor(user.role)}`}>
              {roleName(user.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Security card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Seguridad</h2>
        </div>
        <div className="px-5 py-4">
          <Link
            to="/change-password"
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Cambiar contraseña
            </div>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { user } = useAuthStore()
  if (!user) return null

  if (user.role === Role.DOCTOR) {
    return (
      <DoctorLayout title="Mi Perfil" subtitle="Información de tu cuenta">
        <ProfileContent />
      </DoctorLayout>
    )
  }
  if (user.role === Role.PATIENT) {
    return (
      <PatientLayout title="Mi Perfil" subtitle="Información de tu cuenta">
        <ProfileContent />
      </PatientLayout>
    )
  }
  if (user.role === Role.CARETAKER) {
    return (
      <CaretakerLayout title="Mi Perfil" subtitle="Información de tu cuenta">
        <ProfileContent />
      </CaretakerLayout>
    )
  }
  return <Navigate to="/dashboard" replace />
}
