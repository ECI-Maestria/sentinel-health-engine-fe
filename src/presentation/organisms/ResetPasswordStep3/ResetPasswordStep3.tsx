import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useResetPassword } from '@/application/auth/useResetPassword'
import { Button } from '@/presentation/atoms/Button/Button'
import { Input } from '@/presentation/atoms/Input/Input'
import { FormField } from '@/presentation/molecules/FormField/FormField'
import { PasswordStrengthBar } from '@/presentation/molecules/PasswordStrengthBar/PasswordStrengthBar'
import { AlertBanner } from '@/presentation/molecules/AlertBanner/AlertBanner'

const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type ResetFormValues = z.infer<typeof resetSchema>

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

export interface ResetPasswordStep3Props {
  code: string
  onSuccess: () => void
  onBack: () => void
}

export function ResetPasswordStep3({ code, onSuccess, onBack }: ResetPasswordStep3Props) {
  const { mutate, isPending, error } = useResetPassword()
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  })

  const newPasswordValue = watch('newPassword', '')

  function onSubmit(data: ResetFormValues) {
    mutate(
      { code, newPassword: data.newPassword },
      {
        onSuccess: () => {
          onSuccess()
        },
      },
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">Nueva contraseña</h2>
        <p className="text-sm text-gray-500">Elige una contraseña segura para tu cuenta.</p>
      </div>

      {error && (
        <AlertBanner type="error" message={extractErrorMessage(error)} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Nueva contraseña"
          error={errors.newPassword?.message}
          htmlFor="rp-newPassword"
          required
        >
          <div className="relative">
            <Input
              id="rp-newPassword"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.newPassword}
              className="pr-10"
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        {newPasswordValue.length > 0 && (
          <PasswordStrengthBar password={newPasswordValue} />
        )}

        <FormField
          label="Confirmar contraseña"
          error={errors.confirmPassword?.message}
          htmlFor="rp-confirmPassword"
          required
        >
          <div className="relative">
            <Input
              id="rp-confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.confirmPassword}
              className="pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full" isLoading={isPending}>
            Cambiar contraseña
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
            Volver
          </Button>
        </div>
      </form>
    </div>
  )
}
