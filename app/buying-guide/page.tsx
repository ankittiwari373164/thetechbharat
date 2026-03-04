import { Suspense } from 'react'
import Link from 'next/link'
import { getArticles } from '@/lib/articles'
import ArticleCard from '@/components/ArticleCard'
import { BRANDS, CAT_COLOR } from '@/lib/utils'

export const revalidate = 300
export const metadata = { title: 'Buying Guide', description: 'Best phones to buy in India at every budget' }

const cat = 'guide'

export default async function Page({ searchParams }: { searchParams: { brand?: string, page?: string } }) {
  const brand  = searchParams.brand || ''
  const page   = parseInt(searchParams.page || '1')
  const limit  = 12
  const offset = (page - 1) * limit

  let articles: any[] = []
  try { articles = await getArticles({ category: cat === 'all' ? undefined : cat, brand: brand || undefined, limit, offset }) } catch {}

  return (
    <div>
      {/* Hero */}
      <div className="bg-red-700 text-white py-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-black mb-2">🛒 Buying Guide</h1>
          <p className="text-red-200">Best phones to buy in India at every budget</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Brand filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
          <Link href={`/buying-guide`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${!brand ? 'bg-red-700 text-white border-red-700' : 'border-gray-200 text-gray-700 hover:border-red-300'}`}>
            All Brands
          </Link>
          {BRANDS.map(b => (
            <Link key={b} href={`?brand=${b}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${brand === b ? 'bg-red-700 text-white border-red-700' : 'border-gray-200 text-gray-700 hover:border-red-300'}`}>
              {b}
            </Link>
          ))}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl font-semibold">No articles found</p>
            <p className="mt-2">Try a different brand filter</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">Showing {articles.length} articles{brand ? ` for ${brand}` : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
            {articles.length === limit && (
              <div className="text-center mt-10">
                <Link href={`?${brand ? `brand=${brand}&` : ''}page=${page + 1}`}
                  className="inline-block bg-red-700 text-white px-8 py-3 rounded-full font-bold hover:bg-red-800 transition-colors">
                  Load More
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
