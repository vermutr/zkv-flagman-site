import { Link, useParams } from 'react-router'
import Markdown from 'react-markdown'
import { ArrowLeft } from 'lucide-react'
import { Container } from '../components/Container'
import { getPost } from '../lib/news'
import { formatDate } from '../lib/format'
import NotFoundPage from './NotFoundPage'

export default function NewsArticlePage() {
  const { slug = '' } = useParams()
  const post = getPost(slug)
  if (!post) return <NotFoundPage />

  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <Link to="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft size={16} /> Все новости
      </Link>
      <time dateTime={post.date} className="mt-8 block text-xs font-medium uppercase tracking-wider text-stone-500">
        {formatDate(post.date)}
      </time>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{post.title}</h1>
      <p className="mt-4 text-lg text-stone-600">{post.excerpt}</p>
      {post.cover && <img src={post.cover} alt="" className="mt-8 w-full rounded-3xl object-cover" />}
      <div className="article mt-10">
        <Markdown>{post.body}</Markdown>
      </div>
    </Container>
  )
}
