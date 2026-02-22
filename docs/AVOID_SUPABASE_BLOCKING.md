# Avoiding Supabase Egress Quota / Temporary Blocking

Supabase free tier has **5.5 GB egress per month**. Once exceeded, the project is restricted until the next billing cycle. Here’s what is in place and what you can do.

## What’s already done

1. **Images off Supabase**  
   New uploads go to **AWS S3**. Image traffic no longer counts as Supabase egress.  
   - Ensure all env vars for S3 are set (see `docs/AWS_S3_SETUP.md`).  
   - Run `npm run migrate:images` if you still have old images in Supabase Storage so they move to S3.

2. **Caching (fewer Supabase calls)**  
   - **Homepage**: No longer `force-dynamic`; cached for **10 minutes** (`revalidate = 600`).  
   - **Article pages** (`/[slug]`): Cached for **5 minutes** (`revalidate = 300`).  
   - **API `/api/posts`**: Responses cached at edge with `s-maxage=600`, `stale-while-revalidate=900`.  
   So most visitors get cached responses and Supabase is only hit when the cache expires or when you publish.

3. **Graceful quota message**  
   If the quota is exceeded, the homepage shows “Content temporarily unavailable” instead of a broken page.

## What you can do next

- **Keep S3 for all images**  
  Don’t store new images in Supabase Storage; use only S3 so image bandwidth never counts against Supabase.

- **Optional: longer cache**  
  To reduce egress further, you can increase revalidate (e.g. homepage to 900 or 1800 seconds). New posts will appear after that many seconds.

- **Optional: Supabase Pro**  
  If you need more than 5.5 GB/month, upgrade to Pro for a higher egress quota.

- **Monitor usage**  
  In Supabase Dashboard → **Settings** → **Usage**, watch **Egress (Bandwidth)** so you see trends before hitting the limit.

## Summary

- Images → S3 (no Supabase egress for images).  
- Homepage and article pages → cached so most requests don’t hit Supabase.  
- If quota is hit → friendly message and wait for reset or upgrade.
