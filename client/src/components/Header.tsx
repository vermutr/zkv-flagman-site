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

// Пункты мобильного меню: 44px высоты под палец.
const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-4 py-3 text-base font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-700 hover:bg-stone-100 hover:text-brand-700'
  }`

export function Header({ onOrderClick }: { onOrderClick: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header sticky top-0 z-40 border-b border-stone-200/70 bg-white/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          <img src="/logo.png" alt={company.name} width={1753} height={399} className="h-9 w-auto sm:h-11" />
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
          className="grid h-11 w-11 place-items-center rounded-lg text-brand-900 hover:bg-brand-50 active:bg-brand-100 md:hidden"
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
                <NavLink key={l.to} to={l.to} className={mobileLinkClass} onClick={() => setOpen(false)}>
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
