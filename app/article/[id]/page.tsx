import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getArticle, getSimilar, getTrending } from '@/lib/articles'
import ArticleCard from '@/components/ArticleCard'
import { timeAgo, CAT_COLOR, CAT_LABEL, brandFallbackImg, parseContent } from '@/lib/utils'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) return { title: 'Article Not Found' }
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, images: [article.img_url] }
  }
}

export const revalidate = 3600

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  const [similar, trending] = await Promise.all([
    getSimilar(article.id, article.category, 4),
    getTrending(5)
  ])

  const img    = article.img_url || brandFallbackImg(article.brand)
  const color  = CAT_COLOR[article.category] || '#555'
  const label  = CAT_LABEL[article.category] || article.category
  const { intro, bullets, full } = parseContent(article.content)
  const shareUrl = `https://thetechbharat.com/article/${article.id}`

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span>›</span>
            <span className="capitalize">{article.category}</span>
            <span>›</span>
            <span className="text-gray-700 line-clamp-1">{article.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm font-bold text-white px-3 py-1 rounded-full" style={{ background: color }}>{label}</span>
            <span className="text-sm text-gray-500">{article.brand}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{timeAgo(article.published_at)}</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-4">{article.title}</h1>

          {article.rating && (
            <div className="flex items-center gap-3 mb-5 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="text-3xl font-black text-yellow-500">{article.rating}</div>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-xl ${s <= Math.round(article.rating!) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <div className="text-sm text-gray-600 font-medium">Expert Rating</div>
              </div>
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
            <Image src={img} alt={article.title} fill className="object-cover" priority/>
          </div>

          {intro && (
            <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6 border-l-4 border-red-600 pl-4 bg-red-50 py-3 rounded-r-xl">{intro}</p>
          )}

          {bullets.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
              <h3 className="font-black text-blue-900 mb-3">📌 What's in this article</h3>
              <ul className="space-y-2">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-400 font-bold">→</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="prose-article" dangerouslySetInnerHTML={{ __html: full }} />

          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <span className="font-bold text-gray-700">Share:</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`} target="_blank" rel="noopener" className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-green-600">WhatsApp</a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener" className="bg-sky-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-sky-600">Twitter/X</a>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">🔥 Trending Now</h3>
            <div className="space-y-3">
              {trending.map((a, i) => (
                <Link key={a.id} href={`/article/${a.id}`} className="flex gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors group">
                  <span className="text-2xl font-black text-gray-200 w-7 flex-shrink-0">{i+1}</span>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-red-600 line-clamp-2 transition-colors">{a.title}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-gray-100 rounded-2xl flex items-center justify-center h-60 text-sm text-gray-400 border-2 border-dashed border-gray-200">Advertisement</div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">More {label} Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similar.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}
    </div>
  )
}
