# MongoDB to Supabase Migration Instructions

## Prerequisites

1. ✅ Supabase project created and schema run (`supabase/schema.sql`)
2. ✅ `.env.local` file has both:
   - `DATABASE_URL` (your MongoDB connection string)
   - `NEXT_PUBLIC_SUPABASE_URL` (your Supabase project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` (your Supabase key)

## Step 1: Verify MongoDB Connection

Your MongoDB connection string should be in `.env.local`:
```bash
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ARTICLES?retryWrites=true&w=majority
```

## Step 2: Run the Migration Script

```bash
npm run migrate:supabase
```

The script will:
1. ✅ Connect to MongoDB
2. ✅ Fetch all articles from `final_articles` collection
3. ✅ Transform data to match Supabase schema
4. ✅ Insert into Supabase in batches of 50
5. ✅ Show progress and summary

## Step 3: Verify Migration

1. Go to Supabase dashboard → **Table Editor**
2. Click on `final_articles` table
3. You should see all your articles there

## Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env.local` has your MongoDB connection string
- Restart your terminal/IDE after adding it

### "Supabase credentials are not set"
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure you copied the entire JWT token (very long string)

### "Duplicate key error"
- This means some articles already exist in Supabase
- The script uses `upsert` so it will update existing articles
- This is normal if you run the script multiple times

### "Connection timeout"
- Check MongoDB Atlas cluster is running (not paused)
- Verify your IP is whitelisted in MongoDB Atlas
- Check Supabase project is active

## What Gets Migrated

✅ **Migrated:**
- All article fields (title, content, author, etc.)
- Images (img, featuredImage, hero_image, etc.)
- Dates (date, publishedAt, createdAt)
- Tags and categories
- Views and likes counts
- Comments (if any)

⚠️ **Notes:**
- MongoDB `_id` is not migrated (Supabase uses UUID)
- Slug is generated from MongoDB `slug` field or `_id` if slug doesn't exist
- Duplicate slugs will be updated (not create duplicates)

## After Migration

Once migration is complete:
1. ✅ Test your homepage - articles should load from Supabase
2. ✅ Test article pages - should display content correctly
3. ✅ Verify all data looks correct in Supabase dashboard
