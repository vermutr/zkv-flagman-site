import { Link } from 'react-router'
import { company } from '../content/company'
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-white">
      <Container className="grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-brand-900">{company.name}</p>
          <p className="mt-2 text-sm text-stone-600">{company.tagline}</p>
          <p className="mt-4 text-xs text-stone-500">{company.legal}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-brand-900">Разделы</p>
          <ul className="mt-3 space-y-2 text-stone-600">
            <li><Link to="/services" className="hover:text-brand-700">Услуги и пакеты</Link></li>
            <li><Link to="/team" className="hover:text-brand-700">Команда</Link></li>
            <li><Link to="/news" className="hover:text-brand-700">Новости</Link></li>
            <li><Link to="/contacts" className="hover:text-brand-700">Контакты</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-brand-900">Контакты</p>
          <ul className="mt-3 space-y-2 text-stone-600">
            <li><a href={company.phoneHref} className="hover:text-brand-700">{company.phone}</a></li>
            <li><a href={`mailto:${company.email}`} className="hover:text-brand-700">{company.email}</a></li>
            <li>{company.address}</li>
            <li>{company.hours}</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {company.name}
      </div>
    </footer>
  )
}
