-- Run this in Supabase SQL Editor to fix "statement timeout" on homepage
-- Partial index: only indexes published rows, ordered by published_at (used by homepage query)
CREATE INDEX IF NOT EXISTS idx_final_articles_published_at_filter 
  ON final_articles(published_at DESC) 
  WHERE is_published = true;
