import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost'
type Size = 'md' | 'lg'

// Кольцо фокуса brand-500: 7.5:1 на белом; offset-кольцо оставляет его видимым и на тёмном фоне.
const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md',
  secondary: 'bg-white text-brand-700 ring-1 ring-brand-200 hover:ring-gold-500 hover:shadow-md active:bg-gold-50',
  // Золотая кнопка для тёмного фона: тёмно-синий текст на gold-400 — 8.2:1.
  gold: 'bg-gold-400 text-brand-900 shadow-sm hover:bg-gold-300 hover:shadow-glow',
  ghost: 'text-brand-700 hover:bg-gold-50 hover:text-brand-900 active:bg-gold-100',
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
