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
  const id = `art_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  const row = {
    id,
    title:        String(art.title || '').trim(),
    content:      String(art.content || ''),
    excerpt:      String(art.excerpt || art.content || '').replace(/^#+\s*/, '').slice(0, 220),
    category:     art.category     || 'launch',
    brand:        art.brand        || 'The Tech Bharat',
    img_url:      art.img_url      || '',
    rating:       art.rating       ? parseFloat(String(art.rating)) : null,
    published_at: art.published_at || new Date().toISOString(),
    source_url:   art.source_url   || '',
    dedup_key:    `${id}-${Date.now()}`,
    views:        0,
    featured:     false,
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert(row)
    .select()
    .single()

  if (error) throw new Error(`DB insert failed: ${error.message} [code: ${error.code}]`)
  return data
}

export async function deleteArticle(id: string) {
  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}