import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const adminPw = process.env.ADMIN_PASSWORD || 'TechBharat@2026'
  if (password === adminPw) {
    return NextResponse.json({ ok: true, key: password })
  }
  return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
}