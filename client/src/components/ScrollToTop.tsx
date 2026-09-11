import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * SPA не перезагружает страницу, поэтому при переходе по ссылке прокрутка остаётся на месте.
 * Прокручиваем к началу только при переходе вперёд; «Назад» и «Вперёд» (POP) оставляем браузеру,
 * чтобы он вернул прежнюю позицию.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, navigationType])

  return null
}
