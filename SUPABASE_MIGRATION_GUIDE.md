# Supabase Migration Guide

This guide will help you migrate from MongoDB Atlas to Supabase (PostgreSQL).

## Step 1: Create Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (GitHub, Google, or email)
3. Click "New Project"
4. Fill in:
   - **Name**: Your project name (e.g., "blogz")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your Vercel deployment
   - **Pricing Plan**: Free (generous free tier)
5. Click "Create new project"
6. Wait 2-3 minutes for project to be ready

## Step 2: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" (or press Ctrl+Enter)
5. Verify tables were created:
   - Go to **Table Editor** (left sidebar)
   - You should see: `final_articles`, `users`, `newsletter_subscribers`, `newsletter_logs`

## Step 3: Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")
   - **service_role key** (under "Project API keys" → "service_role" - keep this secret!)

## Step 4: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # Optional, for admin operations
```

**For Vercel:**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the three variables above with your Supabase credentials

## Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 6: Migrate Your Data (Optional)

If you have existing data in MongoDB:

1. Export data from MongoDB Atlas:
   ```bash
   # Use MongoDB Compass or mongoexport to export your collections
   mongoexport --uri="your_mongodb_uri" --collection=final_articles --out=articles.json
   ```

2. Transform and import to Supabase:
   - Use the migration script (to be created) or manually import via Supabase dashboard
   - Go to **Table Editor** → `final_articles` → **Insert** → **Import data**

## Step 7: Test the Migration

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Test these pages:
   - Homepage (should load articles)
   - Article pages (should display content)
   - Search functionality
   - Newsletter subscription

## Step 8: Deploy to Vercel

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Migrate from MongoDB to Supabase"
   git push origin starter_tscript
   ```

2. Vercel will automatically deploy
3. Make sure environment variables are set in Vercel dashboard

## Troubleshooting

### Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active (not paused)
- Verify network access (Supabase doesn't require IP whitelisting)

### Query Performance
- Supabase is much faster than MongoDB Atlas free tier
- Indexes are automatically created by the schema
- Use Supabase dashboard to monitor query performance

### Data Migration
- If you have a lot of data, use Supabase's import tools or write a migration script
- Test with a small subset first

## Benefits of Supabase

✅ **No timeout issues** - Fast and reliable  
✅ **Free tier** - 500MB database, 2GB bandwidth  
✅ **Better performance** - Optimized PostgreSQL  
✅ **Built-in features** - Auth, storage, real-time (if needed later)  
✅ **No IP whitelisting** - Works from anywhere  
✅ **Better for Vercel** - Designed for serverless  

## Next Steps After Migration

1. Remove MongoDB dependencies (optional):
   ```bash
   npm uninstall mongodb mongoose
   ```

2. Update any remaining MongoDB references
3. Test all functionality thoroughly
4. Monitor Supabase dashboard for usage

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Supabase GitHub: https://github.com/supabase/supabase
