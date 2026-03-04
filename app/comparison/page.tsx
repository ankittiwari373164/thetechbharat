import Link from 'next/link'
import { getArticles } from '@/lib/articles'
import ArticleCard from '@/components/ArticleCard'
import { BRANDS } from '@/lib/utils'

export const revalidate = 300
export const metadata = { title: 'VS Comparisons', description: 'Head-to-head phone comparisons with Indian pricing' }

export default async function Page({ searchParams }: { searchParams: { brand?: string, page?: string } }) {
  const brand  = searchParams.brand || ''
  const page   = parseInt(searchParams.page || '1')
  const limit  = 12
  const offset = (page - 1) * limit

  let articles: any[] = []
  try {
    articles = await getArticles({
      category: 'comparison',
      brand: brand || undefined,
      limit,
      offset,
    })
  } catch (e) {
    articles = []
  }

  return (
    <div>
      <div className="bg-red-700 text-white py-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-black mb-2">⚔️ VS Comparisons</h1>
          <p className="text-red-200">Head-to-head phone comparisons with Indian pricing</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
          <Link href="/comparison"
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${!brand ? 'bg-red-700 text-white border-red-700' : 'border-gray-200 text-gray-700 hover:border-red-300'}`}>
            All Brands
          </Link>
          {BRANDS.map(b => (
            <Link key={b} href={`/comparison?brand=${b}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${brand === b ? 'bg-red-700 text-white border-red-700' : 'border-gray-200 text-gray-700 hover:border-red-300'}`}>
              {b}
            </Link>
          ))}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl font-semibold">No articles found</p>
            <p className="mt-2">{brand ? `No ${brand} articles yet` : 'No articles yet — check back soon!'}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              Showing {articles.length} article{articles.length !== 1 ? 's' : ''}{brand ? ` for ${brand}` : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
            {articles.length === limit && (
              <div className="text-center mt-10">
                <Link
                  href={`/comparison?${brand ? `brand=${brand}&` : ''}page=${page + 1}`}
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