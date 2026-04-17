import { Label } from '@/presentation/atoms/Label/Label'

export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  htmlFor?: string
}

export function FormField({
  label,
  error,
  required = false,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      {children}

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
