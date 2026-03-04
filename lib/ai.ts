// AI utilities — Groq for rewriting, NewsAPI for fetching

export async function fetchAndRewrite(query: string, category = 'launch', brand = '') {
  const newsKey = process.env.NEWS_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  if (!newsKey) throw new Error('NEWS_API_KEY not set in environment')
  if (!groqKey) throw new Error('GROQ_API_KEY not set in environment')

  // 1. Fetch from NewsAPI
  const newsRes = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${newsKey}`
  )
  if (!newsRes.ok) throw new Error(`NewsAPI error ${newsRes.status}`)
  const newsData = await newsRes.json()
  const items = (newsData.articles || []).slice(0, 3)
  if (!items.length) throw new Error(`No news found for: "${query}"`)

  const results = []
  for (const item of items) {
    const raw = item.content || item.description || item.title
    // 2. Rewrite with Groq
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1400,
        temperature: 0.88,
        messages: [
          {
            role: 'system',
            content: `You are a senior tech journalist at The Tech Bharat, India's top smartphone news site.
Rewrite the given article COMPLETELY for Indian audience. Rules:
- Change ALL sentences, paragraph structure, and flow
- Add India-specific context, ₹ pricing, Indian user perspective  
- Sound human: opinions, contractions ("it's", "you'll"), varied sentence length
- Use ## subheadings, short paragraphs
- 700-900 words
- NEVER copy original sentences
- Start directly with news, no meta-commentary`
          },
          {
            role: 'user',
            content: `Category: ${category}\nBrand: ${brand || 'various'}\nTitle: ${item.title}\nContent: ${raw}`
          }
        ]
      })
    })
    if (!groqRes.ok) continue
    const groqData = await groqRes.json()
    const content = groqData.choices?.[0]?.message?.content || ''
    results.push({
      title:      item.title,
      content,
      excerpt:    content.split('\n\n')[0]?.replace(/^#+\s*/, '').slice(0, 220) || '',
      category,
      brand:      brand || detectBrand(item.title),
      img_url:    item.urlToImage || '',
      source_url: item.url || '',
    })
  }
  return results
}

export async function generateArticle(topic: string, category: string, brand: string) {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error('GROQ_API_KEY not set in environment')

  const typeMap: Record<string, string> = {
    launch: 'product launch news article',
    review: 'smartphone review (long-term)',
    comparison: 'phone vs phone comparison',
    update: 'software/firmware update news',
    guide: 'buying guide for Indian consumers'
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1600,
      temperature: 0.82,
      messages: [
        {
          role: 'system',
          content: `You are a tech journalist at The Tech Bharat. Write naturally for Indian readers.
Use ## for H2 subheadings. Use ₹ for prices. Sound human: opinions, contractions, varied sentences.
700-1000 words. Start directly with the article.`
        },
        {
          role: 'user',
          content: `Write a ${typeMap[category] || 'tech article'} about: "${topic}"\nBrand: ${brand || 'various'}`
        }
      ]
    })
  })
  if (!res.ok) throw new Error(`Groq error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function detectBrand(text: string): string {
  const brands = ['Samsung','Apple','OnePlus','Realme','Google','Xiaomi','Redmi','Vivo','Oppo','Poco','Nothing','Motorola']
  const lower  = text.toLowerCase()
  return brands.find(b => lower.includes(b.toLowerCase())) || 'The Tech Bharat'
}
