import { NextRequest, NextResponse } from 'next/server'
import { getArticles, saveArticle, deleteArticle } from '@/lib/articles'

function checkAdmin(req: NextRequest) {
  const auth = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key')
  return auth === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams
  try {
    const articles = await getArticles({
      category: s.get('category') || undefined,
      brand:    s.get('brand')    || undefined,
      limit:    parseInt(s.get('limit') || '12'),
      offset:   parseInt(s.get('offset') || '0'),
    })
    return NextResponse.json({ articles })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const saved = await saveArticle(body)
    return NextResponse.json({ article: saved })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  try {
    await deleteArticle(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
