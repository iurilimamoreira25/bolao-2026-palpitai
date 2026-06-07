'use client'
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-lime text-[#1A1A1A] hover:bg-brand-lime-dark border-transparent',
  secondary: 'bg-white text-text-primary border-surface-border hover:bg-surface-muted',
  ghost: 'bg-transparent text-text-secondary border-transparent hover:bg-surface-muted',
  danger: 'bg-red-500 text-white border-transparent hover:bg-red-600',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-5 py-2.5 rounded-xl',
  lg: 'text-base px-6 py-3 rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold border',
        'active:scale-95 transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export default Button
