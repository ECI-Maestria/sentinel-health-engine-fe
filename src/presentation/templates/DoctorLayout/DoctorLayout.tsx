import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/auth.store'
import { TokenStorage } from '@/infrastructure/storage/TokenStorage'

interface NavItem { label: string; to: string; icon: React.ReactNode }

function NavIcon({ children }: { children: React.ReactNode }) {
  return <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">{children}</span>
}

function Icon({ d, extra }: { d?: string; extra?: React.ReactNode }) {
  return (
    <NavIcon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
        {d && <path d={d} />}
        {extra}
      </svg>
    </NavIcon>
  )
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <NavIcon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg></NavIcon>,
  },
  {
    label: 'Pacientes',
    to: '/patients',
    icon: <Icon extra={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />,
  },
  {
    label: 'Médicos',
    to: '/doctors',
    icon: <Icon extra={<><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></>} />,
  },
  {
    label: 'Alertas',
    to: '/alerts',
    icon: <Icon extra={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />,
  },
  {
    label: 'Citas',
    to: '/appointments',
    icon: <NavIcon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></NavIcon>,
  },
  {
    label: 'Vitales',
    to: '/vitals',
    icon: <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
  {
    label: 'Medicamentos',
    to: '/medications',
    icon: <Icon extra={<><path d="M9 3H5a2 2 0 0 0-2 2v4" /><path d="M9 3h10a2 2 0 0 1 2 2v4" /><path d="M3 9h18" /><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="10" y1="15" x2="14" y2="15" /></>} />,
  },
  {
    label: 'Mi Perfil',
    to: '/profile',
    icon: <NavIcon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></NavIcon>,
  },
]

export interface DoctorLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function DoctorLayout({ children, title, subtitle, actions }: DoctorLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '??'

  function handleLogout() {
    clearAuth()
    TokenStorage.clear()
    void navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-gray-900">
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-6">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-white">Sentinel Health</div>
            <div className="text-[10px] font-medium text-white/40">Engine v1.0</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">Principal</p>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      'flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary-500 text-white' : 'text-white/60 hover:bg-white/[0.07] hover:text-white',
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

        </nav>

        <div className="border-t border-white/[0.08] p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-500 text-xs font-bold text-white">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{user ? `${user.firstName} ${user.lastName}` : '—'}</p>
              <p className="text-[11px] text-white/40">Médico</p>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-60 flex flex-1 flex-col">
        {(title ?? actions) && (
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
            <div>
              {title && <h1 className="text-lg font-bold text-gray-900">{title}</h1>}
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </header>
        )}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
