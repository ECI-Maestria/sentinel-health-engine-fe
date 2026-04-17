import { LogOut, KeyRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { TokenStorage } from '@/infrastructure/storage/TokenStorage'
import { Logo } from '@/presentation/atoms/Logo/Logo'
import { Button } from '@/presentation/atoms/Button/Button'

export interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    TokenStorage.clear()
    void navigate('/login')
  }

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : ''

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Logo size="sm" showText />

          <div className="flex items-center gap-2">
            {displayName && (
              <span className="hidden text-sm font-medium text-gray-700 sm:block">
                {displayName}
              </span>
            )}
            <Link to="/change-password">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-gray-600"
                title="Cambiar contraseña"
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cambiar contraseña</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-gray-600"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  )
}
