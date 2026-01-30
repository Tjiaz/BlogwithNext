// app/api/search/route.ts - Dedicated search endpoint with comprehensive MongoDB search
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("q") || searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    if (!searchTerm.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      });
    }

    // Escape special regex characters to prevent injection
    const escapedSearch = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Split search term into words for better matching
    const searchWords = escapedSearch.split(/\s+/).filter(word => word.length > 0);
    
    // Build comprehensive search query across all article fields
    const searchConditions: any[] = [];
    
    // For each word, search across all fields
    searchWords.forEach(word => {
      searchConditions.push(
        { title: { $regex: word, $options: "i" } },
        { description: { $regex: word, $options: "i" } },
        { content: { $regex: word, $options: "i" } },
        { topic: { $regex: word, $options: "i" } },
        { tags: { $regex: word, $options: "i" } },
        { author: { $regex: word, $options: "i" } },
        { category: { $regex: word, $options: "i" } },
        { excerpt: { $regex: word, $options: "i" } }
      );
    });

    // Build query: articles matching any of the search conditions
    const query = {
      $or: searchConditions.length > 0 ? searchConditions : [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { content: { $regex: escapedSearch, $options: "i" } },
        { topic: { $regex: escapedSearch, $options: "i" } },
        { tags: { $regex: escapedSearch, $options: "i" } },
        { author: { $regex: escapedSearch, $options: "i" } },
        { category: { $regex: escapedSearch, $options: "i" } },
        { excerpt: { $regex: escapedSearch, $options: "i" } }
      ]
    };

    console.log("🔍 Search query:", JSON.stringify(query));

    // Count total matching documents
    const total = await collection.countDocuments(query);

    // Fetch matching articles with relevance scoring
    const posts = await collection
      .find(query, {
        projection: {
          _id: 1,
          title: 1,
          description: 1,
          topic: 1,
          date: 1,
          author: 1,
          slug: 1,
          img: 1,
          tags: 1,
          category: 1,
          excerpt: 1,
          publishedAt: 1,
          // content: 0 - Don't send full content to keep response size manageable
        },
      })
      .sort({ date: -1 }) // Sort by date (newest first)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Process and sanitize results
    const sanitizedPosts = posts.map((post: any) => {
      const sanitized: any = {
        ...post,
        _id: post._id.toString(),
      };

      // Ensure slug is a string
      if (sanitized.slug) {
        if (typeof sanitized.slug !== 'string') {
          sanitized.slug = sanitized._id;
        } else if (sanitized.slug === '[object Object]' || sanitized.slug.includes('[object')) {
          sanitized.slug = sanitized._id;
        }
      } else {
        sanitized.slug = sanitized._id;
      }

      // Use date or publishedAt
      if (!sanitized.date && sanitized.publishedAt) {
        sanitized.date = sanitized.publishedAt;
      }

      return sanitized;
    });

    return NextResponse.json({
      success: true,
      data: sanitizedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      searchTerm: searchTerm.trim(),
    });
  } catch (error) {
    console.error("❌ SEARCH API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 500 }
    );
  }
}
