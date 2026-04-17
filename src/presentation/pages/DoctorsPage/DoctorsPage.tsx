import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Role } from '@/core/domain/auth/User'
import { useAuthStore } from '@/store/auth.store'
import { useDoctors } from '@/application/doctor/useDoctors'
import { useCreateDoctor } from '@/application/doctor/useCreateDoctor'
import { DoctorLayout } from '@/presentation/templates/DoctorLayout/DoctorLayout'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'

// ── Create Doctor Modal ───────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(2, 'Requerido'),
  lastName:  z.string().min(2, 'Requerido'),
  email:     z.string().email('Correo inválido'),
})
type FormValues = z.infer<typeof schema>

function NewDoctorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate, isPending, error, reset } = useCreateDoctor()
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset: resetForm } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) { resetForm(); reset(); setSuccess(false) }
  }, [open, resetForm, reset])

  if (!open) return null

  function onSubmit(values: FormValues) {
    mutate(values, {
      onSuccess: () => setSuccess(true),
    })
  }

  function extractMsg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
      return (e as { message: string }).message
    }
    return 'Ha ocurrido un error'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Médico registrado</p>
              <p className="mt-1 text-sm text-gray-500">Recibirá sus credenciales de acceso por correo electrónico.</p>
            </div>
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Registrar nuevo médico</h2>
              <p className="mt-0.5 text-sm text-gray-500">El médico recibirá una contraseña temporal por correo.</p>
            </div>

            <form id="new-doctor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
                  <input {...register('firstName')} placeholder="Nombre" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Apellido *</label>
                  <input {...register('lastName')} placeholder="Apellido" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Correo electrónico *</label>
                <input {...register('email')} type="email" placeholder="medico@hospital.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              {error && <p className="text-xs text-red-600">{extractMsg(error)}</p>}
            </form>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
              <Button type="submit" form="new-doctor-form" isLoading={isPending}>Registrar médico</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Doctors Page ──────────────────────────────────────────────────────────────

export function DoctorsPage() {
  const { user } = useAuthStore()
  const { data: doctors, isLoading } = useDoctors()
  const [modalOpen, setModalOpen] = useState(false)

  if (user?.role !== Role.DOCTOR) return <Navigate to="/dashboard" replace />

  return (
    <DoctorLayout
      title="Médicos"
      subtitle="Gestión del equipo médico"
      actions={
        <Button onClick={() => setModalOpen(true)}>+ Nuevo médico</Button>
      }
    >
      <div className="mx-auto max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" className="text-primary-500" /></div>
        ) : !doctors || doctors.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 7h-9" /><path d="M14 17H5" />
              <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
            </svg>
            <p className="font-medium text-gray-500">No hay médicos registrados</p>
            <Button onClick={() => setModalOpen(true)}>Registrar primer médico</Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3">Médico</th>
                  <th className="px-5 py-3">Correo</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((d) => {
                  const initials = `${d.firstName.charAt(0)}${d.lastName.charAt(0)}`.toUpperCase()
                  return (
                    <tr key={d.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                            {initials}
                          </div>
                          <p className="font-medium text-gray-900">{d.fullName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{d.email}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {d.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(d.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewDoctorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DoctorLayout>
  )
}
