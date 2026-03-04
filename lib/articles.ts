import { supabase, supabaseAdmin, Article } from './supabase'

export async function getArticles(opts: {
  category?: string, brand?: string,
  limit?: number, offset?: number
} = {}): Promise<Article[]> {
  let q = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(opts.limit || 12)
    .range(opts.offset || 0, (opts.offset || 0) + (opts.limit || 12) - 1)

  if (opts.category && opts.category !== 'all')
    q = q.eq('category', opts.category)
  if (opts.brand)
    q = q.ilike('brand', `%${opts.brand}%`)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data || []
}

export async function getArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles').select('*').eq('id', id).single()
  if (error) return null
  // Increment views (fire and forget)
  supabaseAdmin.from('articles')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', id).then(() => {})
  return data
}

export async function getSimilar(id: string, category: string, limit = 4): Promise<Article[]> {
  const { data } = await supabase
    .from('articles').select('*')
    .eq('category', category).neq('id', id)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getTrending(limit = 8): Promise<Article[]> {
  const { data } = await supabase
    .from('articles').select('*')
    .order('views', { ascending: false })
    .limit(limit)
  return data || []
}

export async function saveArticle(art: Partial<Article>) {
  const id = art.id || `art_${Date.now().toString(36)}`
  const row = {
    id,
    title:       art.title || '',
    content:     art.content || '',
    excerpt:     art.excerpt || (art.content || '').slice(0, 220),
    category:    art.category || 'launch',
    brand:       art.brand || 'The Tech Bharat',
    img_url:     art.img_url || '',
    rating:      art.rating || null,
    published_at: art.published_at || new Date().toISOString(),
    source_url:  art.source_url || '',
    dedup_key:   (art.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80),
    views:       0,
    featured:    false,
  }
  const { data, error } = await supabaseAdmin
    .from('articles')
    .upsert(row, { onConflict: 'dedup_key', ignoreDuplicates: true })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteArticle(id: string) {
  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
