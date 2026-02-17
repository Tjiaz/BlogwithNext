# Vercel Deployment Checklist

## Required Environment Variables

Add these in your Vercel project: **Settings → Environment Variables**

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL (note: SUPABASE not SUBABASE) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | For admin operations |

## Supabase Performance Index (Run Once)

In Supabase Dashboard → **SQL Editor**, run:

```sql
CREATE INDEX IF NOT EXISTS idx_final_articles_published_at_filter 
  ON final_articles(published_at DESC) 
  WHERE is_published = true;
```

This speeds up homepage and listing queries.

## Timeout Fixes (Applied)

- **Homepage** uses Edge runtime (30s timeout vs 10s on Node.js)
- **ISR** caches homepage for 60 seconds
- **Content removed** from list queries (getTopArticles, getArticles) - was causing 8s+ Supabase timeouts
- **HeroSection** skips /api/posts when server provides initial data
