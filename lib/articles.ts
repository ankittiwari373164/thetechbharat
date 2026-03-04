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

  if (opts.offset && opts.offset > 0) {
    q = q.range(opts.offset, opts.offset + (opts.limit || 12) - 1)
  }
  if (opts.category) q = q.eq('category', opts.category)
  if (opts.brand)    q = q.ilike('brand', `%${opts.brand}%`)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data || []
}

export async function getArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles').select('*').eq('id', id).single()
  if (error) return null
  // increment views fire-and-forget
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
    .order('published_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function saveArticle(art: Partial<Article> & { dedup_key?: string }) {
  const id = art.id || `art_${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`
  
  // Use provided dedup_key (from AI fetch) or generate from title+timestamp
  const dedupKey = art.dedup_key || 
    `${(art.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}-${Date.now().toString(36)}`

  const row = {
    id,
    title:        String(art.title   || '').trim(),
    content:      String(art.content || ''),
    excerpt:      String(art.excerpt || art.content || '').replace(/^#+\s*/,'').slice(0, 220),
    category:     art.category     || 'launch',
    brand:        art.brand        || 'The Tech Bharat',
    img_url:      art.img_url      || '',
    rating:       art.rating       ? parseFloat(String(art.rating)) : null,
    published_at: art.published_at || new Date().toISOString(),
    source_url:   art.source_url   || '',
    dedup_key:    dedupKey,
    views:        0,
    featured:     false,
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert(row)
    .select()
    .single()

  if (error) {
    // If duplicate, try with a different key
    if (error.code === '23505') {
      const retryRow = { ...row, dedup_key: `${dedupKey}-${Math.random().toString(36).slice(2,6)}`, id: `art_${Date.now().toString(36)}` }
      const retry = await supabaseAdmin.from('articles').insert(retryRow).select().single()
      if (retry.error) throw new Error(retry.error.message)
      return retry.data
    }
    throw new Error(error.message)
  }
  return data
}

export async function deleteArticle(id: string) {
  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}