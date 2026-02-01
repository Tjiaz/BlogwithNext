// Supabase query helpers - Converted from MongoDB queries
import { supabase } from './supabase';

export interface Article {
  id: string;
  _id?: string; // For backward compatibility
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  topic?: string;
  category?: string;
  tags?: string[];
  author?: string;
  authorName?: string;
  date?: string;
  publishedAt?: string;
  createdAt?: string;
  img?: string;
  featuredImage?: string;
  image?: string;
  imageUrl?: string;
  hero_image?: string;
  filtered_images?: string[];
  content?: string;
  views?: number;
  likes?: number;
}

/**
 * Get homepage data - fetches articles for hero, recent posts, and popular articles
 */
export async function getHomepageData() {
  try {
    console.log('🔍 [getHomepageData] Starting Supabase query...');
    
    // Fetch up to 22 articles (10 hero + 8 recent + 4 popular)
    const { data: articles, error } = await supabase
      .from('final_articles')
      .select('id, title, slug, description, excerpt, summary, topic, category, date, published_at, created_at, author, author_name, img, featured_image, image, image_url, hero_image, filtered_images')
      .eq('is_published', true)
      .order('date', { ascending: false, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(22);

    if (error) {
      console.error('❌ [getHomepageData] Supabase error:', error);
      return { heroPosts: [], recentPosts: [], popularArticles: [] };
    }

    if (!articles || articles.length === 0) {
      console.log('⚠️ [getHomepageData] No articles found');
      return { heroPosts: [], recentPosts: [], popularArticles: [] };
    }

    console.log(`✅ [getHomepageData] Fetched ${articles.length} articles from Supabase`);

    // Transform articles to match expected format
    const transformedArticles = articles.map((article: any) => {
      // Get best image
      const bestImage = article.hero_image || 
                       (article.filtered_images && article.filtered_images.length > 0 ? article.filtered_images[0] : null) ||
                       article.img || 
                       article.featured_image || 
                       article.image || 
                       article.image_url || 
                       null;

      return {
        _id: article.id,
        id: article.id,
        title: article.title || '',
        slug: article.slug || article.id,
        description: article.description || article.excerpt || '',
        excerpt: article.excerpt || article.description || '',
        summary: article.summary || '',
        topic: article.topic || article.category || '',
        category: article.category || article.topic || '',
        date: article.date || article.published_at || article.created_at || '',
        publishedAt: article.published_at || article.date || article.created_at || '',
        createdAt: article.created_at || article.published_at || article.date || '',
        author: article.author || article.author_name || 'Unknown',
        authorName: article.author_name || article.author || 'Unknown',
        img: bestImage,
        featuredImage: article.featured_image || bestImage,
        image: article.image || bestImage,
        imageUrl: article.image_url || bestImage,
        hero_image: article.hero_image || bestImage,
        filtered_images: article.filtered_images || [],
      };
    });

    // Sort by date (most recent first)
    transformedArticles.sort((a, b) => {
      const dateA = new Date(a.date || a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Split into sections
    const heroPosts = transformedArticles.slice(0, 10);
    const recentPosts = transformedArticles.slice(0, 8);
    const popularArticles = transformedArticles.slice(0, 4);

    return { heroPosts, recentPosts, popularArticles };
  } catch (error: any) {
    console.error('❌ [getHomepageData] Failed to fetch homepage data:', error);
    return { heroPosts: [], recentPosts: [], popularArticles: [] };
  }
}

/**
 * Get a single article by slug or ID
 */
export async function getArticle(slug: string): Promise<Article | null> {
  try {
    console.log('🔍 [getArticle] Fetching article with slug:', slug);

    // Try to find by slug first
    let { data: article, error } = await supabase
      .from('final_articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    // If not found by slug, try by ID (UUID)
    if (error || !article) {
      const { data: articleById, error: errorById } = await supabase
        .from('final_articles')
        .select('*')
        .eq('id', slug)
        .eq('is_published', true)
        .single();

      if (errorById || !articleById) {
        console.log('❌ [getArticle] Article not found for slug:', slug);
        return null;
      }

      article = articleById;
    }

    console.log('✅ [getArticle] Found article:', article.title);

    // Transform to match expected format
    return {
      id: article.id,
      _id: article.id,
      title: article.title,
      slug: article.slug,
      description: article.description || '',
      excerpt: article.excerpt || '',
      summary: article.summary || '',
      topic: article.topic || article.category || '',
      category: article.category || article.topic || '',
      date: article.date || article.published_at || article.created_at || '',
      publishedAt: article.published_at || article.date || article.created_at || '',
      createdAt: article.created_at || '',
      author: article.author || article.author_name || 'Unknown',
      authorName: article.author_name || article.author || 'Unknown',
      img: article.img || article.featured_image || article.image || article.image_url || article.hero_image || null,
      featuredImage: article.featured_image || article.img || article.image || article.image_url || article.hero_image || null,
      image: article.image || article.img || article.featured_image || article.image_url || article.hero_image || null,
      imageUrl: article.image_url || article.img || article.featured_image || article.image || article.hero_image || null,
      hero_image: article.hero_image || article.img || article.featured_image || article.image || article.image_url || null,
      filtered_images: article.filtered_images || [],
      content: article.content || '',
      views: article.views || 0,
      likes: article.likes || 0,
    };
  } catch (error: any) {
    console.error('❌ [getArticle] Error fetching article:', error);
    return null;
  }
}
