import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import TeamPage from './pages/TeamPage'
import NewsPage from './pages/NewsPage'
import ContactsPage from './pages/ContactsPage'
import NotFoundPage from './pages/NotFoundPage'

// Статья тянет за собой react-markdown — держим её в отдельном чанке.
const NewsArticlePage = lazy(() => import('./pages/NewsArticlePage'))

export default function App({ onOrderClick = () => {} }: { onOrderClick?: () => void }) {
  return (
    <Routes>
      <Route element={<Layout onOrderClick={onOrderClick} />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route
          path="news/:slug"
          element={
            <Suspense fallback={<p className="p-16 text-center text-stone-500">Загружаем статью…</p>}>
              <NewsArticlePage />
            </Suspense>
          }
        />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
