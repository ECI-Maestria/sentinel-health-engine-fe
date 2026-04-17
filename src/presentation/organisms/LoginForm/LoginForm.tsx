import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '@/application/auth/useLogin'
import { Button } from '@/presentation/atoms/Button/Button'
import { Input } from '@/presentation/atoms/Input/Input'
import { FormField } from '@/presentation/molecules/FormField/FormField'
import { AlertBanner } from '@/presentation/molecules/AlertBanner/AlertBanner'

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

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

export function LoginForm() {
  const navigate = useNavigate()
  const { mutate, isPending, error } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginFormValues) {
    mutate(data, {
      onSuccess: () => {
        void navigate('/dashboard')
      },
    })
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
        <p className="text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
      </div>

      {error && (
        <AlertBanner type="error" message={extractErrorMessage(error)} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Correo electrónico"
          error={errors.email?.message}
          htmlFor="login-email"
          required
        >
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@ejemplo.com"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Contraseña"
          error={errors.password?.message}
          htmlFor="login-password"
          required
        >
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={!!errors.password}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
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
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isPending}>
          Iniciar sesión
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        ¿Eres cuidador?{' '}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  )
}
