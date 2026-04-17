import { KeyRound } from 'lucide-react'
import { DashboardLayout } from '@/presentation/templates/DashboardLayout/DashboardLayout'
import { ChangePasswordForm } from '@/presentation/organisms/ChangePasswordForm/ChangePasswordForm'

export function ChangePasswordPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-md">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
            <KeyRound className="h-5 w-5 text-primary-500" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cambiar contraseña</h1>
            <p className="text-sm text-gray-500">
              Elige una contraseña segura para tu cuenta
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardLayout>
  )
}
