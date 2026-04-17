import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { useMyPatients } from '@/application/caretaker/useMyPatients'
import { alertsRepository } from '@/infrastructure/http/AlertsApiRepository'
import { CaretakerLayout } from '@/presentation/templates/CaretakerLayout/CaretakerLayout'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function UnlinkedState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
        <svg
          className="h-10 w-10 text-violet-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Aún no estás vinculado</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Para comenzar a monitorear pacientes, un médico debe vincularte a sus pacientes.
        </p>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">¿Cómo funciona?</p>
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-600">1</span>
            Un médico registra un paciente en Sentinel Health.
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-600">2</span>
            El médico te vincula como cuidador usando tu correo electrónico.
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-600">3</span>
            Podrás ver el estado de salud de tus pacientes aquí.
          </li>
        </ol>
      </div>
    </div>
  )
}

export function CaretakerDashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useMyPatients()

  const isLinked = data?.isLinked ?? false
  const patients = data?.patients ?? []

  // Fetch alert stats for all patients in parallel
  const alertStatsQueries = useQueries({
    queries: patients.map((p) => ({
      queryKey: ['alert-stats', p.patientId],
      queryFn: () => alertsRepository.getStats(p.patientId),
      enabled: patients.length > 0,
    })),
  })

  const totalActiveAlerts = alertStatsQueries.reduce((sum, q) => {
    if (!q.data) return sum
    return sum + (q.data.warning ?? 0) + (q.data.critical ?? 0)
  }, 0)
  const alertsLoaded = alertStatsQueries.every((q) => !q.isLoading)

  return (
    <CaretakerLayout>
      {isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" className="text-violet-500" />
        </div>
      ) : !isLinked || patients.length === 0 ? (
        <UnlinkedState />
      ) : (
        <>
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido, {user?.firstName}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Aquí tienes el resumen de tus pacientes
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Pacientes a cargo</p>
              <p className="mt-1 text-3xl font-bold text-violet-600">{patients.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Alertas activas</p>
              {alertsLoaded ? (
                <p className="mt-1 text-3xl font-bold text-red-500">{totalActiveAlerts}</p>
              ) : (
                <div className="mt-2">
                  <Spinner size="sm" className="text-red-400" />
                </div>
              )}
              <p className="mt-0.5 text-xs text-gray-400">Advertencias + Críticas</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Medicamentos hoy</p>
              <p className="mt-1 text-3xl font-bold text-amber-500">—</p>
              <p className="mt-0.5 text-xs text-gray-400">Próximamente</p>
            </div>
          </div>

          {/* Patient cards */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Mis pacientes</h2>
              <Link to="/my-patients">
                <Button variant="ghost" size="sm" className="text-violet-600">
                  Ver todos
                </Button>
              </Link>
            </div>
            <ul className="divide-y divide-gray-50">
              {patients.map((p) => {
                const initials = p.fullName
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n.charAt(0))
                  .join('')
                  .toUpperCase()
                return (
                  <li key={p.patientId} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{p.fullName}</p>
                      <p className="text-xs text-gray-400">{p.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Vinculado</p>
                      <p className="text-xs font-medium text-gray-600">{formatDate(p.linkedAt)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </CaretakerLayout>
  )
}
