export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60)     return 'Just now'
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const CAT_COLOR: Record<string, string> = {
  launch: '#c0392b', review: '#1a5276', comparison: '#6c3483',
  update: '#d35400', guide: '#1e8449'
}
export const CAT_LABEL: Record<string, string> = {
  launch: '🚀 Launch', review: '📝 Review', comparison: '⚔️ VS',
  update: '🔄 Update', guide: '🛒 Guide'
}
export const BRANDS = ['Samsung','Apple','OnePlus','Realme','Google','Xiaomi','Vivo','Oppo','Poco','Nothing']

export function brandFallbackImg(brand: string): string {
  const map: Record<string, string> = {
    samsung: '1610945264803-c22b62d2a7b3', apple: '1512941937669-90a1b58e7e9c',
    google: '1598327105666-5b89351aff97', oneplus: '1574944985070-8f3ebc6b79d2',
    realme: '1556656793-08538906a9f8', xiaomi: '1607252650355-f7fd0460ccdb',
    vivo: '1611532736597-de2d4265fba3', oppo: '1538971042754-64c48f71edb9',
    poco: '1580910051074-3eb694886505', nothing: '1560472354-b33ff0c44a43'
  }
  const key = brand.toLowerCase()
  for (const [k, v] of Object.entries(map))
    if (key.includes(k)) return `https://images.unsplash.com/photo-${v}?w=800&h=450&fit=crop`
  return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=450&fit=crop'
}

export function parseContent(text: string) {
  if (!text) return { intro: '', bullets: [] as string[], full: '<p>No content available.</p>' }
  const blocks = text.split(/\n\n+/).map(b => b.trim()).filter(Boolean)
  let intro = '', bodyStart = 0
  for (let i = 0; i < blocks.length; i++) {
    if (!blocks[i].startsWith('#')) { intro = blocks[i]; bodyStart = i + 1; break }
  }
  const bullets = blocks.filter(b => b.startsWith('## ') || b.startsWith('# ')).map(b => b.replace(/^#+\s*/, ''))
  const full = blocks.map(b => {
    if (b.startsWith('## ') || b.startsWith('# ')) return `<h2 class="text-2xl font-bold mt-8 mb-3 text-gray-900">${b.replace(/^#+\s*/, '')}</h2>`
    const lines = b.split('\n')
    if (lines.length > 1 && lines.every(l => /^[-*]\s/.test(l.trim())))
      return `<ul class="list-disc pl-6 mb-4 space-y-1">${lines.map(l => `<li class="text-gray-700">${l.replace(/^[-*]\s*/, '')}</li>`).join('')}</ul>`
    return `<p class="mb-4 text-gray-700 leading-relaxed">${b}</p>`
  }).join('\n')
  return { intro, bullets, full }
}
