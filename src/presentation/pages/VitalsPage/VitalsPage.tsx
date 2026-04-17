import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Role } from '@/core/domain/auth/User'
import { useAuthStore } from '@/store/auth.store'
import { useLatestVitals } from '@/application/vital/useLatestVitals'
import { useVitalsHistory } from '@/application/vital/useVitalsHistory'
import { useVitalsSummary } from '@/application/vital/useVitalsSummary'
import { useMyPatients } from '@/application/caretaker/useMyPatients'
import { usePatients } from '@/application/patient/usePatients'
import { DoctorLayout } from '@/presentation/templates/DoctorLayout/DoctorLayout'
import { PatientLayout } from '@/presentation/templates/PatientLayout/PatientLayout'
import { CaretakerLayout } from '@/presentation/templates/CaretakerLayout/CaretakerLayout'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import type { VitalReading } from '@/core/domain/vital/Vital'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
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

// Simple SVG sparkline
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 120
  const H = 36
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-32" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Period filter helpers ────────────────────────────────────────────────────

type Period = 'day' | 'week' | 'month'

function periodCutoff(period: Period): Date {
  const now = new Date()
  if (period === 'day') return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (period === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
}

// ── VitalsPanel (shows data for one patient) ────────────────────────────────

function VitalsPanel({ patientId }: { patientId: string }) {
  const [period, setPeriod] = useState<Period>('week')
  const { data: latest, isLoading: loadingLatest } = useLatestVitals(patientId)
  const { data: history, isLoading: loadingHistory } = useVitalsHistory(patientId)
  const { data: summary, isLoading: loadingSummary } = useVitalsSummary(patientId)

  const isLoading = loadingLatest || loadingHistory || loadingSummary

  const filteredHistory = (history ?? []).filter(
    (r: VitalReading) => new Date(r.measuredAt) >= periodCutoff(period),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    )
  }

  if (!latest) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <p className="font-medium text-gray-500">Sin lecturas disponibles</p>
        <p className="text-sm text-gray-400">El dispositivo del paciente no ha enviado datos aún</p>
      </div>
    )
  }

  const hrS = hrStatus(latest.heartRate)
  const spo2S = spo2Status(latest.spO2)
  const hrValues = filteredHistory.map((r: VitalReading) => r.heartRate).reverse()
  const spo2Values = filteredHistory.map((r: VitalReading) => r.spO2).reverse()

  return (
    <div className="space-y-6">
      {/* Current reading */}
      <div className="grid grid-cols-2 gap-4">
        {/* Heart Rate */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Frecuencia Cardíaca</p>
              <p className="mt-1 text-4xl font-bold text-gray-900">
                {latest.heartRate}
                <span className="ml-1 text-lg font-normal text-gray-400">bpm</span>
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${hrS.color}`}>{hrS.label}</span>
          </div>
          <div className="mt-3">
            <Sparkline values={hrValues} color="#ef4444" />
          </div>
          <p className="mt-2 text-xs text-gray-400">Última medición: {formatTime(latest.measuredAt)}</p>
        </div>

        {/* SpO2 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Saturación de Oxígeno</p>
              <p className="mt-1 text-4xl font-bold text-gray-900">
                {latest.spO2.toFixed(1)}
                <span className="ml-1 text-lg font-normal text-gray-400">%</span>
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${spo2S.color}`}>{spo2S.label}</span>
          </div>
          <div className="mt-3">
            <Sparkline values={spo2Values} color="#3b82f6" />
          </div>
          <p className="mt-2 text-xs text-gray-400">Última medición: {formatTime(latest.measuredAt)}</p>
        </div>
      </div>

      {/* Summary stats */}
      {summary && summary.count > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Estadísticas (últimos 30 días)</h2>
            <p className="text-xs text-gray-400">{summary.count} lecturas</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-5">
              <p className="text-sm font-medium text-gray-500 mb-3">Frecuencia Cardíaca (bpm)</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-xs text-gray-400">Mín</p><p className="text-xl font-bold text-gray-700">{summary.heartRate.min}</p></div>
                <div><p className="text-xs text-gray-400">Prom</p><p className="text-xl font-bold text-primary-600">{summary.heartRate.avg}</p></div>
                <div><p className="text-xs text-gray-400">Máx</p><p className="text-xl font-bold text-gray-700">{summary.heartRate.max}</p></div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm font-medium text-gray-500 mb-3">Saturación de Oxígeno (%)</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-xs text-gray-400">Mín</p><p className="text-xl font-bold text-gray-700">{summary.spO2.min.toFixed(1)}</p></div>
                <div><p className="text-xs text-gray-400">Prom</p><p className="text-xl font-bold text-blue-600">{summary.spO2.avg.toFixed(1)}</p></div>
                <div><p className="text-xs text-gray-400">Máx</p><p className="text-xl font-bold text-gray-700">{summary.spO2.max.toFixed(1)}</p></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Period filter + History table */}
      {history && history.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Historial de lecturas</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">Período</span>
              <div className="flex gap-1">
                {([
                  { key: 'day', label: 'Día' },
                  { key: 'week', label: 'Semana' },
                  { key: 'month', label: 'Mes' },
                ] as const).map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      period === p.key
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {filteredHistory.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">
              Sin lecturas para el período seleccionado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                    <th className="px-5 py-3">Fecha y hora</th>
                    <th className="px-5 py-3 text-right">FC (bpm)</th>
                    <th className="px-5 py-3 text-right">SpO₂ (%)</th>
                    <th className="px-5 py-3 text-right">Estado FC</th>
                    <th className="px-5 py-3 text-right">Estado SpO₂</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredHistory.slice(0, 20).map((r: VitalReading) => {
                    const hs = hrStatus(r.heartRate)
                    const ss = spo2Status(r.spO2)
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-gray-600">{formatTime(r.measuredAt)}</td>
                        <td className="px-5 py-3 text-right font-mono font-medium text-gray-900">{r.heartRate}</td>
                        <td className="px-5 py-3 text-right font-mono font-medium text-gray-900">{r.spO2.toFixed(1)}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${hs.color}`}>{hs.label}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ss.color}`}>{ss.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ── Role-specific views ───────────────────────────────────────────────────────

function DoctorVitals() {
  const { data: patients } = usePatients()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedPatient = patients?.find((p) => p.id === selectedId)

  return (
    <DoctorLayout title="Vitales" subtitle="Monitoreo de signos vitales por paciente">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Patient selector */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">Seleccionar paciente</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value || null)}
          >
            <option value="">-- Selecciona un paciente --</option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
            ))}
          </select>
        </div>

        {selectedId && selectedPatient && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                {selectedPatient.firstName.charAt(0)}{selectedPatient.lastName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedPatient.fullName}</p>
                <p className="text-xs text-gray-400">{selectedPatient.email}</p>
              </div>
            </div>
            <VitalsPanel patientId={selectedId} />
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}

function PatientVitals() {
  const { user } = useAuthStore()
  return (
    <PatientLayout title="Mis Vitales" subtitle="Tus signos vitales en tiempo real">
      <div className="mx-auto max-w-3xl">
        {user && <VitalsPanel patientId={user.id} />}
      </div>
    </PatientLayout>
  )
}

function CaretakerVitals() {
  const { data } = useMyPatients()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const patients = data?.patients ?? []
  const selected = patients.find((p) => p.patientId === selectedId)

  return (
    <CaretakerLayout title="Vitales de Pacientes" subtitle="Monitoreo de signos vitales">
      <div className="mx-auto max-w-4xl space-y-6">
        {patients.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-gray-500">No tienes pacientes asignados aún</p>
          </div>
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
            {selectedId && selected && (
              <div>
                <p className="mb-4 font-semibold text-gray-900">{selected.fullName}</p>
                <VitalsPanel patientId={selectedId} />
              </div>
            )}
          </>
        )}
      </div>
    </CaretakerLayout>
  )
}

// ── Main page router ──────────────────────────────────────────────────────────

export function VitalsPage() {
  const { user } = useAuthStore()
  if (!user) return null
  if (user.role === Role.DOCTOR) return <DoctorVitals />
  if (user.role === Role.PATIENT) return <PatientVitals />
  if (user.role === Role.CARETAKER) return <CaretakerVitals />
  return <Navigate to="/dashboard" replace />
}
