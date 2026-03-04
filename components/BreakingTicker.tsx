import Link from 'next/link'
import { getTrending } from '@/lib/articles'

export default async function BreakingTicker() {
  let articles: any[] = []
  try { articles = await getTrending(12) } catch {}

  if (!articles.length) return null

  const items = [...articles, ...articles] // double for seamless loop

  return (
    <div className="bg-red-700 text-white py-2 overflow-hidden">
      <div className="flex items-center">
        <span className="bg-black/30 text-xs font-black uppercase tracking-widest px-4 py-1 flex-shrink-0 mr-4">🔥 Breaking</span>
        <div className="ticker-wrap flex-1 overflow-hidden">
          <div className="ticker-inner">
            {items.map((a, i) => (
              <span key={i} className="mr-8 inline-flex items-center gap-2 text-sm">
                <span className="text-red-300">◆</span>
                <Link href={`/article/${a.id}`} className="hover:underline whitespace-nowrap">{a.title}</Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
