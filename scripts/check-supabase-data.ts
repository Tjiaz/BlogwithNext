// Quick script to check Supabase data and RLS policies
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Checking Supabase data...\n');

  // Check total articles
  const { count: totalCount, error: countError } = await supabase
    .from('final_articles')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting articles:', countError);
  } else {
    console.log(`📊 Total articles in database: ${totalCount}`);
  }

  // Check published articles
  const { count: publishedCount, error: publishedError } = await supabase
    .from('final_articles')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  if (publishedError) {
    console.error('❌ Error counting published articles:', publishedError);
  } else {
    console.log(`✅ Published articles (is_published=true): ${publishedCount}`);
  }

  // Get sample articles
  const { data: articles, error: articlesError } = await supabase
    .from('final_articles')
    .select('id, title, slug, is_published, date, published_at')
    .limit(10);

  if (articlesError) {
    console.error('❌ Error fetching articles:', articlesError);
  } else {
    console.log(`\n📝 Sample articles (first 10):`);
    articles?.forEach((article, index) => {
      console.log(`  ${index + 1}. "${article.title}" - is_published: ${article.is_published}, slug: ${article.slug}`);
    });
  }

  // Check if any articles have is_published = false or null
  const { data: unpublishedArticles, error: unpublishedError } = await supabase
    .from('final_articles')
    .select('id, title, is_published')
    .or('is_published.eq.false,is_published.is.null')
    .limit(5);

  if (!unpublishedError && unpublishedArticles && unpublishedArticles.length > 0) {
    console.log(`\n⚠️  Found ${unpublishedArticles.length} unpublished articles:`);
    unpublishedArticles.forEach((article) => {
      console.log(`  - "${article.title}" - is_published: ${article.is_published}`);
    });
  }
}

checkData()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
