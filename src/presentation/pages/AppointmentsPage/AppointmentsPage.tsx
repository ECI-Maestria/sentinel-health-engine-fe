import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Role } from '@/core/domain/auth/User'
import { useAuthStore } from '@/store/auth.store'
import { useAppointments } from '@/application/appointment/useAppointments'
import { useCreateAppointment } from '@/application/appointment/useCreateAppointment'
import { useDeleteAppointment } from '@/application/appointment/useDeleteAppointment'
import { usePatients } from '@/application/patient/usePatients'
import { useMyPatients } from '@/application/caretaker/useMyPatients'
import { DoctorLayout } from '@/presentation/templates/DoctorLayout/DoctorLayout'
import { PatientLayout } from '@/presentation/templates/PatientLayout/PatientLayout'
import { CaretakerLayout } from '@/presentation/templates/CaretakerLayout/CaretakerLayout'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import type { Appointment } from '@/core/domain/appointment/Appointment'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function statusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED': return 'bg-green-100 text-green-700'
    case 'CANCELLED': return 'bg-red-100 text-red-700'
    case 'COMPLETED': return 'bg-gray-100 text-gray-600'
    default:          return 'bg-amber-100 text-amber-700'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'CONFIRMED': return 'Confirmada'
    case 'CANCELLED': return 'Cancelada'
    case 'COMPLETED': return 'Completada'
    default:          return 'Programada'
  }
}

// ── Create appointment form (DOCTOR only) ──────────────────────────────────

const schema = z.object({
  title:       z.string().min(2, 'Requerido'),
  scheduledAt: z.string().min(1, 'Requerido'),
  location:    z.string().optional(),
  notes:       z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function CreateAppointmentForm({
  patientId,
  onClose,
}: {
  patientId: string
  onClose: () => void
}) {
  const { mutate, isPending, error } = useCreateAppointment(patientId)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit(values: FormValues) {
    const scheduledAt = new Date(values.scheduledAt).toISOString()
    mutate(
      { title: values.title, scheduledAt, location: values.location, notes: values.notes },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Nueva cita médica</h2>
        <form id="appt-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Título *</label>
            <input {...register('title')} placeholder="Ej: Control mensual" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fecha y hora *</label>
            <input {...register('scheduledAt')} type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
            {errors.scheduledAt && <p className="mt-1 text-xs text-red-500">{errors.scheduledAt.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Lugar</label>
            <input {...register('location')} placeholder="Ej: Consultorio 201" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notas</label>
            <textarea {...register('notes')} rows={2} placeholder="Indicaciones previas..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
          </div>
          {error && <p className="text-xs text-red-600">{String(error)}</p>}
        </form>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" form="appt-form" isLoading={isPending}>Crear cita</Button>
        </div>
      </div>
    </div>
  )
}

// ── Appointment list for a patient ────────────────────────────────────────────

function AppointmentsList({
  patientId,
  canCreate,
}: {
  patientId: string
  canCreate?: boolean
}) {
  const { data: appointments, isLoading } = useAppointments(patientId)
  const { mutate: deleteAppt } = useDeleteAppointment(patientId)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner size="md" className="text-primary-500" /></div>
  }

  const upcoming = (appointments ?? [])
    .filter((a) => a.status !== 'CANCELLED' && new Date(a.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const past = (appointments ?? [])
    .filter((a) => a.status === 'CANCELLED' || new Date(a.scheduledAt) < new Date())
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  function AppointmentCard({ appt }: { appt: Appointment }) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900">{appt.title}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(appt.status)}`}>
                {statusLabel(appt.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-primary-600 font-medium">{formatDateTime(appt.scheduledAt)}</p>
            {appt.location && <p className="mt-0.5 text-xs text-gray-500">📍 {appt.location}</p>}
            {appt.notes && <p className="mt-1 text-xs text-gray-400">{appt.notes}</p>}
          </div>
          {canCreate && confirmDelete === appt.id ? (
            <div className="flex flex-col gap-1 flex-shrink-0">
              <p className="text-xs font-medium text-red-600">¿Eliminar?</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>No</Button>
                <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => { deleteAppt(appt.id); setConfirmDelete(null) }}>Sí</Button>
              </div>
            </div>
          ) : canCreate ? (
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 flex-shrink-0" onClick={() => setConfirmDelete(appt.id)}>Eliminar</Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {canCreate && (
        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(true)}>+ Nueva cita</Button>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-sm text-gray-500">Sin citas programadas</p>
          {canCreate && <Button size="sm" onClick={() => setShowCreate(true)}>Programar primera cita</Button>}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h3 className="mb-3 font-semibold text-gray-900">Próximas citas</h3>
              <div className="space-y-3">{upcoming.map((a) => <AppointmentCard key={a.id} appt={a} />)}</div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h3 className="mb-3 font-semibold text-gray-700">Historial</h3>
              <div className="space-y-3">{past.slice(0, 5).map((a) => <AppointmentCard key={a.id} appt={a} />)}</div>
            </section>
          )}
        </>
      )}

      {showCreate && (
        <CreateAppointmentForm patientId={patientId} onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

// ── Role-specific pages ───────────────────────────────────────────────────────

function DoctorAppointments() {
  const { data: patients } = usePatients()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <DoctorLayout title="Citas Médicas" subtitle="Gestiona las citas de tus pacientes">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">Seleccionar paciente</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value || null)}
          >
            <option value="">-- Selecciona un paciente --</option>
            {patients?.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
          </select>
        </div>
        {selectedId && <AppointmentsList patientId={selectedId} canCreate />}
      </div>
    </DoctorLayout>
  )
}

function PatientAppointments() {
  const { user } = useAuthStore()
  return (
    <PatientLayout title="Mis Citas" subtitle="Tus citas médicas programadas">
      <div className="mx-auto max-w-3xl">
        {user && <AppointmentsList patientId={user.id} canCreate={false} />}
      </div>
    </PatientLayout>
  )
}

function CaretakerAppointments() {
  const { data } = useMyPatients()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const patients = data?.patients ?? []

  return (
    <CaretakerLayout title="Citas Médicas" subtitle="Citas de tus pacientes asignados">
      <div className="mx-auto max-w-3xl space-y-6">
        {patients.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No tienes pacientes asignados</p>
        ) : (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-gray-700">Seleccionar paciente</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value || null)}
              >
                <option value="">-- Selecciona un paciente --</option>
                {patients.map((p) => <option key={p.patientId} value={p.patientId}>{p.fullName}</option>)}
              </select>
            </div>
            {selectedId && <AppointmentsList patientId={selectedId} canCreate={false} />}
          </>
        )}
      </div>
    </CaretakerLayout>
  )
}

export function AppointmentsPage() {
  const { user } = useAuthStore()
  if (!user) return null
  if (user.role === Role.DOCTOR) return <DoctorAppointments />
  if (user.role === Role.PATIENT) return <PatientAppointments />
  if (user.role === Role.CARETAKER) return <CaretakerAppointments />
  return <Navigate to="/dashboard" replace />
}
