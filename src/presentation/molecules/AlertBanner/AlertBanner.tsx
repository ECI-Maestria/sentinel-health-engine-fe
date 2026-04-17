import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'

type AlertType = 'error' | 'warning' | 'success' | 'info'

const typeConfig: Record<
  AlertType,
  { icon: React.FC<{ className?: string }>, containerClass: string; iconClass: string; textClass: string }
> = {
  error: {
    icon: AlertCircle,
    containerClass: 'bg-red-50 border border-red-200',
    iconClass: 'text-red-500',
    textClass: 'text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-yellow-50 border border-yellow-200',
    iconClass: 'text-yellow-500',
    textClass: 'text-yellow-700',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'bg-green-50 border border-green-200',
    iconClass: 'text-green-500',
    textClass: 'text-green-700',
  },
  info: {
    icon: Info,
    containerClass: 'bg-blue-50 border border-blue-200',
    iconClass: 'text-blue-500',
    textClass: 'text-blue-700',
  },
}

export interface AlertBannerProps {
  type: AlertType
  message: string
  onDismiss?: () => void
}

export function AlertBanner({ type, message, onDismiss }: AlertBannerProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn('flex items-start gap-3 rounded-lg p-3', config.containerClass)}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', config.iconClass)} aria-hidden="true" />
      <p className={cn('flex-1 text-sm', config.textClass)}>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 rounded p-0.5 transition-colors hover:bg-black/10',
            config.textClass,
          )}
          aria-label="Cerrar alerta"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
