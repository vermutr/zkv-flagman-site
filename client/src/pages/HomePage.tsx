import { ArrowRight } from 'lucide-react'
import { Container } from '../components/Container'
import { Button, ButtonLink } from '../components/Button'
import { SectionHeading } from '../components/SectionHeading'
import { PackageCard } from '../components/PackageCard'
import { TeamCard } from '../components/TeamCard'
import { NewsCard } from '../components/NewsCard'
import { Reveal } from '../components/Reveal'
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
        {/* Золотое свечение и тонкие линии — отсылка к логотипу, без цветных пятен. */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-gold-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold-500/70 to-transparent" />
        <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-gold-300">
              <span aria-hidden="true" className="h-px w-8 bg-gold-400" />
              Бухгалтерские услуги в Гродно
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {company.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-100">{heroSubtitle}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" variant="gold" onClick={() => open()}>
                Заказать услугу
              </Button>
              <ButtonLink to="/services" size="lg" variant="secondary">
                Смотреть тарифы
              </ButtonLink>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map(({ value, label }, i) => (
              <Reveal key={label} delay={i * 90}>
                <div className="flex flex-col-reverse rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition-[box-shadow,background-color] duration-300 hover:bg-white/10 hover:ring-gold-500/60">
                  <dt className="mt-1 text-sm text-brand-100">{label}</dt>
                  <dd className="text-3xl font-extrabold tabular-nums text-gold-300">{value}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Почему мы" title="Бухгалтерия без сюрпризов" subtitle="Четыре принципа, на которых держится наша работа с каждым клиентом." />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="group h-full rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200/80 transition-[box-shadow,--tw-ring-color] duration-300 hover:shadow-card-hover hover:ring-gold-500">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-100 text-gold-800 transition-[background-color,color,transform] duration-300 group-hover:bg-gold-400 group-hover:text-brand-900 group-hover:scale-105">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-bold text-brand-900">{title}</h3>
                  <p className="mt-2 text-sm text-stone-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Тарифы" title="Выберите формат обслуживания" subtitle="Фиксированная цена в месяц. Отдельные услуги можно добавить к любому тарифу." align="center" />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {packages.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90} className="h-full">
                <PackageCard pkg={p} onOrder={open} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink to="/services?tab=services" variant="ghost" className="group">
              Все отдельные услуги и цены
              <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Команда" title="Кто будет вести ваш учёт" />
              <ButtonLink to="/team" variant="secondary">Вся команда</ButtonLink>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.slice(0, 3).map((m, i) => (
              <Reveal key={m.slug} delay={i * 90} className="h-full">
                <TeamCard member={m} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {news.length > 0 && (
        <section className="bg-white py-20">
          <Container>
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="Новости" title="Что нового" />
                <ButtonLink to="/news" variant="secondary">Все новости</ButtonLink>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {news.map((post, i) => (
                <Reveal key={post.slug} delay={i * 90} className="h-full">
                  <NewsCard post={post} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-20">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-8 py-14 text-center text-white sm:px-16">
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl font-bold sm:text-4xl">{ctaTitle}</h2>
                <p className="mx-auto mt-4 max-w-xl text-brand-100">{ctaText}</p>
                <Button size="lg" variant="gold" className="mt-8" onClick={() => open()}>
                  Оставить заявку
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
