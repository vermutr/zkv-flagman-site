import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { NewsCard } from '../components/NewsCard'
import { loadNews } from '../lib/news'

export default function NewsPage() {
  const posts = loadNews()
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading eyebrow="Новости" title="Новости компании и изменения в законодательстве" subtitle="Коротко о том, что важно знать нашим клиентам." />
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <NewsCard key={post.slug} post={post} />
        ))}
      </div>
    </Container>
  )
}
