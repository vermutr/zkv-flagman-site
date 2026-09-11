import { Container } from '../components/Container'
import { ButtonLink } from '../components/Button'

export default function NotFoundPage() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-gold-700">Ошибка 404</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-900">Страница не найдена</h1>
      <p className="mt-3 text-stone-600">Возможно, ссылка устарела или в адресе опечатка.</p>
      <ButtonLink to="/" className="mt-8">На главную</ButtonLink>
    </Container>
  )
}
