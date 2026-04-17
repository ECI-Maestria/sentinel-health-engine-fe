import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail } from 'lucide-react'
import { useForgotPassword } from '@/application/auth/useForgotPassword'
import { Button } from '@/presentation/atoms/Button/Button'
import { Input } from '@/presentation/atoms/Input/Input'
import { FormField } from '@/presentation/molecules/FormField/FormField'
import { AlertBanner } from '@/presentation/molecules/AlertBanner/AlertBanner'

const step1Schema = z.object({
  email: z.string().email('Correo inválido'),
})

type Step1FormValues = z.infer<typeof step1Schema>

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

export interface ForgotPasswordStep1Props {
  onSuccess: (email: string) => void
}

export function ForgotPasswordStep1({ onSuccess }: ForgotPasswordStep1Props) {
  const { mutate, isPending, error } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
  })

  function onSubmit(data: Step1FormValues) {
    mutate(data, {
      onSuccess: () => {
        onSuccess(data.email)
      },
    })
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
          <Mail className="h-6 w-6 text-primary-500" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h2>
        <p className="text-sm text-gray-500">
          Ingresa tu correo y te enviaremos un código de recuperación.
        </p>
      </div>

      {error && (
        <AlertBanner type="error" message={extractErrorMessage(error)} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Correo electrónico"
          error={errors.email?.message}
          htmlFor="fp-email"
          required
        >
          <Input
            id="fp-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@ejemplo.com"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <Button type="submit" className="w-full" isLoading={isPending}>
          Enviar código
        </Button>
      </form>
    </div>
  )
}
