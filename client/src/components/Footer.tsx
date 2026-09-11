import { Link } from 'react-router'
import { company } from '../content/company'
import { Container } from './Container'

const linkClass =
  'inline-block transition-[color,transform] duration-200 ease-out hover:translate-x-0.5 hover:text-gold-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-gold-400'

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-900 text-brand-100">
      <div aria-hidden="true" className="h-px bg-linear-to-r from-transparent via-gold-500 to-transparent" />
      <Container className="grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-white">{company.name}</p>
          <p className="mt-2 text-sm text-brand-100/80">{company.tagline}</p>
          <p className="mt-4 text-xs text-brand-100/60">{company.legal}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold uppercase tracking-wider text-gold-300">Разделы</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link to="/services" className={linkClass}>Услуги и пакеты</Link></li>
            <li><Link to="/team" className={linkClass}>Команда</Link></li>
            <li><Link to="/news" className={linkClass}>Новости</Link></li>
            <li><Link to="/contacts" className={linkClass}>Контакты</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold uppercase tracking-wider text-gold-300">Контакты</p>
          <ul className="mt-4 space-y-2.5">
            <li><a href={company.phoneHref} className={linkClass}>{company.phone}</a></li>
            <li><a href={company.phone2Href} className={linkClass}>{company.phone2}</a></li>
            <li><a href={`mailto:${company.email}`} className={linkClass}>{company.email}</a></li>
            <li>{company.address}</li>
            <li>{company.hours}</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10 py-4 text-center text-xs text-brand-100/60">
        © {new Date().getFullYear()} {company.name}
      </div>
    </footer>
  )
}
