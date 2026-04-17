import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { useDoctorDashboard } from '@/application/doctor/useDoctorDashboard'
import { useLatestVitals } from '@/application/vital/useLatestVitals'
import { alertsRepository } from '@/infrastructure/http/AlertsApiRepository'
import { DoctorLayout } from '@/presentation/templates/DoctorLayout/DoctorLayout'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import { NewPatientModal } from '@/presentation/organisms/NewPatientModal/NewPatientModal'
import { PatientDetailModal } from '@/presentation/organisms/PatientDetailModal/PatientDetailModal'
import type { DashboardPatient } from '@/core/domain/doctor/DoctorDashboard'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date) {
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  color: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <span className="rounded-lg bg-gray-50 p-2 text-gray-400">{icon}</span>
      </div>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  )
}

// ── PatientLastVital ──────────────────────────────────────────────────────────

function PatientLastVital({ patientId }: { patientId: string }) {
  const { data, isLoading } = useLatestVitals(patientId)

  if (isLoading) {
    return <span className="text-xs text-gray-400">Cargando…</span>
  }

  if (!data) {
    return <span className="text-xs text-gray-400">Sin datos</span>
  }

  return (
    <span className="text-xs font-medium text-gray-700">
      FC: {data.heartRate} bpm / SpO₂: {data.spO2}%
    </span>
  )
}

// ── Alert severity icon ───────────────────────────────────────────────────────

function AlertSeverityDot({ severity }: { severity: 'WARNING' | 'CRITICAL' }) {
  return (
    <span
      className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${
        severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-400'
      }`}
    />
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DoctorDashboardPage() {
  const { user } = useAuthStore()
  const { data: patients, isLoading } = useDoctorDashboard()
  const [newPatientOpen, setNewPatientOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null)

  const today = formatDate(new Date())
  const activeCount = patients?.filter((p) => p.isActive).length ?? 0

  // Fetch alert stats for every patient in parallel
  const alertQueries = useQueries({
    queries: (patients ?? []).map((p) => ({
      queryKey: ['alert-stats', p.id],
      queryFn: () => alertsRepository.getStats(p.id),
      enabled: Boolean(patients && patients.length > 0),
    })),
  })

  const totalAlerts = alertQueries.reduce((sum, q) => sum + (q.data?.total ?? 0), 0)
  const alertsLoading = alertQueries.some((q) => q.isLoading)

  // Build a quick list of patients with critical alerts for the sidebar
  const criticalAlertPatients = (patients ?? [])
    .map((p, i) => ({
      patient: p,
      stats: alertQueries[i]?.data,
    }))
    .filter((x) => (x.stats?.critical ?? 0) > 0)
    .slice(0, 3)

  return (
    <DoctorLayout>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel del Doctor</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Bienvenido, Dr. {user?.firstName}
          </p>
        </div>
        <p className="mt-1 text-xs capitalize text-gray-400 sm:mt-0 sm:text-right">
          {today}
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pacientes activos"
          value={isLoading ? '—' : activeCount}
          sub={patients ? `de ${patients.length} total` : undefined}
          color="text-primary-600"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Alertas activas"
          value={alertsLoading ? '…' : totalAlerts}
          sub={alertsLoading ? 'Calculando…' : `${criticalAlertPatients.length} paciente(s) crítico(s)`}
          color="text-red-500"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          }
        />
        <StatCard
          label="Citas hoy"
          value="—"
          sub="Próximamente"
          color="text-amber-500"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Medicamentos activos"
          value="—"
          sub="Próximamente"
          color="text-blue-500"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          }
        />
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* ── Left: patient table ─────────────────────────────────────── */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Mis Pacientes</h2>
            <Link to="/patients">
              <Button variant="ghost" size="sm" className="text-primary-600">
                Ver todos
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="md" className="text-primary-500" />
            </div>
          ) : !patients || patients.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No tienes pacientes aún</p>
              <Button
                variant="default"
                size="sm"
                onClick={() => setNewPatientOpen(true)}
              >
                Registrar primer paciente
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    <th className="px-5 py-3">Paciente</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Último Vital</th>
                    <th className="px-5 py-3 text-center">Disp.</th>
                    <th className="px-5 py-3 text-center">Cuid.</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {patients.map((patient) => {
                    const initials = `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase()
                    return (
                      <tr key={patient.id} className="transition-colors hover:bg-gray-50/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{patient.fullName}</p>
                              <p className="text-xs text-gray-400">{patient.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge isActive={patient.isActive} />
                        </td>
                        <td className="px-5 py-3">
                          <PatientLastVital patientId={patient.id} />
                        </td>
                        <td className="px-5 py-3 text-center text-gray-600">
                          {patient.deviceCount}
                        </td>
                        <td className="px-5 py-3 text-center text-gray-600">
                          {patient.caretakerCount}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Right column ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Recent alerts */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Alertas recientes</h2>
                {totalAlerts > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                    {totalAlerts}
                  </span>
                )}
              </div>
            </div>

            {alertsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" className="text-primary-500" />
              </div>
            ) : criticalAlertPatients.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Sin alertas críticas</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 px-1 py-1">
                {criticalAlertPatients.map(({ patient, stats }) => (
                  <li
                    key={patient.id}
                    className="flex items-start gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <AlertSeverityDot severity="CRITICAL" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {patient.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {stats?.critical ?? 0} alerta(s) crítica(s)
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="flex-shrink-0 text-xs font-medium text-primary-600 hover:underline"
                    >
                      Ver
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick actions */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Acciones rápidas</h2>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {/* Register patient */}
              <button
                onClick={() => setNewPatientOpen(true)}
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </span>
                Registrar paciente
              </button>

              {/* View patients */}
              <Link to="/patients" className="block">
                <button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  Ver pacientes
                </button>
              </Link>

              {/* Generate PDF report — disabled */}
              <button
                disabled
                className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-400"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </span>
                Generar reporte PDF
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                  Pronto
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <NewPatientModal open={newPatientOpen} onClose={() => setNewPatientOpen(false)} />

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </DoctorLayout>
  )
}
