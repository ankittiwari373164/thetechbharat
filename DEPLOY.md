# 🚀 THE TECH BHARAT — DEPLOYMENT GUIDE
## Next.js on Render.com + UptimeRobot Auto-News

---

## STEP 1: Fix Supabase Database (5 minutes)

1. Go to https://supabase.com → your project
2. Click SQL Editor → New Query
3. Paste the contents of sql/schema.sql
4. Click Run
5. Done! Your database is ready.

---

## STEP 2: Push to GitHub (3 minutes)

```bash
cd thetechbharat-nextjs
git init
git add .
git commit -m "Initial commit — The Tech Bharat Next.js"
git remote add origin https://github.com/ankittiwari373164/thetechbharat.git
git push -u origin main
```

---

## STEP 3: Deploy on Render.com (5 minutes)

1. Go to https://render.com → Sign up free
2. New → Web Service
3. Connect GitHub → select your repo
4. Settings:
   - Name: thetechbharat
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add Environment Variables (from render.yaml or copy below):

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://aoijkjmqevldedalgtft.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGci...bk4 (your anon key) |
| SUPABASE_SERVICE_KEY | (same as anon key for now) |
| GROQ_API_KEY | gsk_Aoy...Ca |
| NEWS_API_KEY | 9a06507c... |
| CRON_SECRET | ttb_cron_2026 |
| ADMIN_PASSWORD | TechBharat@2026 |
| PORT | 3000 |

6. Click Create Web Service
7. Wait ~3 minutes for build
8. Your site is live at: https://thetechbharat.onrender.com ✅

---

## STEP 4: Auto News with UptimeRobot (5 minutes)

UptimeRobot pings your site to keep it awake AND triggers auto-news publishing every 6 hours!

1. Go to https://uptimerobot.com → Sign up free
2. Add Monitor #1 (Keep Alive):
   - Type: HTTP(s)
   - URL: https://thetechbharat.onrender.com
   - Interval: 5 minutes
   - Name: TTB Keep Alive

3. Add Monitor #2 (Auto News Cron):
   - Type: HTTP(s)  
   - URL: https://thetechbharat.onrender.com/api/cron?secret=ttb_cron_2026
   - Interval: 360 minutes (6 hours)
   - Name: TTB Auto News

That's it! News auto-publishes every 6 hours. ✅

---

## STEP 5: Custom Domain (optional)

On Render → your service → Settings → Custom Domain
Add: thetechbharat.com → follow DNS instructions

---

## ADMIN PANEL

URL: https://yoursite.onrender.com/admin
Password: TechBharat@2026

Features:
- Write articles manually
- AI Writer (Groq generates full articles)
- Auto Fetch News (fetch + rewrite + publish in one click)
- View/delete all articles

---

## HOW AUTO NEWS WORKS

Every 6 hours UptimeRobot hits /api/cron?secret=ttb_cron_2026

The cron job:
1. Searches NewsAPI for trending smartphone news
2. Rewrites each article completely with Groq AI (zero plagiarism)
3. Publishes to Supabase (dedup prevents duplicates)
4. Your site shows new articles automatically

---

## ADSENSE CHECKLIST ✅

✅ Proper Next.js SSR — fast loading, SEO-friendly
✅ Auto-publishing trending news (6x per day)
✅ AI rewriting — zero plagiarism, passes AI detection
✅ Read-more toggle with key points summary
✅ Similar articles on every page
✅ Web Stories page (/web-stories)
✅ Brand filtering on all category pages
✅ About, Contact, Privacy pages
✅ Mobile responsive
✅ Server-side rendered (Google loves this)
✅ No browser storage issues — works everywhere
✅ Custom domain support

---

## TROUBLESHOOTING

Site not loading?
→ Check Render logs (Dashboard → your service → Logs)
→ Most common: env variable not set

No articles showing?
→ Run SQL schema first (Step 1)
→ Check Supabase → Table Editor → articles table exists

Auto news not working?
→ Verify GROQ_API_KEY and NEWS_API_KEY are set
→ Test manually: visit /api/cron?secret=ttb_cron_2026 in browser

Admin login failed?
→ Password is ADMIN_PASSWORD env variable
→ Default: TechBharat@2026
