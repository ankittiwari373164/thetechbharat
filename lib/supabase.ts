import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const svc  = process.env.SUPABASE_SERVICE_KEY || anon

export const supabase      = createClient(url, anon)
export const supabaseAdmin = createClient(url, svc)

export type Article = {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  brand: string
  img_url: string
  rating: number | null
  published_at: string
  views: number
  featured: boolean
  source_url: string
  dedup_key: string
}
