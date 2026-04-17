import { useState, useMemo } from 'react'
import { Plus, Search, Users, UserCheck, UserX, AlertTriangle } from 'lucide-react'
import { useDoctorDashboard } from '@/application/doctor/useDoctorDashboard'
import { useLatestVitals } from '@/application/vital/useLatestVitals'
import { useAuthStore } from '@/store/auth.store'
import { Role } from '@/core/domain/auth/User'
import { Navigate } from 'react-router-dom'
import { DoctorLayout } from '@/presentation/templates/DoctorLayout/DoctorLayout'
import { NewPatientModal } from '@/presentation/organisms/NewPatientModal/NewPatientModal'
import { PatientDetailModal } from '@/presentation/organisms/PatientDetailModal/PatientDetailModal'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import { cn } from '@/lib/cn'
import type { DashboardPatient } from '@/core/domain/doctor/DoctorDashboard'

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  value: number | string
  valueColor?: string
  label: string
  sub?: string
  subColor?: string
}

function StatCard({
  icon,
  iconBg,
  value,
  valueColor,
  label,
  sub,
  subColor,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div
        className={cn(
          'mb-3 flex h-11 w-11 items-center justify-center rounded-xl',
          iconBg,
        )}
      >
        {icon}
      </div>
      <p className={cn('text-3xl font-bold leading-none', valueColor ?? 'text-gray-900')}>
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      {sub && (
        <p className={cn('mt-1.5 text-xs', subColor ?? 'text-gray-400')}>{sub}</p>
      )}
    </div>
  )
}

// ── Patient row avatar ────────────────────────────────────────────────────────

function PatientAvatar({ patient }: { patient: DashboardPatient }) {
  const initials =
    `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-100 text-xs font-bold text-primary-700">
      {initials}
    </div>
  )
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'bg-gray-100 text-gray-500',
      )}
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

// ── Device count badge ────────────────────────────────────────────────────────

function DevicesBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        count > 0
          ? 'bg-blue-50 text-blue-700'
          : 'bg-gray-100 text-gray-400',
      )}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="3" />
      </svg>
      {count} disp.
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type FilterChip = 'all' | 'active' | 'inactive'

export function PatientsPage() {
  const { user } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterChip>('all')

  // Only DOCTOR role can access this page
  if (user && user.role !== Role.DOCTOR) {
    return <Navigate to="/dashboard" replace />
  }

  const { data: patients = [], isLoading, isError } = useDoctorDashboard()

  const totalActive = patients.filter((p) => p.isActive).length
  const totalInactive = patients.length - totalActive
  const totalDevices = patients.reduce((sum, p) => sum + p.deviceCount, 0)

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && p.isActive) ||
        (filter === 'inactive' && !p.isActive)

      const q = search.toLowerCase()
      const matchesSearch =
        q === '' ||
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)

      return matchesFilter && matchesSearch
    })
  }, [patients, filter, search])

  const chips: { key: FilterChip; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: patients.length },
    { key: 'active', label: 'Activos', count: totalActive },
    { key: 'inactive', label: 'Inactivos', count: totalInactive },
  ]

  return (
    <DoctorLayout
      title="Pacientes"
      subtitle={
        isLoading
          ? 'Cargando...'
          : `${patients.length} paciente${patients.length !== 1 ? 's' : ''} registrado${patients.length !== 1 ? 's' : ''}`
      }
      actions={
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo Paciente
        </Button>
      }
    >
      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          iconBg="bg-primary-100"
          icon={<Users className="h-5 w-5 text-primary-600" />}
          value={patients.length}
          label="Total Pacientes"
          sub={isLoading ? '…' : `${totalActive} activos`}
          subColor="text-primary-600"
        />
        <StatCard
          iconBg="bg-green-50"
          icon={<UserCheck className="h-5 w-5 text-green-600" />}
          value={totalActive}
          valueColor="text-green-600"
          label="Activos"
          sub="Con acceso al sistema"
          subColor="text-gray-400"
        />
        <StatCard
          iconBg="bg-gray-100"
          icon={<UserX className="h-5 w-5 text-gray-500" />}
          value={totalInactive}
          label="Inactivos"
          sub="Sin acceso al sistema"
          subColor="text-gray-400"
        />
        <StatCard
          iconBg="bg-blue-50"
          icon={<AlertTriangle className="h-5 w-5 text-blue-500" />}
          value={totalDevices}
          valueColor="text-blue-600"
          label="Dispositivos"
          sub="Registrados en total"
          subColor="text-gray-400"
        />
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="flex max-w-xs flex-1 items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-3.5 py-2">
            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={cn(
                  'rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors',
                  filter === c.key
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-400 hover:text-primary-600',
                )}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-primary-500" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">
            Error al cargar los pacientes. Intenta de nuevo.
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {search || filter !== 'all'
                ? 'No se encontraron pacientes con ese criterio'
                : 'Aún no tienes pacientes registrados'}
            </p>
            {!search && filter === 'all' && (
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="mt-1 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Agregar primer paciente
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Dispositivos
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Último Vital
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    onView={() => setSelectedPatient(patient)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-3">
            <p className="text-xs text-gray-400">
              Mostrando {filtered.length} de {patients.length} paciente
              {patients.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <NewPatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <PatientDetailModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </DoctorLayout>
  )
}

// ── Patient row ───────────────────────────────────────────────────────────────

function PatientRow({
  patient,
  onView,
}: {
  patient: DashboardPatient
  onView: () => void
}) {
  const registeredAt = new Date(patient.createdAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50 last:border-0">
      {/* Patient */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <PatientAvatar patient={patient} />
          <div>
            <p className="font-semibold text-gray-900">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="text-xs text-gray-400">{patient.id.slice(0, 8)}…</p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 text-gray-600">{patient.email}</td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge isActive={patient.isActive} />
      </td>

      {/* Devices */}
      <td className="px-6 py-4">
        <DevicesBadge count={patient.deviceCount} />
      </td>

      {/* Last vital */}
      <td className="px-6 py-4">
        <PatientLastVital patientId={patient.id} />
      </td>

      {/* Created at */}
      <td className="px-6 py-4 text-gray-500">{registeredAt}</td>

      {/* Actions */}
      <td className="px-6 py-4">
        <button
          onClick={onView}
          className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
        >
          Ver
        </button>
      </td>
    </tr>
  )
}
