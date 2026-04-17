import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Info } from 'lucide-react'
import { useCreatePatient } from '@/application/patient/useCreatePatient'
import { Button } from '@/presentation/atoms/Button/Button'
import { Input } from '@/presentation/atoms/Input/Input'
import { FormField } from '@/presentation/molecules/FormField/FormField'
import { AlertBanner } from '@/presentation/molecules/AlertBanner/AlertBanner'

const newPatientSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
})

type NewPatientFormValues = z.infer<typeof newPatientSchema>

function extractErrorMessage(error: unknown): string {
  if (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  return 'Ha ocurrido un error. Intenta de nuevo.'
}

export interface NewPatientModalProps {
  open: boolean
  onClose: () => void
}

export function NewPatientModal({ open, onClose }: NewPatientModalProps) {
  const { mutate, isPending, error, reset: resetMutation } = useCreatePatient()

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<NewPatientFormValues>({
    resolver: zodResolver(newPatientSchema),
  })

  // Reset form and mutation state whenever the modal opens
  useEffect(() => {
    if (open) {
      resetForm()
      resetMutation()
    }
  }, [open, resetForm, resetMutation])

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  function onSubmit(data: NewPatientFormValues) {
    mutate(data, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  if (!open) return null

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-patient-title"
    >
      {/* Panel */}
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-7 py-5">
          <div>
            <h2
              id="new-patient-title"
              className="text-lg font-bold text-gray-900"
            >
              Nuevo Paciente
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Registrar paciente en el sistema
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {error && (
            <div className="mb-4">
              <AlertBanner type="error" message={extractErrorMessage(error)} />
            </div>
          )}

          {/* Info banner */}
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" aria-hidden="true" />
            <p className="text-sm text-blue-700">
              El paciente recibirá su contraseña temporal por correo electrónico
              para acceder a la aplicación móvil.
            </p>
          </div>

          <form
            id="new-patient-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nombres"
                error={errors.firstName?.message}
                htmlFor="np-firstName"
                required
              >
                <Input
                  id="np-firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Ana"
                  error={!!errors.firstName}
                  {...register('firstName')}
                />
              </FormField>

              <FormField
                label="Apellidos"
                error={errors.lastName?.message}
                htmlFor="np-lastName"
                required
              >
                <Input
                  id="np-lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Torres Gómez"
                  error={!!errors.lastName}
                  {...register('lastName')}
                />
              </FormField>
            </div>

            <FormField
              label="Correo electrónico"
              error={errors.email?.message}
              htmlFor="np-email"
              required
            >
              <Input
                id="np-email"
                type="email"
                autoComplete="email"
                placeholder="paciente@ejemplo.com"
                error={!!errors.email}
                {...register('email')}
              />
            </FormField>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 px-7 py-5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-patient-form"
            isLoading={isPending}
          >
            Guardar Paciente
          </Button>
        </div>
      </div>
    </div>
  )
}
