export async function fetchAndRewrite(query: string, category = 'launch', brand = '') {
  const newsKey = process.env.NEWS_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  if (!newsKey) throw new Error('NEWS_API_KEY not set in environment')
  if (!groqKey) throw new Error('GROQ_API_KEY not set in environment')

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

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1600,
        temperature: 0.95,
        messages: [
          {
            role: 'system',
            content: `You're a real person who reviews smartphones for Indians. You write like you're texting a friend who asked for advice — casual, honest, sometimes a bit sarcastic. You've actually used the phone. You get annoyed by bad battery life and overpricing.

STRICT RULES to avoid AI detection:
- Start mid-thought, never with "Samsung has launched" or formal openers
- Mix short punchy sentences with long rambling ones (like real humans do)
- Use phrases like: "honestly", "look", "here's the thing", "not gonna lie", "let's be real", "fair enough", "which is wild", "somehow", "weirdly", "right?"
- Include ONE small complaint or disappointment even in positive articles
- Add India-specific frustration: heat performance, price in ₹, charging in Indian summers, Flipkart/Amazon availability
- NEVER use: "In conclusion", "Overall", "To summarize", "It is worth noting", "Furthermore", "Moreover"  
- NEVER start paragraphs with the brand name
- Use contractions everywhere: it's, you'll, don't, can't, we're, there's
- Write numbers casually: "sixty grand" not "₹60,000" sometimes
- Include one throwaway joke or complaint about something unrelated (Indian traffic, monsoon, power cuts)
- Vary paragraph length wildly — some 1 sentence, some 5 sentences
- Use ## for section headings but make them conversational like "## Okay but the camera though" not "## Camera"`
          },
          {
            role: 'user',
            content: `Write a ${category} article about this for Indian readers. Make it 700-900 words. Sound like you actually care about whether Indians should spend their money on this.

Source info (use as reference only, completely rewrite):
Title: ${item.title}
Details: ${raw}

Brand context: ${brand || 'various brands'}`
          }
        ]
      })
    })

    if (!groqRes.ok) continue
    const groqData = await groqRes.json()
    const content = groqData.choices?.[0]?.message?.content || ''

    // Generate unique dedup key using timestamp to avoid collision
    const dedupKey = `${(item.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}-${Date.now().toString(36)}`

    results.push({
      title: humanizeTitle(item.title, brand, category),
      content,
      excerpt: extractExcerpt(content),
      category,
      brand: brand || detectBrand(item.title),
      img_url: item.urlToImage || '',
      source_url: item.url || '',
      dedup_key: dedupKey,
    })

    // Small delay between requests
    await new Promise(r => setTimeout(r, 800))
  }
  return results
}

export async function generateArticle(topic: string, category: string, brand: string) {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error('GROQ_API_KEY not set in environment')

  const typeContext: Record<string, string> = {
    launch: 'new phone launch coverage',
    review: 'honest hands-on review after using it for weeks',
    comparison: 'detailed comparison helping Indians decide which to buy',
    update: 'software update coverage with real-world impact',
    guide: 'buying guide for Indians on a budget'
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1800,
      temperature: 0.95,
      messages: [
        {
          role: 'system',
          content: `You're a real person writing for The Tech Bharat. You test phones daily. You're opinionated, sometimes cynical, always honest. You write like a human — messy, real, with opinions.

MUST DO to sound human:
- Open with a take or opinion, never a fact dump
- Short sentences. Then longer ones that go into more detail and kind of trail off a bit.  
- Use "honestly", "look", "here's the thing", "not gonna lie", "weirdly", "somehow"
- ONE section where you're mildly critical (even if overall positive)  
- India context: ₹ prices, summer heat battery drain, Flipkart/Amazon sales
- Conversational ## headings: "## The camera surprised me" not "## Camera Performance"
- End with YOUR personal take, not a summary
- NEVER: "In conclusion", "Overall", "To summarize", "Furthermore", "Moreover"`
        },
        {
          role: 'user',
          content: `Write a ${typeContext[category] || 'tech article'} about: "${topic}"
Brand: ${brand || 'various'}
Length: 750-950 words
Make it genuinely useful for someone about to spend their hard-earned money in India.`
        }
      ]
    })
  })

  if (!res.ok) throw new Error(`Groq error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function humanizeTitle(original: string, brand: string, category: string): string {
  // Make titles less AI-sounding
  const titleTemplates: Record<string, string[]> = {
    launch: [
      `${brand} Just Dropped Something New — Here's What Indians Need to Know`,
      `${brand}'s Latest Phone Is Out. Is It Actually Worth Your Money?`,
      `We Looked at the New ${brand} — Some Things Surprised Us`,
    ],
    review: [
      `I Used the ${brand} for 3 Weeks. Honest Thoughts.`,
      `${brand} Review: The Good, The Bad, and the Overpriced`,
      `Is the ${brand} Worth It in India? After Testing It, Here's My Take`,
    ],
    comparison: [
      `${brand} vs The Competition: Which One Should Indians Actually Buy?`,
      `Don't Spend ₹50,000 Until You Read This Comparison`,
    ],
    guide: [
      `Best Phones to Buy Right Now in India (No Fluff, Just Facts)`,
      `The Honest Buying Guide: What to Get and What to Skip`,
    ],
    update: [
      `${brand} Pushed an Update — Here's What Actually Changed`,
      `New ${brand} Update Is Out. Does It Fix the Annoying Stuff?`,
    ],
  }
  const templates = titleTemplates[category] || titleTemplates['launch']
  return templates[Math.floor(Math.random() * templates.length)]
}

function extractExcerpt(content: string): string {
  const paragraphs = content.split('\n\n').filter(p => p.trim() && !p.startsWith('#'))
  const first = paragraphs[0] || content
  return first.replace(/^#+\s*/, '').slice(0, 220).trim()
}

function detectBrand(text: string): string {
  const brands = ['Samsung', 'Apple', 'OnePlus', 'Realme', 'Google', 'Xiaomi', 'Redmi', 'Vivo', 'Oppo', 'Poco', 'Nothing', 'Motorola']
  const lower = text.toLowerCase()
  return brands.find(b => lower.includes(b.toLowerCase())) || 'The Tech Bharat'
}