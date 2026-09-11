import { Outlet } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout({ onOrderClick }: { onOrderClick: () => void }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header onOrderClick={onOrderClick} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
