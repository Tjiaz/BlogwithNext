/**
 * Migration Script: MongoDB to Supabase
 * 
 * This script migrates data from MongoDB final_articles collection to Supabase PostgreSQL
 * 
 * Usage:
 *   1. Make sure your .env.local has both DATABASE_URL (MongoDB) and Supabase credentials
 *   2. Run: npm run migrate:supabase
 *   3. Check Supabase dashboard to verify data was imported
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Also try loading from .env as fallback
config({ path: resolve(process.cwd(), '.env') });

// Load environment variables
const mongoUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!mongoUrl) {
  throw new Error('❌ DATABASE_URL is not set in .env.local');
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Supabase credentials are not set in .env.local');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Transform MongoDB document to Supabase format
 */
function transformArticle(mongoDoc: any): any {
  // Handle date fields - convert to ISO string or null
  const date = mongoDoc.date ? new Date(mongoDoc.date).toISOString() : null;
  const publishedAt = mongoDoc.publishedAt ? new Date(mongoDoc.publishedAt).toISOString() : null;
  const createdAt = mongoDoc.createdAt ? new Date(mongoDoc.createdAt).toISOString() : null;

  // Handle filtered_images - ensure it's an array
  let filteredImages: string[] = [];
  if (mongoDoc.filtered_images) {
    if (Array.isArray(mongoDoc.filtered_images)) {
      filteredImages = mongoDoc.filtered_images.filter((img: any) => img && typeof img === 'string');
    } else if (typeof mongoDoc.filtered_images === 'string') {
      filteredImages = [mongoDoc.filtered_images];
    }
  }

  // Handle tags - ensure it's an array
  let tags: string[] = [];
  if (mongoDoc.tags) {
    if (Array.isArray(mongoDoc.tags)) {
      tags = mongoDoc.tags.filter((tag: any) => tag && typeof tag === 'string');
    } else if (typeof mongoDoc.tags === 'string') {
      tags = [mongoDoc.tags];
    }
  }

  // Handle comments - ensure it's valid JSON
  let comments: any[] = [];
  if (mongoDoc.comments && Array.isArray(mongoDoc.comments)) {
    comments = mongoDoc.comments.map((comment: any) => ({
      user: comment.user || comment.name || 'Anonymous',
      text: comment.text || comment.content || '',
      createdAt: comment.createdAt ? new Date(comment.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  // Generate slug if missing
  let slug = mongoDoc.slug;
  if (!slug || typeof slug !== 'string' || slug === '[object Object]') {
    if (mongoDoc._id) {
      slug = mongoDoc._id.toString();
    } else if (mongoDoc.title) {
      // Generate slug from title
      slug = mongoDoc.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 100); // Limit length
    } else {
      slug = `article-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
  }

  // Ensure slug is not too long (PostgreSQL has limits)
  if (slug.length > 255) {
    slug = slug.substring(0, 255);
  }

  // Truncate content if too long (PostgreSQL TEXT can be very long, but let's limit to avoid timeouts)
  let content = mongoDoc.content || '';
  if (content && content.length > 1000000) { // 1MB limit
    console.warn(`   ⚠️  Content too long (${content.length} chars), truncating...`);
    content = content.substring(0, 1000000);
  }

  return {
    slug: slug,
    title: (mongoDoc.title || 'Untitled').substring(0, 500), // Limit title length
    description: mongoDoc.description ? String(mongoDoc.description).substring(0, 2000) : (mongoDoc.excerpt ? String(mongoDoc.excerpt).substring(0, 2000) : (mongoDoc.summary ? String(mongoDoc.summary).substring(0, 2000) : null)),
    excerpt: mongoDoc.excerpt ? String(mongoDoc.excerpt).substring(0, 2000) : (mongoDoc.description ? String(mongoDoc.description).substring(0, 2000) : (mongoDoc.summary ? String(mongoDoc.summary).substring(0, 2000) : null)),
    summary: mongoDoc.summary ? String(mongoDoc.summary).substring(0, 2000) : (mongoDoc.description ? String(mongoDoc.description).substring(0, 2000) : (mongoDoc.excerpt ? String(mongoDoc.excerpt).substring(0, 2000) : null)),
    content: content,
    topic: mongoDoc.topic || mongoDoc.category || null,
    category: mongoDoc.category || mongoDoc.topic || null,
    tags: tags.slice(0, 50), // Limit tags array size
    author: (mongoDoc.author || mongoDoc.authorName || 'Unknown').substring(0, 200),
    author_name: (mongoDoc.authorName || mongoDoc.author || 'Unknown').substring(0, 200),
    date: date || publishedAt || createdAt,
    published_at: publishedAt || date || createdAt,
    created_at: createdAt || publishedAt || date || new Date().toISOString(),
    img: mongoDoc.img ? String(mongoDoc.img).substring(0, 1000) : null,
    featured_image: mongoDoc.featuredImage ? String(mongoDoc.featuredImage).substring(0, 1000) : (mongoDoc.img ? String(mongoDoc.img).substring(0, 1000) : null),
    image: mongoDoc.image ? String(mongoDoc.image).substring(0, 1000) : (mongoDoc.img ? String(mongoDoc.img).substring(0, 1000) : null),
    image_url: mongoDoc.imageUrl ? String(mongoDoc.imageUrl).substring(0, 1000) : (mongoDoc.img ? String(mongoDoc.img).substring(0, 1000) : null),
    hero_image: mongoDoc.hero_image ? String(mongoDoc.hero_image).substring(0, 1000) : (mongoDoc.img ? String(mongoDoc.img).substring(0, 1000) : null),
    filtered_images: filteredImages.slice(0, 20), // Limit filtered_images array
    views: Math.max(0, Math.min(mongoDoc.views || 0, 2147483647)), // Ensure within integer range
    likes: Math.max(0, Math.min(mongoDoc.likes || 0, 2147483647)), // Ensure within integer range
    comments: comments.slice(0, 1000), // Limit comments array
    is_published: mongoDoc.isPublished !== undefined ? Boolean(mongoDoc.isPublished) : true,
    reading_time: (mongoDoc.readingTime || '5 min read').substring(0, 50),
  };
}

async function migrateArticles() {
  let mongoClient: MongoClient | null = null;

  try {
    console.log('🚀 Starting migration from MongoDB to Supabase...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    mongoClient = new MongoClient(mongoUrl!);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = mongoClient.db('ARTICLES');
    const collection = db.collection('final_articles');

    // Count total documents
    const totalCount = await collection.countDocuments();
    console.log(`📊 Found ${totalCount} articles in MongoDB\n`);

    if (totalCount === 0) {
      console.log('⚠️  No articles found in MongoDB. Nothing to migrate.');
      return;
    }

    // Fetch all articles
    console.log('📥 Fetching articles from MongoDB...');
    const mongoArticles = await collection.find({}).toArray();
    console.log(`✅ Fetched ${mongoArticles.length} articles\n`);

    // Transform and insert into Supabase one at a time to avoid timeouts
    const batchSize = 1; // Insert one at a time to avoid timeout issues
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    console.log('📤 Inserting articles into Supabase (one at a time to avoid timeouts)...\n');

    for (let i = 0; i < mongoArticles.length; i += batchSize) {
      const batch = mongoArticles.slice(i, i + batchSize);
      const articleNumber = i + 1;
      const totalArticles = mongoArticles.length;

      const article = batch[0];
      console.log(`Processing article ${articleNumber}/${totalArticles}: "${article.title?.substring(0, 50) || 'Untitled'}..."`);

      try {
        // Transform article
        const transformed = transformArticle(article);

        // Validate required fields
        if (!transformed.slug) {
          throw new Error('Missing slug');
        }
        if (!transformed.title) {
          throw new Error('Missing title');
        }

        // Insert article into Supabase
        const { data, error } = await supabase
          .from('final_articles')
          .upsert(transformed, {
            onConflict: 'slug', // Update if slug already exists
          })
          .select()
          .single();

        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
          errorCount++;
          errors.push(`Article ${articleNumber} (${article.title}): ${error.message}`);
        } else {
          successCount++;
          console.log(`   ✅ Successfully inserted`);
        }
      } catch (err: any) {
        console.error(`   ❌ Error: ${err.message || err}`);
        errorCount++;
        errors.push(`Article ${articleNumber} (${article.title}): ${err.message || err}`);
      }

      // Small delay to avoid overwhelming Supabase
      if (i < mongoArticles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay between inserts
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   Total articles: ${mongoArticles.length}`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50) + '\n');

    if (errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      errors.forEach((error) => console.log(`   - ${error}`));
      console.log('');
    }

    // Verify data in Supabase
    console.log('🔍 Verifying data in Supabase...');
    const { count } = await supabase
      .from('final_articles')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Supabase now has ${count} articles\n`);

    if (successCount > 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('👉 Check your Supabase dashboard to verify the data.');
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run migration
migrateArticles()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
