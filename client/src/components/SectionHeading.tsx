type Props = { eyebrow?: string; title: string; subtitle?: string; align?: 'left' | 'center' }

/** Заголовок раздела. Золотая линия перед надписью — мотив из линий логотипа. */
export function SectionHeading({ eyebrow, title, subtitle, align = 'left' }: Props) {
  const center = align === 'center'
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <p className={`mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-gold-700 ${center ? 'justify-center' : ''}`}>
          <span aria-hidden="true" className="h-px w-8 bg-gold-500" />
          {eyebrow}
          {center && <span aria-hidden="true" className="h-px w-8 bg-gold-500" />}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-stone-600">{subtitle}</p>}
    </div>
  )
}
