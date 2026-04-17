import { Activity, Shield, Users } from 'lucide-react'
import { Logo } from '@/presentation/atoms/Logo/Logo'

const bullets = [
  {
    icon: Activity,
    title: 'Monitoreo en tiempo real',
    description: 'Seguimiento continuo de signos vitales',
  },
  {
    icon: Shield,
    title: 'Seguridad garantizada',
    description: 'Datos cifrados y protegidos',
  },
  {
    icon: Users,
    title: 'Equipo conectado',
    description: 'Médicos, pacientes y cuidadores en un solo lugar',
  },
]

export interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — hidden on mobile */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center gap-10 px-12"
        style={{
          background: 'linear-gradient(160deg, #0D2117 0%, #1B4D3E 100%)',
        }}
      >
        <Logo size="lg" showText className="[&_span]:text-white" />

        <div className="space-y-1 text-center">
          <p className="text-lg font-semibold text-white">
            Monitoreo inteligente de salud
          </p>
          <p className="text-sm text-green-300">
            Cuida lo que más importa
          </p>
        </div>

        <ul className="w-full max-w-xs space-y-5">
          {bullets.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon className="h-5 w-5 text-green-300" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-green-300">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 lg:w-3/5">
        {/* Logo visible only on mobile */}
        <div className="mb-8 lg:hidden">
          <Logo size="md" showText />
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
