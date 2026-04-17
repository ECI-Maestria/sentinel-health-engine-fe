import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRegisterCaretaker } from '@/application/auth/useRegisterCaretaker'
import { Button } from '@/presentation/atoms/Button/Button'
import { Input } from '@/presentation/atoms/Input/Input'
import { FormField } from '@/presentation/molecules/FormField/FormField'
import { AlertBanner } from '@/presentation/molecules/AlertBanner/AlertBanner'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

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

export function RegisterCaretakerForm() {
  const { mutate, isPending, error } = useRegisterCaretaker()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  function onSubmit(data: RegisterFormValues) {
    mutate(data, {
      onSuccess: () => {
        setSuccess(true)
      },
    })
  }

  if (success) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
            <CheckCircle className="h-8 w-8 text-primary-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">¡Cuenta creada!</h2>
          <p className="text-sm text-gray-500">
            Revisa tu correo. Te enviamos tu contraseña temporal.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="text-sm text-gray-500">Regístrate como cuidador</p>
      </div>

      {error && (
        <AlertBanner type="error" message={extractErrorMessage(error)} />
      )}

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" aria-hidden="true" />
        <p className="text-sm text-blue-700">
          Recibirás tu contraseña temporal por correo electrónico.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Nombre"
            error={errors.firstName?.message}
            htmlFor="reg-firstName"
            required
          >
            <Input
              id="reg-firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Juan"
              error={!!errors.firstName}
              {...register('firstName')}
            />
          </FormField>

          <FormField
            label="Apellido"
            error={errors.lastName?.message}
            htmlFor="reg-lastName"
            required
          >
            <Input
              id="reg-lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Pérez"
              error={!!errors.lastName}
              {...register('lastName')}
            />
          </FormField>
        </div>

        <FormField
          label="Correo electrónico"
          error={errors.email?.message}
          htmlFor="reg-email"
          required
        >
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@ejemplo.com"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <Button type="submit" className="w-full" isLoading={isPending}>
          Registrarme
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
