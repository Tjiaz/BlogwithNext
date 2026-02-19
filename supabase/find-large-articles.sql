-- Find articles with the largest content (run in Supabase Dashboard > SQL Editor)
-- Helps identify articles causing cache limits and high egress

SELECT 
  slug,
  title,
  length(content) as content_bytes,
  round(length(content)::numeric / 1024 / 1024, 2) as content_mb,
  length(content) > 2097152 as exceeds_2mb_cache_limit
FROM final_articles
WHERE is_published = true
ORDER BY length(content) DESC
LIMIT 20;
