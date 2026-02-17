-- Run this in Supabase SQL Editor to speed up homepage and listing queries
-- Composite index for common filter + order pattern
CREATE INDEX IF NOT EXISTS idx_final_articles_published_at_filter 
  ON final_articles(published_at DESC) 
  WHERE is_published = true;
