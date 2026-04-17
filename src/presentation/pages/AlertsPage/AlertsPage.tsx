import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Role } from '@/core/domain/auth/User'
import { useAuthStore } from '@/store/auth.store'
import { useAlerts } from '@/application/alert/useAlerts'
import { useAlertStats } from '@/application/alert/useAlertStats'
import { useAcknowledgeAlert } from '@/application/alert/useAcknowledgeAlert'
import { useMyPatients } from '@/application/caretaker/useMyPatients'
import { useDoctorDashboard } from '@/application/doctor/useDoctorDashboard'
import { DoctorLayout } from '@/presentation/templates/DoctorLayout/DoctorLayout'
import { PatientLayout } from '@/presentation/templates/PatientLayout/PatientLayout'
import { CaretakerLayout } from '@/presentation/templates/CaretakerLayout/CaretakerLayout'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import type { AlertRecord } from '@/core/domain/alert/Alert'

// ── helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function SeverityBadge({ severity }: { severity: string }) {
  const isCritical = severity === 'CRITICAL'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />
      {isCritical ? 'Crítica' : 'Advertencia'}
    </span>
  )
}

function AlertRow({ alert, patientId, patientName }: { alert: AlertRecord; patientId: string; patientName?: string }) {
  const { mutate: acknowledge, isPending } = useAcknowledgeAlert(patientId)
  const isAcknowledged = alert.status === 'ACKNOWLEDGED'

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex-shrink-0 mt-0.5">
        <SeverityBadge severity={alert.severity} />
      </div>
      <div className="min-w-0 flex-1">
        {patientName && (
          <p className="mb-0.5 text-xs font-medium text-gray-500">{patientName}</p>
        )}
        <p className="font-medium text-gray-900">{alert.message}</p>
        {alert.violations && alert.violations.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {alert.violations.map((v, i) => (
              <li key={i} className="text-xs text-gray-500">
                {v.metricName}: <span className="font-medium text-gray-700">{v.actualValue}</span> — {v.ruleName}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1.5 text-xs text-gray-400">{formatTime(alert.createdAt)}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {isAcknowledged ? (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            Reconocida
          </span>
        ) : (
          <button
            onClick={() => acknowledge(alert.id)}
            disabled={isPending}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
          >
            {isPending ? '...' : 'Reconocer'}
          </button>
        )}
      </div>
    </div>
  )
}

function AlertsPanel({ patientId, patientName }: { patientId: string; patientName?: string }) {
  const [severity, setSeverity] = useState<string | undefined>(undefined)
  const { data: alerts, isLoading } = useAlerts(patientId, severity)
  const { data: stats } = useAlertStats(patientId)

  const filters = [
    { key: 'Todas', label: 'Todas', value: undefined },
    { key: 'CRITICAL', label: 'Críticas', value: 'CRITICAL' },
    { key: 'WARNING', label: 'Advertencias', value: 'WARNING' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-amber-700">{stats.warning}</p>
            <p className="text-xs text-amber-600">Advertencias</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
            <p className="text-xs text-red-600">Críticas</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setSeverity(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              severity === f.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner size="md" className="text-primary-500" /></div>
      ) : !alerts || alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="text-sm text-gray-500">Sin alertas para el período seleccionado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <AlertRow key={a.id} alert={a} patientId={patientId} patientName={patientName} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Role-specific views ───────────────────────────────────────────────────────

function DoctorAlerts() {
  const { data: patients } = useDoctorDashboard()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedPatient = patients?.find((p) => p.id === selectedId)

  return (
    <DoctorLayout title="Alertas" subtitle="Historial de alertas por paciente">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">Seleccionar paciente</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value || null)}
          >
            <option value="">-- Selecciona un paciente --</option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
            ))}
          </select>
        </div>
        {selectedId && (
          <AlertsPanel patientId={selectedId} patientName={selectedPatient?.fullName} />
        )}
      </div>
    </DoctorLayout>
  )
}

function PatientAlerts() {
  const { user } = useAuthStore()
  return (
    <PatientLayout title="Mis Alertas" subtitle="Alertas generadas por tus signos vitales">
      <div className="mx-auto max-w-3xl">
        {user && <AlertsPanel patientId={user.id} />}
      </div>
    </PatientLayout>
  )
}

function CaretakerAlerts() {
  const { data } = useMyPatients()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const patients = data?.patients ?? []
  const selectedPatient = patients.find((p) => p.patientId === selectedId)

  return (
    <CaretakerLayout title="Alertas" subtitle="Alertas de tus pacientes asignados">
      <div className="mx-auto max-w-3xl space-y-6">
        {patients.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No tienes pacientes asignados</p>
        ) : (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-gray-700">Seleccionar paciente</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value || null)}
              >
                <option value="">-- Selecciona un paciente --</option>
                {patients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>{p.fullName}</option>
                ))}
              </select>
            </div>
            {selectedId && (
              <AlertsPanel patientId={selectedId} patientName={selectedPatient?.fullName} />
            )}
          </>
        )}
      </div>
    </CaretakerLayout>
  )
}

export function AlertsPage() {
  const { user } = useAuthStore()
  if (!user) return null
  if (user.role === Role.DOCTOR) return <DoctorAlerts />
  if (user.role === Role.PATIENT) return <PatientAlerts />
  if (user.role === Role.CARETAKER) return <CaretakerAlerts />
  return <Navigate to="/dashboard" replace />
}
