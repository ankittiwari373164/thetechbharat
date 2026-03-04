import { NextRequest, NextResponse } from 'next/server'
import { fetchAndRewrite } from '@/lib/ai'
import { saveArticle } from '@/lib/articles'

const QUERIES = [
  { query: 'Samsung Galaxy India 2026',       category: 'launch',  brand: 'Samsung'  },
  { query: 'OnePlus India smartphone launch', category: 'launch',  brand: 'OnePlus'  },
  { query: 'Realme India new phone',          category: 'launch',  brand: 'Realme'   },
  { query: 'Apple iPhone India',              category: 'launch',  brand: 'Apple'    },
  { query: 'best 5G phone India under 20000', category: 'guide',   brand: ''         },
  { query: 'Android update India 2026',       category: 'update',  brand: ''         },
  { query: 'Google Pixel India review',       category: 'review',  brand: 'Google'   },
  { query: 'Xiaomi Redmi India launch',       category: 'launch',  brand: 'Xiaomi'   },
]

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET || 'ttb_cron_2026'

  if (secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const log: string[] = []
  const timestamp = new Date().toISOString()
  log.push(`Cron started at ${timestamp}`)

  // Pick 2 queries per run based on hour to rotate coverage
  const hour = new Date().getHours()
  const idx = (hour % 4) * 2
  const batch = QUERIES.slice(idx, idx + 2)

  let totalSaved = 0
  for (const q of batch) {
    log.push(`\nFetching: "${q.query}"`)
    try {
      const items = await fetchAndRewrite(q.query, q.category, q.brand)
      log.push(`  Got ${items.length} articles from NewsAPI`)

      for (const item of items) {
        try {
          const saved = await saveArticle({ ...item, category: q.category })
          if (saved) {
            totalSaved++
            log.push(`  ✅ Published: "${saved.title?.slice(0, 60)}"`)
          }
        } catch (e: any) {
          log.push(`  ❌ Save error: ${e.message}`)
        }
      }
    } catch (e: any) {
      log.push(`  ❌ Fetch error: ${e.message}`)
    }
  }

  log.push(`\nDone. Total published: ${totalSaved}`)
  return NextResponse.json({ ok: true, totalSaved, log, timestamp })
}