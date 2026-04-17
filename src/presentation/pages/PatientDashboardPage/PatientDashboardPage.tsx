import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useLatestVitals } from '@/application/vital/useLatestVitals'
import { useAlerts } from '@/application/alert/useAlerts'
import { useMedications } from '@/application/medication/useMedications'
import { useAppointments } from '@/application/appointment/useAppointments'
import { usePatientCaretakers } from '@/application/caretaker/usePatientCaretakers'
import { PatientLayout } from '@/presentation/templates/PatientLayout/PatientLayout'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import type { Appointment, AppointmentStatus } from '@/core/domain/appointment/Appointment'
import type { MedicationFrequency } from '@/core/domain/medication/Medication'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function hrStatus(hr: number): { label: string; color: string } {
  if (hr < 50 || hr > 120) return { label: 'Crítico', color: 'text-red-600 bg-red-50' }
  if (hr < 60 || hr > 100) return { label: 'Atención', color: 'text-amber-600 bg-amber-50' }
  return { label: 'Normal', color: 'text-green-700 bg-green-50' }
}

function spo2Status(spo2: number): { label: string; color: string } {
  if (spo2 < 90) return { label: 'Crítico', color: 'text-red-600 bg-red-50' }
  if (spo2 < 95) return { label: 'Atención', color: 'text-amber-600 bg-amber-50' }
  return { label: 'Normal', color: 'text-green-700 bg-green-50' }
}

function frequencyLabel(freq: MedicationFrequency): string {
  const map: Record<MedicationFrequency, string> = {
    DAILY: 'Una vez al día',
    TWICE_DAILY: 'Dos veces al día',
    THREE_TIMES_DAILY: 'Tres veces al día',
    EVERY_8_HOURS: 'Cada 8 horas',
    EVERY_12_HOURS: 'Cada 12 horas',
    WEEKLY: 'Semanal',
    AS_NEEDED: 'Según necesidad',
  }
  return map[freq] ?? freq
}

function appointmentStatusBadge(status: AppointmentStatus) {
  const map: Record<AppointmentStatus, { label: string; color: string }> = {
    SCHEDULED: { label: 'Programada', color: 'bg-blue-50 text-blue-700' },
    CONFIRMED: { label: 'Confirmada', color: 'bg-green-50 text-green-700' },
    CANCELLED: { label: 'Cancelada', color: 'bg-red-50 text-red-700' },
    COMPLETED: { label: 'Completada', color: 'bg-gray-100 text-gray-600' },
  }
  const s = map[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function PatientDashboardPage() {
  const { user } = useAuthStore()
  const patientId = user?.id ?? null

  const { data: latest, isLoading: loadingVitals } = useLatestVitals(patientId)
  const { data: alerts } = useAlerts(patientId)
  const { data: medications, isLoading: loadingMeds } = useMedications(patientId)
  const { data: appointments, isLoading: loadingAppts } = useAppointments(patientId)
  const { data: caretakers, isLoading: loadingCaretakers } = usePatientCaretakers(patientId)

  // Alert banner: WARNING or CRITICAL in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentAlerts = (alerts ?? []).filter(
    (a) =>
      (a.severity === 'WARNING' || a.severity === 'CRITICAL') &&
      new Date(a.createdAt) >= sevenDaysAgo,
  )

  // Upcoming appointments: future dates only, max 3
  const now = new Date()
  const upcomingAppointments: Appointment[] = (appointments ?? [])
    .filter((a) => new Date(a.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3)

  const hrS = latest ? hrStatus(latest.heartRate) : null
  const spo2S = latest ? spo2Status(latest.spO2) : null

  return (
    <PatientLayout>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.firstName}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Este es tu panel de salud personal
        </p>
      </div>

      {/* Alert banner */}
      {recentAlerts.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500 px-5 py-4 text-white shadow-sm">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm font-medium">
            Tienes <span className="font-bold">{recentAlerts.length}</span>{' '}
            {recentAlerts.length === 1 ? 'alerta' : 'alertas'} en los últimos 7 días.{' '}
            <Link to="/alerts" className="underline hover:no-underline">
              Ver alertas
            </Link>
          </p>
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">

          {/* Mis Signos Vitales */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Mis Signos Vitales</h2>
              <Link to="/vitals" className="text-xs font-medium text-primary-600 hover:underline">
                Ver historial completo
              </Link>
            </div>

            {loadingVitals ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" className="text-primary-500" />
              </div>
            ) : !latest ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <p className="text-sm text-gray-400">Sin lecturas disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                {/* FC */}
                <div className="p-5">
                  <p className="text-xs font-medium text-gray-500">Frec. Cardíaca</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    {latest.heartRate}
                    <span className="ml-1 text-base font-normal text-gray-400">bpm</span>
                  </p>
                  {hrS && (
                    <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${hrS.color}`}>
                      {hrS.label}
                    </span>
                  )}
                </div>
                {/* SpO2 */}
                <div className="p-5">
                  <p className="text-xs font-medium text-gray-500">Saturación O₂</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    {latest.spO2.toFixed(1)}
                    <span className="ml-1 text-base font-normal text-gray-400">%</span>
                  </p>
                  {spo2S && (
                    <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${spo2S.color}`}>
                      {spo2S.label}
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Mis Medicamentos */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Mis Medicamentos</h2>
              <Link to="/medications" className="text-xs font-medium text-primary-600 hover:underline">
                Ver todos
              </Link>
            </div>

            {loadingMeds ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" className="text-primary-500" />
              </div>
            ) : !medications || medications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <p className="text-sm text-gray-400">Sin medicamentos registrados</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {medications.filter((m) => m.isActive).slice(0, 5).map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{m.name}</p>
                      <p className="truncate text-xs text-gray-400">{m.dosage} · {frequencyLabel(m.frequency)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-6">

          {/* Próximas Citas */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Próximas Citas</h2>
              <Link to="/appointments" className="text-xs font-medium text-primary-600 hover:underline">
                Ver todas
              </Link>
            </div>

            {loadingAppts ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" className="text-primary-500" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p className="text-sm text-gray-400">Sin citas próximas</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {upcomingAppointments.map((a) => (
                  <li key={a.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{a.title}</p>
                      {appointmentStatusBadge(a.status)}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(a.scheduledAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Mis Cuidadores */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Mis cuidadores</h2>
              <Link to="/my-caretakers">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Gestionar
                </Button>
              </Link>
            </div>

            {loadingCaretakers ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" className="text-blue-500" />
              </div>
            ) : !caretakers || caretakers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-5 py-6 text-center">
                <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="text-xs text-gray-500">No tienes cuidadores vinculados</p>
                <Link to="/my-caretakers">
                  <Button variant="default" size="sm">
                    Vincular cuidador
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 px-2 py-2">
                {caretakers.map((c) => {
                  const initials = c.fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n.charAt(0))
                    .join('')
                    .toUpperCase()
                  return (
                    <li key={c.caretakerId} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{c.fullName}</p>
                        <p className="truncate text-xs text-gray-400">{c.email}</p>
                      </div>
                    </li>
                  )
                })}
                <li className="px-3 pt-2 pb-1">
                  <Link to="/my-caretakers">
                    <Button variant="secondary" size="sm" className="w-full">
                      Ver todos mis cuidadores
                    </Button>
                  </Link>
                </li>
              </ul>
            )}
          </section>
        </div>
      </div>
    </PatientLayout>
  )
}
