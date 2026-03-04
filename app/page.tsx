'use client'
import { useState, useEffect } from 'react'

type Article = { id: string; title: string; category: string; brand: string; published_at: string; rating?: number; content?: string; excerpt?: string; img_url?: string }

const CATS = ['launch','review','comparison','update','guide']
const BRANDS = ['The Tech Bharat','Samsung','Apple','OnePlus','Realme','Google','Xiaomi','Vivo','Oppo','Poco','Nothing']
const CAT_COLOR: Record<string,string> = { launch:'#c0392b', review:'#1a5276', comparison:'#6c3483', update:'#d35400', guide:'#1e8449' }

export default function AdminPage() {
  const [authed, setAuthed]   = useState(false)
  const [pw, setPw]           = useState('')
  const [panel, setPanel]     = useState('dashboard')
  const [articles, setArts]   = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  const [editId, setEditId]   = useState('')
  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [cat, setCat]         = useState('launch')
  const [brand, setBrand]     = useState('The Tech Bharat')
  const [imgUrl, setImgUrl]   = useState('')
  const [rating, setRating]   = useState('')

  const [aiTopic, setAiTopic] = useState('')
  const [aiCat, setAiCat]     = useState('launch')
  const [aiBrand, setAiBrand] = useState('')
  const [aiStatus, setAiStatus] = useState('')

  const [afQuery, setAfQuery] = useState('')
  const [afCat, setAfCat]     = useState('launch')
  const [afBrand, setAfBrand] = useState('')
  const [afLog, setAfLog]     = useState('')

  function getKey() {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('ttb_admin_key') || ''
  }

  async function login() {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      })
      if (res.ok) {
        localStorage.setItem('ttb_admin_key', pw)
        setAuthed(true)
        loadArts()
      } else {
        setMsg('Wrong password. Check ADMIN_PASSWORD in Render env vars.')
      }
    } catch (e: any) {
      setMsg('Error: ' + e.message)
    }
  }

  async function loadArts() {
    setLoading(true)
    try {
      const res = await fetch('/api/articles?limit=100')
      if (res.ok) {
        const d = await res.json()
        setArts(d.articles || [])
      }
    } catch (_e) {}
    setLoading(false)
  }

  function editArt(a: Article) {
    setEditId(a.id)
    setTitle(a.title || '')
    setContent(a.content || '')
    setExcerpt(a.excerpt || '')
    setCat(a.category || 'launch')
    setBrand(a.brand || 'The Tech Bharat')
    setImgUrl(a.img_url || '')
    setRating(a.rating ? String(a.rating) : '')
    setPanel('write')
    setMsg('')
  }

  function clearForm() {
    setEditId('')
    setTitle('')
    setContent('')
    setExcerpt('')
    setCat('launch')
    setBrand('The Tech Bharat')
    setImgUrl('')
    setRating('')
    setMsg('')
  }

  async function saveArt() {
    if (!title || !content) { setMsg('Title and content are required'); return }
    setLoading(true)
    setMsg('Saving...')
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() },
        body: JSON.stringify({ id: editId || undefined, title, content, excerpt, category: cat, brand, img_url: imgUrl, rating: rating || null })
      })
      const d = await res.json()
      if (res.ok) {
        setMsg('Article saved!')
        clearForm()
        loadArts()
      } else {
        setMsg('Error: ' + d.error)
      }
    } catch(e: any) {
      setMsg('Error: ' + e.message)
    }
    setLoading(false)
  }

  async function delArt(id: string, t: string) {
    if (!confirm('Delete "' + t + '"?')) return
    await fetch('/api/articles?id=' + id, { method: 'DELETE', headers: { 'x-admin-key': getKey() } })
    loadArts()
  }

  async function runAI() {
    if (!aiTopic) return
    setAiStatus('Generating...')
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() },
        body: JSON.stringify({ action: 'generate', topic: aiTopic, category: aiCat, brand: aiBrand })
      })
      const d = await res.json()
      if (d.content) {
        setContent(d.content)
        setTitle(aiTopic)
        setCat(aiCat)
        setBrand(aiBrand || 'The Tech Bharat')
        setPanel('write')
        setAiStatus('Generated! Review and publish.')
      } else {
        setAiStatus('Error: ' + d.error)
      }
    } catch(e: any) {
      setAiStatus('Error: ' + e.message)
    }
  }

  async function runFetch() {
    if (!afQuery) return
    setAfLog('Fetching news...')
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() },
        body: JSON.stringify({ action: 'fetch_and_publish', query: afQuery, category: afCat, brand: afBrand })
      })
      const d = await res.json()
      if (d.saved) {
        setAfLog('Published ' + d.count + ' articles!\n\n' + d.saved.map((a: any) => '• ' + a.title).join('\n'))
      } else {
        setAfLog('Error: ' + d.error)
      }
    } catch(e: any) {
      setAfLog('Error: ' + e.message)
    }
  }

  async function testCron() {
    setAfLog('Running cron...')
    const res = await fetch('/api/cron?secret=' + (typeof window !== 'undefined' ? localStorage.getItem('ttb_cron_secret') || 'ttb_cron_2026' : 'ttb_cron_2026'))
    const d = await res.json()
    setAfLog(JSON.stringify(d, null, 2))
  }

  useEffect(() => {
    const k = typeof window !== 'undefined' ? localStorage.getItem('ttb_admin_key') : null
    if (k) { setPw(k); setAuthed(true); loadArts() }
  }, [])

  if (!authed) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center text-white font-black text-lg mx-auto mb-3">TTB</div>
          <h1 className="text-2xl font-black">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">The Tech Bharat</p>
        </div>
        <input type="password" placeholder="Admin password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:border-red-400 outline-none"/>
        {msg && <p className="text-sm text-red-600 mb-3 text-center">{msg}</p>}
        <button onClick={login} className="w-full bg-red-700 text-white rounded-xl py-3 font-bold hover:bg-red-800 transition-colors">
          Login
        </button>
      </div>
    </div>
  )

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'articles',  icon: '📰', label: 'Articles' },
    { id: 'write',     icon: '✍️',  label: 'Write Article' },
    { id: 'ai',        icon: '🤖', label: 'AI Writer' },
    { id: 'autofetch', icon: '📡', label: 'Auto Fetch News' },
    { id: 'cron',      icon: '⏰', label: 'Cron / Auto News' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="w-56 bg-gray-900 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center text-white font-black text-xs">TTB</div>
            <div>
              <div className="text-sm font-black text-white">The Tech Bharat</div>
              <div className="text-xs text-gray-500">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(n => (
            <button key={n.id} onClick={() => { setPanel(n.id); if (n.id === 'articles') loadArts() }}
              className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ' + (panel === n.id ? 'bg-red-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3">
          <a href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <span>🌐</span><span>View Site</span>
          </a>
          <button onClick={() => { localStorage.removeItem('ttb_admin_key'); setAuthed(false) }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white transition-all mt-1">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 capitalize">{panel.replace('autofetch','Auto Fetch')}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">● Connected</span>
            <button onClick={() => { setPanel('write'); clearForm() }} className="bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-800">
              + New Article
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">

          {panel === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Articles', val: articles.length, color: 'border-red-500' },
                  { label: 'Launches', val: articles.filter(a => a.category === 'launch').length, color: 'border-blue-500' },
                  { label: 'Reviews', val: articles.filter(a => a.category === 'review').length, color: 'border-green-500' },
                  { label: 'Guides', val: articles.filter(a => a.category === 'guide').length, color: 'border-orange-500' },
                ].map(s => (
                  <div key={s.label} className={'bg-white rounded-2xl p-5 border-t-4 shadow-sm ' + s.color}>
                    <div className="text-3xl font-black text-gray-900">{s.val}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-lg">Recent Articles</h2>
                  <button onClick={() => setPanel('articles')} className="text-sm text-red-600 font-semibold hover:underline">View All</button>
                </div>
                {articles.slice(0, 8).map(a => (
                  <div key={a.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-bold text-white px-2 py-1 rounded-full flex-shrink-0" style={{ background: CAT_COLOR[a.category] || '#555' }}>{a.category}</span>
                    <a href={'/article/' + a.id} target="_blank" className="flex-1 text-sm font-semibold text-gray-800 hover:text-red-600 line-clamp-1">{a.title}</a>
                    <span className="text-xs text-gray-400 flex-shrink-0 hidden md:block">{a.brand}</span>
                    <button onClick={() => delArt(a.id, a.title)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">Delete</button>
                  </div>
                ))}
                {articles.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No articles yet. Write your first one!</p>}
              </div>
            </div>
          )}

          {panel === 'articles' && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-lg">All Articles ({articles.length})</h2>
                <button onClick={loadArts} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5">Refresh</button>
              </div>
              {loading ? <p className="text-gray-400 text-center py-10">Loading...</p> : (
                <div className="space-y-1">
                  {articles.map(a => (
                    <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: CAT_COLOR[a.category] || '#555' }}>{a.category}</span>
                      <a href={'/article/' + a.id} target="_blank" className="flex-1 text-sm font-semibold text-gray-800 hover:text-red-600 line-clamp-1 min-w-0">{a.title}</a>
                      <span className="text-xs text-gray-400 flex-shrink-0 hidden md:block">{a.brand}</span>
                      {a.rating && <span className="text-xs text-yellow-500 flex-shrink-0">★{a.rating}</span>}
                      <button onClick={() => editArt(a)} className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-lg flex-shrink-0">Edit</button>
                      <button onClick={() => delArt(a.id, a.title)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg flex-shrink-0">Delete</button>
                    </div>
                  ))}
                  {articles.length === 0 && <p className="text-gray-400 text-center py-10">No articles yet</p>}
                </div>
              )}
            </div>
          )}

          {panel === 'write' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 max-w-3xl">
              <h2 className="font-black text-lg mb-5">{editId ? 'Edit Article' : 'Write New Article'}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Category</label>
                  <select value={cat} onChange={e => setCat(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none">
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Brand</label>
                  <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none">
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-1">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title..." className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none"/>
              </div>
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-1">Excerpt (shown in cards)</label>
                <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="Short summary..." className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none resize-none"/>
              </div>
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-1">Content * (use ## for headings)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={18} placeholder="Write article here. Use ## Heading for sections..." className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none resize-y font-mono"/>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Image URL</label>
                  <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://..." className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none"/>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Rating (reviews only, e.g. 4.5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={rating} onChange={e => setRating(e.target.value)} placeholder="4.5" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none"/>
                </div>
              </div>
              {msg && (
                <p className={'text-sm font-semibold mb-4 ' + (msg.includes('saved') || msg.includes('!') ? 'text-green-600' : 'text-red-600')}>{msg}</p>
              )}
              <div className="flex gap-3">
                <button onClick={saveArt} disabled={loading} className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 disabled:opacity-50 transition-colors">
                  {loading ? 'Saving...' : (editId ? 'Update Article' : 'Publish Article')}
                </button>
                <button onClick={clearForm} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  Clear
                </button>
              </div>
            </div>
          )}

          {panel === 'ai' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
              <h2 className="font-black text-lg mb-2">AI Writer</h2>
              <p className="text-sm text-gray-500 mb-5">Generate a full article with Groq AI. It will appear in the Write panel for you to review before publishing.</p>
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-1">Topic / Prompt</label>
                <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. OnePlus 13R long-term review India" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Category</label>
                  <select value={aiCat} onChange={e => setAiCat(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none">
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Brand</label>
                  <select value={aiBrand} onChange={e => setAiBrand(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none">
                    <option value="">Various</option>
                    {BRANDS.slice(1).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={runAI} className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors">
                Generate Article
              </button>
              {aiStatus && (
                <p className={'mt-3 text-sm font-semibold ' + (aiStatus.includes('Error') ? 'text-red-600' : 'text-blue-600')}>{aiStatus}</p>
              )}
            </div>
          )}

          {panel === 'autofetch' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
              <h2 className="font-black text-lg mb-2">Auto Fetch & Rewrite News</h2>
              <p className="text-sm text-gray-500 mb-5">Fetch trending news from NewsAPI, rewrite completely with Groq AI, publish automatically. Zero plagiarism.</p>
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 block mb-1">Search Query</label>
                <input value={afQuery} onChange={e => setAfQuery(e.target.value)} placeholder="e.g. Samsung Galaxy India launch 2026" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Category</label>
                  <select value={afCat} onChange={e => setAfCat(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none">
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Brand (optional)</label>
                  <select value={afBrand} onChange={e => setAfBrand(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-red-400 outline-none">
                    <option value="">Auto-detect</option>
                    {BRANDS.slice(1).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={runFetch} className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors">
                Fetch & Publish News
              </button>
              {afLog && (
                <div className="mt-4 bg-gray-950 text-green-400 font-mono text-xs p-4 rounded-xl whitespace-pre-wrap max-h-64 overflow-y-auto">{afLog}</div>
              )}
            </div>
          )}

          {panel === 'cron' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
              <h2 className="font-black text-lg mb-2">Auto News Cron Setup</h2>
              <p className="text-sm text-gray-500 mb-5">Set up UptimeRobot to auto-publish news every 6 hours for free.</p>
              <div className="bg-gray-950 rounded-xl p-5 mb-5 font-mono text-sm">
                <div className="text-gray-500 mb-2 text-xs">Your cron URL (add to UptimeRobot):</div>
                <div className="text-yellow-300 break-all text-xs">{typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.onrender.com'}/api/cron?secret=ttb_cron_2026</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1 mb-5">
                <p className="font-bold">UptimeRobot setup (free):</p>
                <p>1. Go to uptimerobot.com → sign up free</p>
                <p>2. Add Monitor → HTTP(s) → paste the URL above</p>
                <p>3. Set interval to 360 minutes (6 hours)</p>
                <p>4. Done! News auto-publishes every 6 hours</p>
              </div>
              <button onClick={testCron} className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors">
                Test Cron Now
              </button>
              {afLog && (
                <div className="mt-4 bg-gray-950 text-green-400 font-mono text-xs p-4 rounded-xl whitespace-pre-wrap max-h-64 overflow-y-auto">{afLog}</div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}