export async function fetchAndRewrite(query: string, category = 'launch', brand = '') {
  const newsKey = process.env.NEWS_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  if (!newsKey) throw new Error('NEWS_API_KEY not set')
  if (!groqKey) throw new Error('GROQ_API_KEY not set')

  const newsRes = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${newsKey}`
  )
  if (!newsRes.ok) throw new Error(`NewsAPI error ${newsRes.status}: ${await newsRes.text()}`)
  const newsData = await newsRes.json()
  if (newsData.status === 'error') throw new Error(`NewsAPI: ${newsData.message}`)
  
  const items = (newsData.articles || []).filter((a: any) => a.title && a.title !== '[Removed]').slice(0, 3)
  if (!items.length) throw new Error(`No news found for: "${query}". Try a different search term.`)

  const results = []
  for (const item of items) {
    const raw = item.content || item.description || item.title

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1600,
        temperature: 0.97,
        messages: [
          {
            role: 'system',
            content: `You write for The Tech Bharat. You are a real Indian person who has used smartphones daily for 10 years. You write the way you talk — casual, direct, occasionally annoyed.

Your writing style rules (NON-NEGOTIABLE):
1. NEVER start with the brand name or a formal statement
2. Open with YOUR reaction/opinion: "Okay so...", "Look,", "Right, so", "My friend asked me about this yesterday and honestly..."
3. Mix sentence lengths dramatically. One word sentences. Then ones that go on and on with details and asides and more details.
4. Include at least one India-specific gripe: load shedding affecting charging, heat throttling in Delhi summers, whether it's on Flipkart Big Billion sale
5. Use these naturally: "yaar", "tbh", "ngl", "wait what", "lol", "okay but", "wild", "sus", "fair enough"  
6. Have ONE paragraph where you're genuinely uncertain or mixed: "I go back and forth on this"
7. Specific ₹ prices like "seventy-two grand" or "₹72,999"
8. End with a hot take, not a summary
9. BANNED WORDS: "Furthermore", "Moreover", "In conclusion", "To summarize", "It is worth noting", "Additionally", "Overall", "Delve", "Comprehensive"
10. ## headings must sound human: "## okay the camera situation" not "## Camera System"`
          },
          {
            role: 'user',
            content: `Write a ${category} article about this news for Indian smartphone buyers. 750-900 words. 

Source (use only as reference, rewrite completely in your own voice):
"${item.title}"
${raw ? raw.slice(0, 400) : ''}

Brand: ${brand || 'various'}`
          }
        ]
      })
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq error ${groqRes.status}: ${errText}`)
    }
    const groqData = await groqRes.json()
    const content = groqData.choices?.[0]?.message?.content || ''
    if (!content) continue

    results.push({
      title:      rewriteTitle(item.title, brand, category),
      content,
      excerpt:    extractExcerpt(content),
      category,
      brand:      brand || detectBrand(item.title),
      img_url:    item.urlToImage || '',
      source_url: item.url || '',
    })

    await new Promise(r => setTimeout(r, 600))
  }
  return results
}

export async function generateArticle(topic: string, category: string, brand: string) {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error('GROQ_API_KEY not set')

  const typeMap: Record<string, string> = {
    launch:     'new launch coverage',
    review:     'honest review after weeks of use',
    comparison: 'detailed comparison to help Indians decide',
    update:     'software update coverage',
    guide:      'buying guide for Indian buyers'
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1800,
      temperature: 0.97,
      messages: [
        {
          role: 'system',
          content: `You write for The Tech Bharat as a real Indian person. Casual, honest, opinionated. Mix short punchy sentences with long rambling ones. Use "yaar", "tbh", "ngl", "okay but". Include India context. BANNED: "Furthermore", "Moreover", "In conclusion", "To summarize", "Comprehensive", "Delve". Headings must be conversational.`
        },
        {
          role: 'user',
          content: `Write a ${typeMap[category] || 'tech article'} about: "${topic}"
Brand: ${brand || 'various'}
750-950 words. Sound like a real person who tested this phone in Indian conditions.`
        }
      ]
    })
  })

  if (!res.ok) throw new Error(`Groq error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function rewriteTitle(original: string, brand: string, category: string): string {
  const b = brand || detectBrand(original) || 'This Phone'
  const templates: Record<string, string[]> = {
    launch:     [`${b}'s New Phone: Should Indians Care?`, `I Looked at the New ${b}. Mixed Feelings.`, `${b} Just Announced Something. Here's the Honest Take.`],
    review:     [`${b} After 3 Weeks: The Good and the Annoying`, `Honest ${b} Review for Indian Buyers`, `I Used the ${b} Daily. Here's What I Actually Think.`],
    comparison: [`${b} vs The Competition: Which One Should You Buy?`, `Don't Spend ₹50k Until You Read This`],
    update:     [`${b} Just Pushed an Update. Does It Fix Things?`, `New ${b} Update — What Actually Changed`],
    guide:      [`Best Phones Right Now in India (No Fluff)`, `The Only Buying Guide You Need This Month`],
  }
  const list = templates[category] || templates['launch']
  return list[Math.floor(Math.random() * list.length)]
}

function extractExcerpt(content: string): string {
  const paras = content.split('\n\n').filter(p => p.trim() && !p.trim().startsWith('#'))
  return (paras[0] || content).replace(/^#+\s*/, '').slice(0, 220).trim()
}

function detectBrand(text: string): string {
  const brands = ['Samsung','Apple','OnePlus','Realme','Google','Xiaomi','Redmi','Vivo','Oppo','Poco','Nothing','Motorola']
  const lower = (text || '').toLowerCase()
  return brands.find(b => lower.includes(b.toLowerCase())) || 'The Tech Bharat'
}