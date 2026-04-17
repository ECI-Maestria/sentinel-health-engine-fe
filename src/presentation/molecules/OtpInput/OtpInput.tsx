import { useRef } from 'react'
import { cn } from '@/lib/cn'

const OTP_LENGTH = 6

export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

export function OtpInput({
  value,
  onChange,
  disabled = false,
  error = false,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Array.from garantiza exactamente OTP_LENGTH elementos sin importar el largo de value.
  // value.padEnd(n, '') no funciona cuando el relleno es un string vacío: padEnd necesita
  // un carácter de relleno de al menos 1 caracter, de lo contrario devuelve el string
  // original sin modificar, lo que produce un array vacío y no renderiza ningún input.
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '')

  function focusAt(index: number) {
    const el = inputRefs.current[index]
    if (el) el.focus()
  }

  function handleChange(index: number, char: string) {
    const sanitized = char.replace(/\D/g, '').slice(0, 1)
    const newDigits = [...digits]
    newDigits[index] = sanitized
    onChange(newDigits.join(''))
    if (sanitized && index < OTP_LENGTH - 1) {
      focusAt(index + 1)
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join(''))
      } else if (index > 0) {
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        onChange(newDigits.join(''))
        focusAt(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1)
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusAt(index + 1)
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH)
    if (pasted.length > 0) {
      const padded = pasted.padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH)
      onChange(padded)
      const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1)
      focusAt(nextFocus)
    }
  }

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="Código OTP">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Dígito ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-14 w-12 rounded-lg border text-center text-xl font-semibold',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 focus:ring-red-400'
              : digit
                ? 'border-primary-500 bg-primary-50 text-primary-700 focus:ring-primary-500'
                : 'border-gray-300 bg-white text-gray-900 focus:ring-primary-500',
          )}
        />
      ))}
    </div>
  )
}
