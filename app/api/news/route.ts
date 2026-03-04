import { NextRequest, NextResponse } from 'next/server'
import { fetchAndRewrite, generateArticle } from '@/lib/ai'
import { saveArticle } from '@/lib/articles'

function checkAdmin(req: NextRequest) {
  const adminPw = process.env.ADMIN_PASSWORD || 'TechBharat@2026'
  const auth = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key') || ''
  return auth === adminPw
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized — wrong admin password' }, { status: 401 })
  }

  const body = await req.json()
  const { action, query, topic, category, brand } = body

  if (action === 'generate') {
    try {
      const content = await generateArticle(topic, category, brand)
      return NextResponse.json({ content })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (action === 'fetch_and_publish') {
    try {
      const items = await fetchAndRewrite(query, category, brand)
      const saved = []
      for (const item of items) {
        try {
          const s = await saveArticle({ ...item, category })
          if (s) saved.push(s)
        } catch (_e) {}
      }
      return NextResponse.json({ saved, count: saved.length })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}