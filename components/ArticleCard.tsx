'use client'
import Link from 'next/link'
import { useState } from 'react'
import { timeAgo, CAT_COLOR, CAT_LABEL, brandFallbackImg } from '@/lib/utils'

type Article = {
  id: string; title: string; excerpt: string; category: string;
  brand: string; img_url: string; rating: number | null;
  published_at: string; views: number;
}

function ArticleImage({ src, alt, fallback, className }: { src: string; alt: string; fallback: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src || fallback)
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallback)}
      loading="lazy"
    />
  )
}

export default function ArticleCard({ article: a, size = 'md' }: { article: Article; size?: 'sm' | 'md' | 'lg' }) {
  const fallback = brandFallbackImg(a.brand)
  const img   = a.img_url || fallback
  const color = CAT_COLOR[a.category] || '#555'
  const label = CAT_LABEL[a.category] || a.category

  if (size === 'lg') return (
    <Link href={`/article/${a.id}`} className="group block relative overflow-hidden rounded-2xl bg-gray-900" style={{ height: 480 }}>
      <ArticleImage src={img} alt={a.title} fallback={fallback} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-3" style={{ background: color }}>{label}</span>
        <h2 className="text-2xl font-black text-white leading-tight mb-2 line-clamp-3">{a.title}</h2>
        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{a.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="font-semibold text-gray-200">{a.brand}</span>
          <span>·</span>
          <span>{timeAgo(a.published_at)}</span>
          {a.rating && <><span>·</span><span className="text-yellow-400">★ {a.rating}</span></>}
        </div>
      </div>
    </Link>
  )

  if (size === 'sm') return (
    <Link href={`/article/${a.id}`} className="group flex gap-3 items-start hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors">
      <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <ArticleImage src={img} alt={a.title} fallback={fallback} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-white font-bold px-2 py-0.5 rounded-full inline-block mb-1" style={{ background: color, fontSize: 10 }}>{label}</span>
        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{a.title}</h4>
        <span className="text-xs text-gray-500">{timeAgo(a.published_at)}</span>
      </div>
    </Link>
  )

  return (
    <Link href={`/article/${a.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <ArticleImage src={img} alt={a.title} fallback={fallback} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        <span className="absolute top-3 left-3 text-xs font-bold text-white px-3 py-1 rounded-full" style={{ background: color }}>{label}</span>
      </div>
      <div className="p-4">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{a.brand}</div>
        <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-red-700 transition-colors">{a.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{timeAgo(a.published_at)}</span>
          {a.rating && <span className="text-yellow-500 font-bold">★ {a.rating}</span>}
        </div>
      </div>
    </Link>
  )
}