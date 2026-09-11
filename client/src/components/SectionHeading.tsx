type Props = { eyebrow?: string; title: string; subtitle?: string; align?: 'left' | 'center' }

export function SectionHeading({ eyebrow, title, subtitle, align = 'left' }: Props) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''
  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent-600">{eyebrow}</p>}
      <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-stone-600">{subtitle}</p>}
    </div>
  )
}
