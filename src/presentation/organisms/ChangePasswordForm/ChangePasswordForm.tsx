import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useChangePassword } from '@/application/auth/useChangePassword'
import { Button } from '@/presentation/atoms/Button/Button'
import { Input } from '@/presentation/atoms/Input/Input'
import { FormField } from '@/presentation/molecules/FormField/FormField'
import { PasswordStrengthBar } from '@/presentation/molecules/PasswordStrengthBar/PasswordStrengthBar'
import { AlertBanner } from '@/presentation/molecules/AlertBanner/AlertBanner'

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

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

export interface ChangePasswordFormProps {
  onSuccess?: () => void
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { mutate, isPending, error } = useChangePassword()
  const [success, setSuccess] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const newPasswordValue = watch('newPassword', '')

  function onSubmit(data: ChangePasswordFormValues) {
    mutate(
      { oldPassword: data.oldPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          setSuccess(true)
          onSuccess?.()
        },
      },
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <CheckCircle className="h-8 w-8 text-primary-500" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">¡Contraseña actualizada!</h2>
          <p className="text-sm text-gray-500">
            Tu contraseña ha sido cambiada exitosamente.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {error && (
        <AlertBanner type="error" message={extractErrorMessage(error)} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Current password */}
        <FormField
          label="Contraseña actual"
          error={errors.oldPassword?.message}
          htmlFor="cp-oldPassword"
          required
        >
          <div className="relative">
            <Input
              id="cp-oldPassword"
              type={showOld ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={!!errors.oldPassword}
              className="pr-10"
              {...register('oldPassword')}
            />
            <button
              type="button"
              onClick={() => setShowOld((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              aria-label={showOld ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showOld ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
          >
            ¿Olvidaste tu contraseña actual?
          </Link>
        </div>

        {/* New password */}
        <FormField
          label="Nueva contraseña"
          error={errors.newPassword?.message}
          htmlFor="cp-newPassword"
          required
        >
          <div className="relative">
            <Input
              id="cp-newPassword"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.newPassword}
              className="pr-10"
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              aria-label={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showNew ? (
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

        {/* Confirm new password */}
        <FormField
          label="Confirmar nueva contraseña"
          error={errors.confirmPassword?.message}
          htmlFor="cp-confirmPassword"
          required
        >
          <div className="relative">
            <Input
              id="cp-confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.confirmPassword}
              className="pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        <div className="flex flex-col gap-2 pt-2">
          <Button type="submit" className="w-full" isLoading={isPending}>
            Cambiar contraseña
          </Button>
          <Link to="/dashboard">
            <Button type="button" variant="ghost" className="w-full">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
