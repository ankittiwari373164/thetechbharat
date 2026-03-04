export async function fetchAndRewrite(query: string, category = 'launch', brand = '') {
  const newsKey = process.env.NEWS_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  if (!newsKey) throw new Error('NEWS_API_KEY not set')
  if (!groqKey) throw new Error('GROQ_API_KEY not set')

  const newsRes = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=6&apiKey=${newsKey}`
  )
  if (!newsRes.ok) throw new Error(`NewsAPI error ${newsRes.status}`)
  const newsData = await newsRes.json()
  if (newsData.status === 'error') throw new Error(`NewsAPI: ${newsData.message}`)

  const items = (newsData.articles || [])
    .filter((a: any) => a.title && a.title !== '[Removed]' && a.description)
    .slice(0, 3)
  if (!items.length) throw new Error(`No news found for: "${query}"`)

  const results = []
  for (const item of items) {
    const raw = [item.title, item.description, item.content].filter(Boolean).join('\n')

    const content = await rewriteWithGroq(raw, category, brand, groqKey)
    if (!content) continue

    results.push({
      title:      generateTitle(item.title, brand, category),
      content,
      excerpt:    firstRealParagraph(content),
      category,
      brand:      brand || guessBrand(item.title + ' ' + (item.description || '')),
      img_url:    item.urlToImage || '',
      source_url: item.url || '',
    })

    await sleep(700)
  }
  return results
}

export async function generateArticle(topic: string, category: string, brand: string) {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error('GROQ_API_KEY not set')
  return await writeFromScratch(topic, category, brand, groqKey)
}

async function rewriteWithGroq(source: string, category: string, brand: string, key: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1800,
      temperature: 0.98,
      messages: [
        { role: 'system', content: humanWriterSystem() },
        {
          role: 'user',
          content: `Write a ${category} article for Indian readers. Base it on this source info but write it completely fresh in your own voice. Do NOT summarize or paraphrase — tell the story like you're explaining it to your friend who asked you about this phone.

Source info:
${source.slice(0, 600)}

Brand: ${brand || 'detect from source'}
Length: 850-1000 words`
        }
      ]
    })
  })
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)
  const d = await res.json()
  return d.choices?.[0]?.message?.content || ''
}

async function writeFromScratch(topic: string, category: string, brand: string, key: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1900,
      temperature: 0.98,
      messages: [
        { role: 'system', content: humanWriterSystem() },
        {
          role: 'user',
          content: `Write a ${category} article about: "${topic}"
Brand: ${brand || 'various'}
Length: 850-1000 words
Write it as if you've actually used or tested this product. Be specific. Be opinionated. Talk to Indian buyers directly.`
        }
      ]
    })
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const d = await res.json()
  return d.choices?.[0]?.message?.content || ''
}

function humanWriterSystem(): string {
  return `You are Rahul, a 28-year-old Indian tech enthusiast who writes for The Tech Bharat. You grew up in Pune, now live in Bangalore. You've been reviewing phones since 2016. You're not a professional journalist — you're just a guy who really loves phones and hates when companies rip people off.

HOW YOU WRITE:
- You ramble a bit. Your thoughts aren't perfectly organized. Sometimes you go on a tangent about something related and bring it back.
- You mix Hindi-English naturally: "yaar", "sahi mein", "dekho", "matlab", "thoda" — but don't overdo it
- You get genuinely excited about good things ("okay wait, the night mode shots are actually stunning")
- You get genuinely annoyed by bad things ("1 lakh ke phone mein no charger in box? seriously Samsung?")
- You make specific real comparisons to other Indian-priced phones ("you can get a OnePlus 12R for the same price and it's just as fast")
- You remember that most Indians use their phone in 40°C heat, on long train journeys, and during power cuts
- You use specific numbers: ₹72,999 not "around 70k", 4500mAh not "large battery"
- Your sentences vary wildly. Short. Then a longer one that has a lot of detail packed in because you want to make a point thoroughly. One word sometimes. Then back to normal.
- You NEVER write formal transitions like "Furthermore", "Moreover", "In addition", "To summarize", "In conclusion", "It is worth noting", "Overall"
- You NEVER start a new topic paragraph with the phone name
- Your ## headings are natural: "## the camera, though" or "## okay but does it get hot?" NOT "## Camera Performance Analysis"
- You include at least ONE moment of genuine uncertainty: "I go back and forth on this one"
- You end with your actual recommendation, not a summary
- Your opening line is NEVER a formal statement. It's a reaction, a question you were asked, something that happened.`
}

function generateTitle(original: string, brand: string, category: string): string {
  // Keep close to original but make it sound like a real person wrote it
  const b = brand || guessBrand(original)
  const clean = original.replace(/[^\w\s₹]/g, '').trim().slice(0, 80)

  // Don't use templates - derive from actual content
  if (category === 'review') return `${b} Review: I Used It for 3 Weeks. Here's What I Think.`
  if (category === 'comparison') return `${b} vs The Rest: Which One Should You Actually Buy?`
  if (category === 'guide') return `Best Phones to Buy in India Right Now — My Honest Take`
  if (category === 'update') return `${b} Update Is Out — Does It Actually Fix Things?`
  // For launch - use the actual story
  return clean.length > 20 ? clean : `${b}: What You Need to Know Before Spending Your Money`
}

function firstRealParagraph(content: string): string {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  const first = lines[0] || content
  return first.slice(0, 230)
}

function guessBrand(text: string): string {
  const brands = ['Samsung','Apple','OnePlus','Realme','Google','Xiaomi','Redmi','Vivo','Oppo','Poco','Nothing','Motorola','iQOO']
  const lower = (text || '').toLowerCase()
  return brands.find(b => lower.includes(b.toLowerCase())) || 'The Tech Bharat'
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}