import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost'
type Size = 'md' | 'lg'

// Кольцо фокуса brand-500: 7.5:1 на белом; offset-кольцо оставляет его видимым и на тёмном фоне.
const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md active:translate-y-px',
  secondary: 'bg-white text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50 active:bg-brand-100',
  // accent-700 на белом тексте — 5.5:1 (accent-500 давал 2.5:1).
  accent: 'bg-accent-700 text-white shadow-sm hover:bg-accent-800 hover:shadow-md active:translate-y-px',
  ghost: 'text-brand-600 hover:bg-brand-50 active:bg-brand-100',
}

// md: 20px строка + 2×12px = 44px — минимальная зона касания для мобильных.
const sizes: Record<Size, string> = {
  md: 'min-h-11 px-5 py-3 text-sm',
  lg: 'min-h-13 px-7 py-3.5 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />
}

type ButtonLinkProps = { to: string; children: ReactNode; variant?: Variant; size?: Size; className?: string }

export function ButtonLink({ to, children, variant = 'primary', size = 'md', className = '' }: ButtonLinkProps) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  )
}
