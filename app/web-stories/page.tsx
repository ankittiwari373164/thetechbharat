import Link from 'next/link'
import Image from 'next/image'
import { getArticles } from '@/lib/articles'
import { timeAgo, CAT_COLOR, CAT_LABEL, brandFallbackImg } from '@/lib/utils'

export const metadata = { title: 'Web Stories', description: 'Swipe through the latest smartphone news' }
export const revalidate = 600

export default async function WebStories() {
  let articles: any[] = []
  try { articles = await getArticles({ limit: 24 }) } catch (_e) {}

  return (
    <div>
      <div className="bg-red-700 text-white py-12 text-center px-4">
        <h1 className="text-4xl font-black mb-2">⚡ Web Stories</h1>
        <p className="text-red-200">Swipe through the latest smartphone news — made for India.</p>
      </div>
      <div className="container mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No stories yet. Add articles to see them here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {articles.map(a => {
              const img = a.img_url || brandFallbackImg(a.brand)
              const color = CAT_COLOR[a.category] || '#555'
              return (
                <Link key={a.id} href={`/article/${a.id}`}
                  className="group relative rounded-2xl overflow-hidden bg-gray-900 hover:scale-105 transition-transform duration-300 cursor-pointer"
                  style={{ aspectRatio: '9/16' }}>
                  <Image src={img} alt={a.title} fill className="object-cover opacity-80 group-hover:opacity-90 transition-opacity"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"/>
                  <div className="absolute inset-0 ring-3 ring-red-500 ring-inset rounded-2xl opacity-80"/>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1" style={{background: color, fontSize:'10px'}}>
                      {CAT_LABEL[a.category] || a.category}
                    </span>
                    <p className="text-white text-xs font-bold leading-tight line-clamp-3">{a.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{timeAgo(a.published_at)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}