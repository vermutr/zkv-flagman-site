import { Outlet, useLocation } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'

export function Layout({ onOrderClick }: { onOrderClick: () => void }) {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Перейти к содержимому
      </a>
      <Header onOrderClick={onOrderClick} />
      {/* key по адресу: при смене страницы контент мягко появляется снизу. */}
      <main id="main" tabIndex={-1} key={pathname} className="animate-page-in flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
