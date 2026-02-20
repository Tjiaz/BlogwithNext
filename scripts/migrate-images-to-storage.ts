/**
 * Migration script: Move base64 images from database to Supabase Storage
 * 
 * Run with: npx tsx scripts/migrate-images-to-storage.ts
 * 
 * Prerequisites:
 * 1. Create a storage bucket named "article-images" in Supabase Dashboard
 * 2. Set the bucket to public (or configure RLS policies)
 * 3. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'article-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  bytesFreed: number;
}

const stats: MigrationStats = {
  total: 0,
  migrated: 0,
  skipped: 0,
  failed: 0,
  bytesFreed: 0,
};

function isBase64Image(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:image');
}

function parseBase64(dataUrl: string): { contentType: string; buffer: Buffer } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  
  const contentType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  return { contentType, buffer };
}

function getFileExtension(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  return map[contentType] || 'jpg';
}

async function ensureBucketExists(): Promise<boolean> {
  console.log(`\n📦 Checking storage bucket "${BUCKET_NAME}"...`);
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Failed to list buckets:', listError.message);
    return false;
  }
  
  const exists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (exists) {
    console.log(`✓ Bucket "${BUCKET_NAME}" exists`);
    return true;
  }
  
  console.log(`Creating bucket "${BUCKET_NAME}"...`);
  const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
  });
  
  if (createError) {
    console.error('❌ Failed to create bucket:', createError.message);
    console.log('\n👉 Please create the bucket manually in Supabase Dashboard:');
    console.log('   1. Go to Storage in your Supabase project');
    console.log('   2. Click "New bucket"');
    console.log(`   3. Name it "${BUCKET_NAME}" and make it public`);
    return false;
  }
  
  console.log(`✓ Created bucket "${BUCKET_NAME}"`);
  return true;
}

async function uploadImage(
  articleId: string,
  fieldName: string,
  dataUrl: string
): Promise<string | null> {
  const parsed = parseBase64(dataUrl);
  if (!parsed) {
    console.log(`  ⚠️ Invalid base64 format for ${fieldName}`);
    return null;
  }
  
  const ext = getFileExtension(parsed.contentType);
  const fileName = `${articleId}/${fieldName}.${ext}`;
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, parsed.buffer, {
      contentType: parsed.contentType,
      upsert: true,
    });
  
  if (error) {
    console.log(`  ❌ Upload failed for ${fieldName}: ${error.message}`);
    return null;
  }
  
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
  
  stats.bytesFreed += dataUrl.length;
  console.log(`  ✓ Uploaded ${fieldName} (${(parsed.buffer.length / 1024).toFixed(1)}KB)`);
  
  return urlData.publicUrl;
}

async function migrateArticle(article: any): Promise<void> {
  const updates: Record<string, string> = {};
  const imageFields = ['hero_image', 'img', 'featured_image', 'image', 'image_url'];
  
  // Process single image fields
  for (const field of imageFields) {
    if (isBase64Image(article[field])) {
      const url = await uploadImage(article.id, field, article[field]);
      if (url) {
        updates[field] = url;
      }
    }
  }
  
  // Process filtered_images array
  if (Array.isArray(article.filtered_images)) {
    const newUrls: string[] = [];
    let hasChanges = false;
    
    for (let i = 0; i < article.filtered_images.length; i++) {
      const img = article.filtered_images[i];
      if (isBase64Image(img)) {
        const url = await uploadImage(article.id, `filtered_${i}`, img);
        newUrls.push(url || img);
        if (url) hasChanges = true;
      } else {
        newUrls.push(img);
      }
    }
    
    if (hasChanges) {
      updates.filtered_images = newUrls as any;
    }
  }
  
  // Update article if we have changes
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('final_articles')
      .update(updates)
      .eq('id', article.id);
    
    if (error) {
      console.log(`  ❌ Failed to update article: ${error.message}`);
      stats.failed++;
    } else {
      stats.migrated++;
    }
  } else {
    stats.skipped++;
  }
}

async function main() {
  console.log('🚀 Starting image migration to Supabase Storage\n');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  
  // Ensure bucket exists
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    process.exit(1);
  }
  
  // Fetch all articles with image fields
  console.log('\n📚 Fetching articles...');
  const { data: articles, error } = await supabase
    .from('final_articles')
    .select('id, title, hero_image, img, featured_image, image, image_url, filtered_images');
  
  if (error) {
    console.error('❌ Failed to fetch articles:', error.message);
    process.exit(1);
  }
  
  if (!articles || articles.length === 0) {
    console.log('No articles found.');
    return;
  }
  
  stats.total = articles.length;
  console.log(`Found ${articles.length} articles\n`);
  
  // Process each article
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i + 1}/${articles.length}] ${article.title?.slice(0, 50)}...`);
    await migrateArticle(article);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Complete!');
  console.log('='.repeat(50));
  console.log(`Total articles:  ${stats.total}`);
  console.log(`Migrated:        ${stats.migrated}`);
  console.log(`Skipped (no b64): ${stats.skipped}`);
  console.log(`Failed:          ${stats.failed}`);
  console.log(`Space freed:     ~${(stats.bytesFreed / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
