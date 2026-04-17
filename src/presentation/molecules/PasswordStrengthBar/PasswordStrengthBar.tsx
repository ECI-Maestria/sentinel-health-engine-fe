import { Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StrengthLevel {
  label: string
  percentage: number
  colorBar: string
  colorText: string
}

function getStrength(password: string): StrengthLevel {
  const len = password.length
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  if (len === 0) {
    return { label: 'Muy débil', percentage: 10, colorBar: 'bg-red-500', colorText: 'text-red-600' }
  }
  if (len < 8) {
    return { label: 'Débil', percentage: 25, colorBar: 'bg-orange-400', colorText: 'text-orange-600' }
  }
  if (len >= 8 && hasUppercase && hasNumber && hasSymbol) {
    return { label: 'Muy fuerte', percentage: 95, colorBar: 'bg-primary-500', colorText: 'text-primary-600' }
  }
  if (len >= 8 && hasUppercase && hasNumber) {
    return { label: 'Fuerte', percentage: 75, colorBar: 'bg-green-400', colorText: 'text-green-600' }
  }
  return { label: 'Regular', percentage: 50, colorBar: 'bg-yellow-400', colorText: 'text-yellow-600' }
}

export interface PasswordStrengthBarProps {
  password: string
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = getStrength(password)
  const len = password.length
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  const requirements = [
    { label: '8 o más caracteres', met: len >= 8 },
    { label: 'Mayúscula', met: hasUppercase },
    { label: 'Número', met: hasNumber },
    { label: 'Carácter especial', met: hasSymbol },
  ]

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div
          className={cn('h-1.5 rounded-full transition-all duration-300', strength.colorBar)}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>

      {/* Label */}
      <p className={cn('text-xs font-medium', strength.colorText)}>
        {strength.label}
      </p>

      {/* Requirements */}
      <ul className="space-y-1">
        {requirements.map((req) => (
          <li key={req.label} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
            )}
            <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
