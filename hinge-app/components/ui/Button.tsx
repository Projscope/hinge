import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'gold'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gold text-black hover:opacity-90',
  ghost:
    'bg-transparent text-ink-3 border border-[var(--border2)] hover:border-ink-3 hover:text-ink',
  gold:
    'bg-gold text-black font-semibold hover:opacity-90',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-[12px]',
  md: 'px-5 py-[10px] text-[13px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-[10px] font-medium font-sans cursor-pointer
        border-none transition-all duration-150 active:scale-[0.98]
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
