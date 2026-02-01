# Troubleshooting Guide - Articles Not Showing

If articles aren't showing up on your deployed site, follow these steps:

## Step 1: Check Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

3. **Important**: After adding/updating variables, **redeploy** your project

## Step 2: Check Supabase Data

Run the diagnostic script locally:
```bash
npm run check:supabase
```

This will show:
- Total articles in database
- How many are published (`is_published = true`)
- Sample articles with their status

## Step 3: Fix Published Status

If articles exist but aren't published, run this SQL in Supabase SQL Editor:

```sql
-- Set all articles to published
UPDATE final_articles 
SET is_published = true 
WHERE is_published IS NULL OR is_published = false;
```

Or use the provided script: `supabase/fix-published-articles.sql`

## Step 4: Check RLS Policies

In Supabase Dashboard → Authentication → Policies:

Make sure you have this policy on `final_articles`:
```sql
CREATE POLICY "Public can read published articles" ON final_articles
  FOR SELECT USING (is_published = true);
```

If this policy doesn't exist, create it:
1. Go to Supabase Dashboard → Table Editor → `final_articles`
2. Click "RLS" tab
3. Click "New Policy"
4. Use the SQL above

## Step 5: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "Functions" tab
4. Check for errors in the logs

Look for:
- `❌ [getHomepageData] Supabase error`
- `⚠️ [getHomepageData] No articles found`

## Step 6: Verify Migration

If you migrated from MongoDB, verify the migration completed:

1. In Supabase Dashboard → Table Editor → `final_articles`
2. Check if articles exist
3. Check the `is_published` column - should be `true` (green checkmark)

## Common Issues

### Issue: "No articles found"
**Solution**: 
- Check if articles exist in Supabase
- Run `npm run check:supabase` locally
- Verify `is_published = true` for articles

### Issue: RLS blocking access
**Solution**:
- Ensure RLS policy allows public read for `is_published = true`
- Check you're using `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not service role key) for client queries

### Issue: Environment variables not working
**Solution**:
- Double-check variable names in Vercel (case-sensitive!)
- Make sure variables are set for **all environments** (Production, Preview, Development)
- Redeploy after adding variables

### Issue: Build succeeds but runtime fails
**Solution**:
- Check Vercel function logs for runtime errors
- Verify Supabase project is active (not paused)
- Check network connectivity

## Quick Fix Script

If articles exist but aren't showing, run this in Supabase SQL Editor:

```sql
-- Quick fix: Publish all articles
UPDATE final_articles SET is_published = true;

-- Verify
SELECT id, title, is_published FROM final_articles LIMIT 10;
```

## Still Not Working?

1. Check Vercel function logs for specific error messages
2. Run `npm run check:supabase` locally to verify data
3. Check Supabase dashboard → Logs for query errors
4. Verify RLS policies are correct
