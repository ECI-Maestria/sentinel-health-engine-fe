import { useState, useEffect } from 'react'
import { useVerifyResetCode } from '@/application/auth/useVerifyResetCode'
import { useForgotPassword } from '@/application/auth/useForgotPassword'
import { Button } from '@/presentation/atoms/Button/Button'
import { OtpInput } from '@/presentation/molecules/OtpInput/OtpInput'
import { AlertBanner } from '@/presentation/molecules/AlertBanner/AlertBanner'

const COUNTDOWN_SECONDS = 60

function formatCountdown(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

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

export interface VerifyCodeStep2Props {
  email: string
  onSuccess: (code: string, maskedEmail: string) => void
  onBack: () => void
}

export function VerifyCodeStep2({ email, onSuccess, onBack }: VerifyCodeStep2Props) {
  const { mutate: verifyCode, isPending, error } = useVerifyResetCode()
  const { mutate: resendCode, isPending: isResending } = useForgotPassword()
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (countdown <= 0) return

    const timerId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerId)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [countdown])

  function handleResend() {
    resendCode({ email }, {
      onSuccess: () => {
        setCountdown(COUNTDOWN_SECONDS)
        setCode('')
      },
    })
  }

  function handleVerify() {
    if (code.length < 6) return
    verifyCode({ code }, {
      onSuccess: (data) => {
        onSuccess(code, data.maskedEmail)
      },
    })
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold text-gray-900">Verifica tu código</h2>
        <p className="text-sm text-gray-500">
          Enviamos un código de 6 dígitos a{' '}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {error && (
        <AlertBanner type="error" message={extractErrorMessage(error)} />
      )}

      <OtpInput
        value={code}
        onChange={setCode}
        disabled={isPending}
        error={!!error}
      />

      {/* Countdown / resend */}
      <div className="text-center text-sm text-gray-500">
        {countdown > 0 ? (
          <span>
            Reenviar código en{' '}
            <span className="font-semibold tabular-nums text-gray-700">
              {formatCountdown(countdown)}
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline disabled:opacity-50"
          >
            {isResending ? 'Reenviando…' : 'Reenviar código'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          className="w-full"
          onClick={handleVerify}
          isLoading={isPending}
          disabled={code.replace(/\s/g, '').length < 6}
        >
          Verificar
        </Button>

        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          Volver
        </Button>
      </div>
    </div>
  )
}
