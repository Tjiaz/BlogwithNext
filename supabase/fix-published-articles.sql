-- Fix: Set all articles to published if they're not already
-- Run this in Supabase SQL Editor if articles aren't showing up

-- First, check current status
SELECT 
  COUNT(*) as total_articles,
  COUNT(*) FILTER (WHERE is_published = true) as published,
  COUNT(*) FILTER (WHERE is_published = false) as unpublished,
  COUNT(*) FILTER (WHERE is_published IS NULL) as null_published
FROM final_articles;

-- Set all articles to published (if you want all articles visible)
UPDATE final_articles 
SET is_published = true 
WHERE is_published IS NULL OR is_published = false;

-- Verify the update
SELECT 
  COUNT(*) as total_articles,
  COUNT(*) FILTER (WHERE is_published = true) as published
FROM final_articles;
