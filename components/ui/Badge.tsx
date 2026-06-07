import { cn } from '@/lib/utils'

type Color = 'lime' | 'gray' | 'green' | 'red' | 'blue' | 'yellow'

interface BadgeProps {
  color?: Color
  children: React.ReactNode
  className?: string
}

const colorClasses: Record<Color, string> = {
  lime: 'bg-brand-lime/20 text-[#5a6e00]',
  gray: 'bg-surface-muted text-text-secondary',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
}

export default function Badge({ color = 'gray', children, className }: BadgeProps) {
  return (
    <span className={cn('badge', colorClasses[color], className)}>
      {children}
    </span>
  )
}
