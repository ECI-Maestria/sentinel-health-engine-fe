import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-gray-300 hover:border-gray-400',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
