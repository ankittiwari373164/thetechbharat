import { Suspense } from 'react'
import Link from 'next/link'
import { getArticles, getTrending } from '@/lib/articles'
import ArticleCard from '@/components/ArticleCard'
import BreakingTicker from '@/components/BreakingTicker'
import { CAT_COLOR, CAT_LABEL } from '@/lib/utils'

export const revalidate = 300 // revalidate every 5 minutes

export default async function Home() {
  let articles: any[] = []
  let trending: any[] = []
  try {
    [articles, trending] = await Promise.all([
      getArticles({ limit: 20 }),
      getTrending(6)
    ])
  } catch (e: any) {
    console.error('Home fetch error:', e.message)
  }

  const hero = articles[0]
  const secondary = articles.slice(1, 4)
  const grid = articles.slice(4, 13)

  const categories = [
    { key: 'launch', label: '🚀 Launches', href: '/mobile-news' },
    { key: 'review', label: '📝 Reviews', href: '/reviews' },
    { key: 'comparison', label: '⚔️ VS', href: '/comparison' },
    { key: 'update', label: '🔄 Updates', href: '/updates' },
    { key: 'guide', label: '🛒 Guides', href: '/buying-guide' },
  ]

  return (
    <>
      <BreakingTicker />

      {/* Hero */}
      <section className="container mx-auto px-4 py-6">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📱</div>
            <p className="text-xl font-semibold">No articles yet</p>
            <p className="mt-2">Add articles via the <Link href="/admin" className="text-red-600 underline">Admin Panel</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {hero && (
              <div className="lg:col-span-2">
                <ArticleCard article={hero} size="lg" />
              </div>
            )}
            <div className="flex flex-col gap-4">
              {secondary.map(a => <ArticleCard key={a.id} article={a} size="sm" />)}
              <Link href="/mobile-news" className="mt-auto text-center text-sm font-bold text-red-600 hover:text-red-800 py-2 border-2 border-red-600 rounded-xl hover:bg-red-50 transition-colors">
                View All News →
              </Link>
            </div>
          </div>
        )}

        {/* Category quick links */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {categories.map(c => (
            <Link key={c.key} href={c.href}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: CAT_COLOR[c.key] }}>
              {c.label}
            </Link>
          ))}
        </div>

        {/* Main grid */}
        {grid.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900">Latest News</h2>
              <Link href="/mobile-news" className="text-sm font-semibold text-red-600 hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {grid.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </>
        )}

        {/* Trending + Reviews row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900">🔥 Trending</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
              {trending.slice(0, 6).map((a, i) => (
                <Link key={a.id} href={`/article/${a.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  <span className="text-3xl font-black text-gray-200 w-8 text-center leading-none">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block mb-1" style={{ background: CAT_COLOR[a.category] || '#555', fontSize: '10px' }}>
                      {CAT_LABEL[a.category] || a.category}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-red-700 line-clamp-2 transition-colors">{a.title}</h4>
                    <span className="text-xs text-gray-400">{a.brand}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Reviews sidebar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900">Top Rated</h2>
              <Link href="/reviews" className="text-sm font-semibold text-red-600 hover:underline">All →</Link>
            </div>
            <div className="flex flex-col gap-3">
              {articles.filter(a => a.category === 'review' && a.rating).slice(0, 4).map(a => (
                <ArticleCard key={a.id} article={a} size="sm" />
              ))}
              {articles.filter(a => a.category === 'review' && a.rating).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
