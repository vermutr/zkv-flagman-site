import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { NewsPost } from '../lib/news'
import { formatDate } from '../lib/format'

export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      {post.cover && <img src={post.cover} alt="" className="mb-4 h-40 w-full rounded-2xl object-cover" />}
      <time dateTime={post.date} className="text-xs font-medium uppercase tracking-wider text-stone-500">
        {formatDate(post.date)}
      </time>
      <h3 className="mt-2 text-lg font-bold text-brand-900">
        <Link to={`/news/${post.slug}`} className="hover:text-brand-600">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm text-stone-700">{post.excerpt}</p>
      <Link
        to={`/news/${post.slug}`}
        aria-label={`Читать: ${post.title}`}
        className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        Читать <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  )
}
