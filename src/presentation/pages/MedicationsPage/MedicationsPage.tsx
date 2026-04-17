import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Role } from '@/core/domain/auth/User'
import { useAuthStore } from '@/store/auth.store'
import { useMedications } from '@/application/medication/useMedications'
import { useCreateMedication } from '@/application/medication/useCreateMedication'
import { useDeactivateMedication } from '@/application/medication/useDeactivateMedication'
import { usePatients } from '@/application/patient/usePatients'
import { useMyPatients } from '@/application/caretaker/useMyPatients'
import { DoctorLayout } from '@/presentation/templates/DoctorLayout/DoctorLayout'
import { PatientLayout } from '@/presentation/templates/PatientLayout/PatientLayout'
import { CaretakerLayout } from '@/presentation/templates/CaretakerLayout/CaretakerLayout'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import type { Medication, MedicationFrequency } from '@/core/domain/medication/Medication'

// ── helpers ───────────────────────────────────────────────────────────────────

const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  DAILY:             'Una vez al día',
  TWICE_DAILY:       'Dos veces al día',
  THREE_TIMES_DAILY: 'Tres veces al día',
  EVERY_8_HOURS:     'Cada 8 horas',
  EVERY_12_HOURS:    'Cada 12 horas',
  WEEKLY:            'Una vez a la semana',
  AS_NEEDED:         'Según necesidad',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ── Create medication form (DOCTOR only) ──────────────────────────────────────

const schema = z.object({
  name:      z.string().min(2, 'Requerido'),
  dosage:    z.string().min(1, 'Requerido'),
  frequency: z.enum(['DAILY', 'TWICE_DAILY', 'THREE_TIMES_DAILY', 'EVERY_8_HOURS', 'EVERY_12_HOURS', 'WEEKLY', 'AS_NEEDED']),
  startDate: z.string().min(1, 'Requerido'),
  endDate:   z.string().optional(),
  notes:     z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function CreateMedicationForm({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { mutate, isPending, error } = useCreateMedication(patientId)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { frequency: 'DAILY' },
  })

  function onSubmit(values: FormValues) {
    mutate(
      { ...values, endDate: values.endDate || undefined },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Nuevo medicamento</h2>
        <form id="med-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del medicamento *</label>
            <input {...register('name')} placeholder="Ej: Metformina" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Dosis *</label>
            <input {...register('dosage')} placeholder="Ej: 500mg" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
            {errors.dosage && <p className="mt-1 text-xs text-red-500">{errors.dosage.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Frecuencia *</label>
            <select {...register('frequency')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none">
              {Object.entries(FREQUENCY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha inicio *</label>
              <input {...register('startDate')} type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
              {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha fin</label>
              <input {...register('endDate')} type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notas</label>
            <textarea {...register('notes')} rows={2} placeholder="Indicaciones adicionales..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none" />
          </div>
          {error && <p className="text-xs text-red-600">{String(error)}</p>}
        </form>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" form="med-form" isLoading={isPending}>Agregar medicamento</Button>
        </div>
      </div>
    </div>
  )
}

// ── Medication card ───────────────────────────────────────────────────────────

function MedicationCard({
  med,
  canManage,
  patientId,
}: {
  med: Medication
  canManage?: boolean
  patientId: string
}) {
  const { mutate: deactivate, isPending } = useDeactivateMedication(patientId)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${med.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{med.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${med.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {med.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-primary-600">{med.dosage} — {FREQUENCY_LABELS[med.frequency as MedicationFrequency] ?? med.frequency}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
            <span>Inicio: {formatDate(med.startDate)}</span>
            {med.endDate && <span>Fin: {formatDate(med.endDate)}</span>}
            {med.scheduledTimes && med.scheduledTimes.length > 0 && (
              <span>Horarios: {med.scheduledTimes.join(', ')}</span>
            )}
          </div>
          {med.notes && <p className="mt-1 text-xs text-gray-400 italic">{med.notes}</p>}
        </div>

        {canManage && med.isActive && (
          confirm ? (
            <div className="flex flex-col gap-1 flex-shrink-0">
              <p className="text-xs font-medium text-red-600">¿Desactivar?</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>No</Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  isLoading={isPending}
                  onClick={() => deactivate(med.id)}
                >
                  Sí
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 flex-shrink-0" onClick={() => setConfirm(true)}>
              Desactivar
            </Button>
          )
        )}
      </div>
    </div>
  )
}

// ── Medications list for a patient ────────────────────────────────────────────

function MedicationsList({ patientId, canManage }: { patientId: string; canManage?: boolean }) {
  const { data: medications, isLoading } = useMedications(patientId)
  const [showCreate, setShowCreate] = useState(false)

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner size="md" className="text-primary-500" /></div>
  }

  const active = (medications ?? []).filter((m) => m.isActive)
  const inactive = (medications ?? []).filter((m) => !m.isActive)

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(true)}>+ Nuevo medicamento</Button>
        </div>
      )}

      {active.length === 0 && inactive.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3H5a2 2 0 0 0-2 2v4" /><path d="M9 3h10a2 2 0 0 1 2 2v4" />
            <path d="M3 9h18" /><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
            <line x1="12" y1="13" x2="12" y2="17" /><line x1="10" y1="15" x2="14" y2="15" />
          </svg>
          <p className="text-sm text-gray-500">Sin medicamentos registrados</p>
          {canManage && <Button size="sm" onClick={() => setShowCreate(true)}>Agregar primer medicamento</Button>}
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h3 className="mb-3 font-semibold text-gray-900">Medicamentos activos</h3>
              <div className="space-y-3">
                {active.map((m) => <MedicationCard key={m.id} med={m} canManage={canManage} patientId={patientId} />)}
              </div>
            </section>
          )}
          {inactive.length > 0 && (
            <section>
              <h3 className="mb-3 font-semibold text-gray-500">Historial</h3>
              <div className="space-y-3">
                {inactive.map((m) => <MedicationCard key={m.id} med={m} patientId={patientId} />)}
              </div>
            </section>
          )}
        </>
      )}

      {showCreate && (
        <CreateMedicationForm patientId={patientId} onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

// ── Role-specific pages ───────────────────────────────────────────────────────

function DoctorMedications() {
  const { data: patients } = usePatients()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <DoctorLayout title="Medicamentos" subtitle="Gestiona los medicamentos de tus pacientes">
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
        {selectedId && <MedicationsList patientId={selectedId} canManage />}
      </div>
    </DoctorLayout>
  )
}

function PatientMedications() {
  const { user } = useAuthStore()
  return (
    <PatientLayout title="Mis Medicamentos" subtitle="Medicamentos prescritos por tu médico">
      <div className="mx-auto max-w-3xl">
        {user && <MedicationsList patientId={user.id} canManage={false} />}
      </div>
    </PatientLayout>
  )
}

function CaretakerMedications() {
  const { data } = useMyPatients()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const patients = data?.patients ?? []

  return (
    <CaretakerLayout title="Medicamentos" subtitle="Medicamentos de tus pacientes asignados">
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
            {selectedId && <MedicationsList patientId={selectedId} canManage={false} />}
          </>
        )}
      </div>
    </CaretakerLayout>
  )
}

export function MedicationsPage() {
  const { user } = useAuthStore()
  if (!user) return null
  if (user.role === Role.DOCTOR) return <DoctorMedications />
  if (user.role === Role.PATIENT) return <PatientMedications />
  if (user.role === Role.CARETAKER) return <CaretakerMedications />
  return <Navigate to="/dashboard" replace />
}
