import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Menu, X } from 'lucide-react'
import { company } from '../content/company'
import { Container } from './Container'
import { Button } from './Button'

const links = [
  { to: '/services', label: 'Услуги' },
  { to: '/team', label: 'Команда' },
  { to: '/news', label: 'Новости' },
  { to: '/contacts', label: 'Контакты' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:text-brand-700'
  }`

export function Header({ onOrderClick }: { onOrderClick: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-brand-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">БП</span>
          {company.name}
        </Link>
        <nav aria-label="Основное меню" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button onClick={onOrderClick}>Заказать услугу</Button>
        </div>
        <button
          className="rounded-lg p-2 text-brand-900 md:hidden"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </Container>
      {open && (
        <div className="border-t border-stone-200 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            <nav id="mobile-menu" aria-label="Мобильное меню" className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <Button
              className="mt-2"
              onClick={() => {
                setOpen(false)
                onOrderClick()
              }}
            >
              Заказать услугу
            </Button>
          </Container>
        </div>
      )}
    </header>
  )
}
