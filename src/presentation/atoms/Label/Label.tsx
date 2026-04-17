import * as RadixLabel from '@radix-ui/react-label'
import { cn } from '@/lib/cn'

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof RadixLabel.Root> {
  className?: string
}

export function Label({ className, ...props }: LabelProps) {
  return (
    <RadixLabel.Root
      className={cn(
        'text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}
