import { ArrowRight } from 'lucide-react'
import { Container } from '../components/Container'
import { Button, ButtonLink } from '../components/Button'
import { SectionHeading } from '../components/SectionHeading'
import { PackageCard } from '../components/PackageCard'
import { TeamCard } from '../components/TeamCard'
import { NewsCard } from '../components/NewsCard'
import { company } from '../content/company'
import { advantages, ctaText, ctaTitle, heroStats, heroSubtitle } from '../content/home'
import { packages } from '../content/packages'
import { team } from '../content/team'
import { loadNews } from '../lib/news'
import { useOrder } from '../features/order/OrderContext'

export default function HomePage() {
  const { open } = useOrder()
  const news = loadNews().slice(0, 3)
  const stats = heroStats()

  return (
    <>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
        <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">Бухгалтерское обслуживание в Минске</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {company.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-100">{heroSubtitle}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" variant="accent" onClick={() => open()}>
                Заказать услугу
              </Button>
              <ButtonLink to="/services" size="lg" variant="secondary">
                Смотреть пакеты
              </ButtonLink>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <dt className="mt-1 text-sm text-brand-100">{label}</dt>
                <dd className="text-3xl font-extrabold tabular-nums text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Почему мы" title="Бухгалтерия без сюрпризов" subtitle="Четыре принципа, на которых держится наша работа с каждым клиентом." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-100 text-accent-700">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-bold text-brand-900">{title}</h3>
                <p className="mt-2 text-sm text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Пакеты" title="Выберите формат обслуживания" subtitle="Фиксированная цена в месяц. Отдельные услуги можно добавить к любому пакету." align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {packages.map((p) => (
              <PackageCard key={p.slug} pkg={p} onOrder={open} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink to="/services?tab=services" variant="ghost">
              Все отдельные услуги и цены <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Команда" title="Кто будет вести ваш учёт" />
            <ButtonLink to="/team" variant="secondary">Вся команда</ButtonLink>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.slice(0, 3).map((m) => (
              <TeamCard key={m.slug} member={m} />
            ))}
          </div>
        </Container>
      </section>

      {news.length > 0 && (
        <section className="bg-white py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Новости" title="Что нового" />
              <ButtonLink to="/news" variant="secondary">Все новости</ButtonLink>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {news.map((post) => (
                <NewsCard key={post.slug} post={post} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-20">
        <Container>
          <div className="rounded-3xl bg-brand-600 px-8 py-14 text-center text-white sm:px-16">
            <h2 className="text-3xl font-bold sm:text-4xl">{ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">{ctaText}</p>
            <Button size="lg" variant="accent" className="mt-8" onClick={() => open()}>
              Оставить заявку
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
