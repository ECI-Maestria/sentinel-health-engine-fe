import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AuthLayout } from '@/presentation/templates/AuthLayout/AuthLayout'
import { ForgotPasswordStep1 } from '@/presentation/organisms/ForgotPasswordStep1/ForgotPasswordStep1'
import { VerifyCodeStep2 } from '@/presentation/organisms/VerifyCodeStep2/VerifyCodeStep2'
import { ResetPasswordStep3 } from '@/presentation/organisms/ResetPasswordStep3/ResetPasswordStep3'
import { cn } from '@/lib/cn'

type Step = 1 | 2 | 3

interface ForgotPasswordState {
  email: string
  code: string
  maskedEmail: string
}

const STEP_LABELS: Record<Step, string> = {
  1: 'Ingresa tu correo',
  2: 'Verifica tu código',
  3: 'Nueva contraseña',
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [state, setState] = useState<ForgotPasswordState>({
    email: '',
    code: '',
    maskedEmail: '',
  })

  function handleStep1Success(email: string) {
    setState((prev) => ({ ...prev, email }))
    setStep(2)
  }

  function handleStep2Success(code: string, maskedEmail: string) {
    setState((prev) => ({ ...prev, code, maskedEmail }))
    setStep(3)
  }

  function handleStep3Success() {
    void navigate('/login', { state: { passwordReset: true } })
  }

  function handleBack() {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        {/* Step indicator */}
        <div className="space-y-3">
          {/* Breadcrumb steps */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-1">
                {s > 1 && (
                  <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    'font-medium',
                    s === step ? 'text-primary-600' : s < step ? 'text-gray-600' : 'text-gray-400',
                  )}
                >
                  Paso {s}/3
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full rounded-full bg-gray-200">
            <div
              className="h-1 rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <p className="text-xs text-gray-500">{STEP_LABELS[step]}</p>
        </div>

        {/* Step content */}
        {step === 1 && <ForgotPasswordStep1 onSuccess={handleStep1Success} />}
        {step === 2 && (
          <VerifyCodeStep2
            email={state.email}
            onSuccess={handleStep2Success}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <ResetPasswordStep3
            code={state.code}
            onSuccess={handleStep3Success}
            onBack={handleBack}
          />
        )}
      </div>
    </AuthLayout>
  )
}
