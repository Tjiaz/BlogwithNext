// Supabase query helpers - Converted from MongoDB queries
import { supabase } from "./supabase";

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
    // Simplified query matching the working topic pages query
    // Remove timeout race - let Supabase handle it naturally
    const startTime = Date.now();
    
    const { data: articles, error } = await supabase
      .from("final_articles")
      .select(
        "id, title, slug, description, excerpt, summary, topic, category, date, published_at, created_at, author, author_name, img, featured_image, image, image_url, hero_image, filtered_images"
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(22);

    const elapsed = Date.now() - startTime;

    if (error) {
      console.error(
        `❌ [getHomepageData] Supabase error after ${elapsed}ms:`,
        error.message || error,
        JSON.stringify(error, null, 2)
      );
      return { heroPosts: [], recentPosts: [], popularArticles: [] };
    }

    if (!articles || articles.length === 0) {
      console.log(`⚠️ [getHomepageData] No articles found after ${elapsed}ms`);
      // Try a simpler query to see if RLS is blocking
      const { data: anyArticles, error: anyError } = await supabase
        .from("final_articles")
        .select("id, title, is_published")
        .limit(5);
      
      console.log(`🔍 [getHomepageData] Debug - Any articles (any status):`, anyArticles?.length || 0);
      if (anyError) {
        console.error(`🔍 [getHomepageData] Debug query error:`, anyError.message);
      }
      
      return { heroPosts: [], recentPosts: [], popularArticles: [] };
    }

    console.log(
      `✅ [getHomepageData] Fetched ${articles.length} articles in ${elapsed}ms`
    );

    // Transform articles efficiently (articles already sorted by published_at DESC)
    const transformedArticles = articles.map((article: any) => {
      // Get best image (prioritize hero_image and filtered_images)
      const bestImage =
        article.hero_image ||
        (Array.isArray(article.filtered_images) &&
        article.filtered_images.length > 0
          ? article.filtered_images[0]
          : null) ||
        article.img ||
        article.featured_image ||
        article.image ||
        article.image_url ||
        null;

      return {
        _id: article.id,
        id: article.id,
        title: article.title || "",
        slug: article.slug || article.id,
        description: article.description || article.excerpt || "",
        excerpt: article.excerpt || article.description || "",
        summary: article.summary || "",
        topic: article.topic || article.category || "",
        category: article.category || article.topic || "",
        date: article.date || article.published_at || article.created_at || "",
        publishedAt:
          article.published_at || article.date || article.created_at || "",
        createdAt:
          article.created_at || article.published_at || article.date || "",
        author: article.author || article.author_name || "Unknown",
        authorName: article.author_name || article.author || "Unknown",
        img: bestImage,
        featuredImage: article.featured_image || bestImage,
        image: article.image || bestImage,
        imageUrl: article.image_url || bestImage,
        hero_image: article.hero_image || bestImage,
        filtered_images: article.filtered_images || [],
      };
    });

    // Articles are already sorted by published_at DESC from the query
    // Split into sections
    const heroPosts = transformedArticles.slice(0, 10);
    const recentPosts = transformedArticles.slice(0, 8);
    const popularArticles = transformedArticles.slice(0, 4);

    return { heroPosts, recentPosts, popularArticles };
  } catch (error: any) {
    console.error("❌ [getHomepageData] Failed to fetch homepage data:", error);
    return { heroPosts: [], recentPosts: [], popularArticles: [] };
  }
}

/**
 * Get articles by year
 */
export async function getArticlesByYear(years: number[], limit: number = 5) {
  try {
    const results: Record<number, any[]> = {};

    for (const year of years) {
      const startOfYear = `${year}-01-01T00:00:00.000Z`;
      const startOfNextYear = `${year + 1}-01-01T00:00:00.000Z`;

      // Query for articles in this year (check both date and published_at fields)
      // Use or() with proper syntax: "field1.gte.value1,field1.lt.value2,field2.gte.value1,field2.lt.value2"
      const { data: articles, error } = await supabase
        .from("final_articles")
        .select(
          "id, title, description, author, author_name, date, published_at, topic, category, img, featured_image, image, image_url, hero_image, filtered_images"
        )
        .eq("is_published", true)
        .or(
          `and(date.gte.${startOfYear},date.lt.${startOfNextYear}),and(published_at.gte.${startOfYear},published_at.lt.${startOfNextYear})`
        )
        .order("date", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(limit * 2); // Get more to filter properly

      if (error) {
        console.error(`❌ [getArticlesByYear] Error for year ${year}:`, error);
        continue;
      }

      if (articles && articles.length > 0) {
        // Filter to ensure articles are actually in the year range
        const filteredArticles = articles
          .filter((article: any) => {
            const articleDate = article.date || article.published_at;
            if (!articleDate) return false;
            const date = new Date(articleDate);
            const yearStart = new Date(startOfYear);
            const yearEnd = new Date(startOfNextYear);
            return date >= yearStart && date < yearEnd;
          })
          .slice(0, limit);

        if (filteredArticles.length > 0) {
          results[year] = filteredArticles.map((article: any) => ({
            id: article.id,
            title: article.title,
            description: article.description,
            author: article.author || article.author_name || "",
            date: article.date || article.published_at || "",
            topic: article.topic || article.category || "",
            img:
              article.img ||
              article.featured_image ||
              article.image ||
              article.image_url ||
              article.hero_image ||
              null,
          }));
        }
      }
    }

    return years
      .map((year) => ({
        year,
        articles: results[year] || [],
      }))
      .filter((yearData) => yearData.articles.length > 0);
  } catch (error: any) {
    console.error("❌ [getArticlesByYear] Error:", error);
    return [];
  }
}

/**
 * Get top articles with pagination
 */
export async function getTopArticles(page: number = 1, limit: number = 5) {
  try {
    const skip = (page - 1) * limit;

    const { data: articles, error } = await supabase
      .from("final_articles")
      .select(
        "id, title, description, author, author_name, date, published_at, topic, category, img, featured_image, image, image_url, hero_image, filtered_images, content"
      )
      .eq("is_published", true)
      .order("date", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false })
      .range(skip, skip + limit - 1);

    if (error) {
      console.error("❌ [getTopArticles] Supabase error:", error);
      return [];
    }

    if (!articles) return [];

    return articles.map((article: any) => {
      const filteredImage =
        article.filtered_images &&
        Array.isArray(article.filtered_images) &&
        article.filtered_images.length > 0
          ? article.filtered_images[0]
          : null;

      let imageUrl =
        article.hero_image ||
        filteredImage ||
        article.img ||
        article.featured_image ||
        article.image ||
        article.image_url ||
        null;

      if (!imageUrl && article.content) {
        // Extract image from content if needed (you can import extractFirstImageFromContent here)
        // For now, just use default
      }

      if (!imageUrl) {
        imageUrl = "/images/azbyte.jpeg";
      }

      return {
        id: article.id,
        _id: article.id,
        title: article.title,
        description: article.description,
        author: article.author || article.author_name || "",
        date: article.date || article.published_at || "",
        topic: article.topic || article.category || "",
        img: imageUrl,
      };
    });
  } catch (error: any) {
    console.error("❌ [getTopArticles] Error:", error);
    return [];
  }
}

/**
 * Get articles with search, pagination, and filtering
 */
export async function getArticles(params: {
  page?: number;
  limit?: number;
  search?: string;
  topic?: string;
}) {
  try {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    let query = supabase
      .from("final_articles")
      .select(
        "id, title, slug, description, excerpt, topic, category, date, published_at, created_at, author, author_name, img, featured_image, image, image_url, hero_image, filtered_images, tags, content",
        { count: "exact" }
      )
      .eq("is_published", true);

    // Apply topic filter (case-insensitive exact match)
    if (params.topic) {
      query = query.or(
        `topic.ilike.${params.topic},category.ilike.${params.topic}`
      );
    }

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.trim();
      // Use ilike for case-insensitive search
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,topic.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`
      );
    }

    // Order by date
    query = query
      .order("date", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false });

    // Apply pagination
    const {
      data: articles,
      error,
      count,
    } = await query.range(skip, skip + limit - 1);

    if (error) {
      console.error("❌ [getArticles] Supabase error:", error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    if (!articles) {
      return { data: [], total: count || 0, page, limit, totalPages: 0 };
    }

    // Transform articles
    const transformedArticles = articles.map((article: any) => {
      const bestImage =
        article.hero_image ||
        (article.filtered_images && article.filtered_images.length > 0
          ? article.filtered_images[0]
          : null) ||
        article.img ||
        article.featured_image ||
        article.image ||
        article.image_url ||
        null;

      return {
        _id: article.id,
        id: article.id,
        title: article.title,
        slug: article.slug || article.id,
        description: article.description,
        excerpt: article.excerpt,
        topic: article.topic || article.category || "",
        category: article.category || article.topic || "",
        date: article.date || article.published_at || article.created_at || "",
        publishedAt:
          article.published_at || article.date || article.created_at || "",
        createdAt: article.created_at || "",
        author: article.author || article.author_name || "Unknown",
        img: bestImage,
        featuredImage: article.featured_image || bestImage,
        image: article.image || bestImage,
        tags: article.tags || [],
        content: article.content || "", // Include content for image extraction
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: transformedArticles,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error: any) {
    console.error("❌ [getArticles] Error:", error);
    return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  }
}

/**
 * Get a single article by slug or ID
 */
export async function getArticle(slug: string): Promise<Article | null> {
  try {
    console.log("🔍 [getArticle] Fetching article with slug:", slug);

    // Try to find by slug first
    let { data: article, error } = await supabase
      .from("final_articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    // If not found by slug, try by ID (UUID)
    if (error || !article) {
      const { data: articleById, error: errorById } = await supabase
        .from("final_articles")
        .select("*")
        .eq("id", slug)
        .eq("is_published", true)
        .single();

      if (errorById || !articleById) {
        console.log("❌ [getArticle] Article not found for slug:", slug);
        return null;
      }

      article = articleById;
    }

    console.log("✅ [getArticle] Found article:", article.title);

    // Transform to match expected format
    return {
      id: article.id,
      _id: article.id,
      title: article.title,
      slug: article.slug,
      description: article.description || "",
      excerpt: article.excerpt || "",
      summary: article.summary || "",
      topic: article.topic || article.category || "",
      category: article.category || article.topic || "",
      date: article.date || article.published_at || article.created_at || "",
      publishedAt:
        article.published_at || article.date || article.created_at || "",
      createdAt: article.created_at || "",
      author: article.author || article.author_name || "Unknown",
      authorName: article.author_name || article.author || "Unknown",
      img:
        article.img ||
        article.featured_image ||
        article.image ||
        article.image_url ||
        article.hero_image ||
        null,
      featuredImage:
        article.featured_image ||
        article.img ||
        article.image ||
        article.image_url ||
        article.hero_image ||
        null,
      image:
        article.image ||
        article.img ||
        article.featured_image ||
        article.image_url ||
        article.hero_image ||
        null,
      imageUrl:
        article.image_url ||
        article.img ||
        article.featured_image ||
        article.image ||
        article.hero_image ||
        null,
      hero_image:
        article.hero_image ||
        article.img ||
        article.featured_image ||
        article.image ||
        article.image_url ||
        null,
      filtered_images: article.filtered_images || [],
      content: article.content || "",
      views: article.views || 0,
      likes: article.likes || 0,
    };
  } catch (error: any) {
    console.error("❌ [getArticle] Error fetching article:", error);
    return null;
  }
}
