import { NextRequest, NextResponse } from 'next/server'
import { fetchAndRewrite } from '@/lib/ai'
import { saveArticle } from '@/lib/articles'

// Called by UptimeRobot every 6 hours via HTTP monitor
// URL: https://yoursite.com/api/cron?secret=YOUR_CRON_SECRET

const QUERIES = [
  { query: 'Samsung Galaxy India launch 2026', category: 'launch', brand: 'Samsung' },
  { query: 'Apple iPhone India price 2026',    category: 'launch', brand: 'Apple' },
  { query: 'OnePlus India smartphone launch',  category: 'launch', brand: 'OnePlus' },
  { query: 'Realme India new phone 2026',      category: 'launch', brand: 'Realme' },
  { query: 'Android update India phones',      category: 'update', brand: '' },
  { query: 'best 5G phone under 20000 India',  category: 'guide',  brand: '' },
]

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const log: string[] = []
  const hour = new Date().getHours()
  // Pick query based on hour to spread load
  const querySet = QUERIES.slice(hour % 2 === 0 ? 0 : 3, (hour % 2 === 0 ? 0 : 3) + 3)

  let totalSaved = 0
  for (const q of querySet) {
    try {
      log.push(`Fetching: ${q.query}`)
      const items = await fetchAndRewrite(q.query, q.category, q.brand)
      for (const item of items) {
        try {
          const saved = await saveArticle({ ...item, category: q.category })
          if (saved) { totalSaved++; log.push(`  ✅ Published: ${saved.title?.slice(0, 60)}`) }
          else log.push('  ⏭️ Duplicate, skipped')
        } catch (e: any) { log.push(`  ❌ Save error: ${e.message}`) }
      }
    } catch (e: any) {
      log.push(`❌ Fetch error for "${q.query}": ${e.message}`)
    }
  }

  log.push(`\nTotal published: ${totalSaved}`)
  return NextResponse.json({ ok: true, totalSaved, log, timestamp: new Date().toISOString() })
}
