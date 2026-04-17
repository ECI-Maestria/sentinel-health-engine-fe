import { cn } from '@/lib/cn'

type LogoSize = 'sm' | 'md' | 'lg'

const sizeConfig: Record<LogoSize, { box: string; text: string; icon: number }> = {
  sm: { box: 'h-7 w-7', text: 'text-sm', icon: 16 },
  md: { box: 'h-9 w-9', text: 'text-base', icon: 20 },
  lg: { box: 'h-12 w-12', text: 'text-lg', icon: 26 },
}

export interface LogoProps {
  size?: LogoSize
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const cfg = sizeConfig[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-primary-500 flex-shrink-0',
          cfg.box,
        )}
      >
        {/* ECG wave SVG */}
        <svg
          width={cfg.icon}
          height={cfg.icon}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <polyline
            points="2,12 5,12 7,6 9,18 11,10 13,14 15,12 22,12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={cn('font-semibold text-gray-900 leading-tight', cfg.text)}>
          Sentinel Health
        </span>
      )}
    </div>
  )
}
