// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { extractFirstImageFromContent } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { title, description, content, topic, tags, author } = body;

    if (!title || !description || !content || !topic) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Extract first image from content to use as cover image
    const extractedImage = extractFirstImageFromContent(content);

    const newPost = {
      title,
      description,
      content,
      topic,
      tags: tags || [],
      author: author || session.user?.name || session.user?.email,
      date: new Date(),
      publishedAt: new Date(),
      img: extractedImage || null,
      views: 0,
      likes: 0,
      comments: [],
      slug,
    };

    const result = await collection.insertOne(newPost);

    return NextResponse.json({
      success: true,
      data: {
        ...newPost,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("❌ POST API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  console.log("🔵 /api/posts hit");
  try {
    const client = await clientPromise;
    console.log("🟢 Mongo connected");
    const db = client.db("ARTICLES");

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10); // default 12
    const search = searchParams.get("search");
    const topic = searchParams.get("topic");

    const skip = (page - 1) * limit;

    // 👉 Only use final_articles collection
    const collection = db.collection("final_articles");

    // Build query
    const query: any = {};

    if (topic) {
      query.topic = { $regex: `^${topic}$`, $options: "i" }; // case-insensitive exact match
    }

    if (search) {
      const s = search.trim();
      // Escape special regex characters
      const escapedSearch = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Build comprehensive search query across multiple fields
      query.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { content: { $regex: escapedSearch, $options: "i" } },
        { topic: { $regex: escapedSearch, $options: "i" } },
        { tags: { $regex: escapedSearch, $options: "i" } },
        { author: { $regex: escapedSearch, $options: "i" } },
        { category: { $regex: escapedSearch, $options: "i" } },
        { excerpt: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    console.log("📊 Query to Mongo:", JSON.stringify(query));

    // Count total docs matching query with timeout
    const total = await collection.countDocuments(query, { maxTimeMS: 5000 });

    // 👉 IMPORTANT: project only the fields needed on the homepage
    // Include content temporarily to extract images, then remove it from response
    // Note: We fetch all matching documents, sort them, then paginate
    // This ensures proper date-based sorting across all date field variations
    const allPosts = await collection
      .find(query, {
        projection: {
          _id: 1,
          title: 1,
          description: 1,
          topic: 1,
          date: 1,
          publishedAt: 1,
          createdAt: 1,
          author: 1,
          slug: 1,
          img: 1,
          featuredImage: 1,
          image: 1,
          imageUrl: 1,
          hero_image: 1,
          filtered_images: 1,
          tags: 1,
          category: 1,
          excerpt: 1,
          content: 1, // Include content to extract images
        },
        maxTimeMS: 5000, // Query timeout: fail after 5 seconds (Vercel has 10s limit)
      })
      .toArray();

    // Sort by date in descending order (newest first)
    // Handles multiple date field names and formats
    allPosts.sort((a: any, b: any) => {
      const dateA = new Date(
        a.date || a.publishedAt || a.createdAt || 0,
      ).getTime();
      const dateB = new Date(
        b.date || b.publishedAt || b.createdAt || 0,
      ).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    // Apply pagination after sorting
    const posts = allPosts.slice(skip, skip + limit);

    console.log(
      `📤 Returning ${posts.length} posts (page ${page}, limit ${limit}, total ${total})`,
    );

    // Ensure all slugs are strings and not objects, and extract images from content
    const sanitizedPosts = posts.map((post: any) => {
      const sanitized = { ...post };
      // Convert _id to string if it's an ObjectId
      if (sanitized._id) {
        sanitized._id = sanitized._id.toString();
      }
      // Ensure slug is a string, not an object
      if (sanitized.slug) {
        if (typeof sanitized.slug !== "string") {
          // If slug is an object, use _id instead
          sanitized.slug =
            sanitized._id?.toString() || sanitized.id?.toString() || "";
        } else if (
          sanitized.slug === "[object Object]" ||
          sanitized.slug.includes("[object")
        ) {
          // If slug is the string "[object Object]", replace with _id
          sanitized.slug =
            sanitized._id?.toString() || sanitized.id?.toString() || "";
        }
      } else {
        // If no slug, use _id
        sanitized.slug =
          sanitized._id?.toString() || sanitized.id?.toString() || "";
      }

      // Prioritize hero_image and filtered_images for cover image
      const filteredImage =
        sanitized.filtered_images &&
        Array.isArray(sanitized.filtered_images) &&
        sanitized.filtered_images.length > 0
          ? sanitized.filtered_images[0]
          : null;

      // Determine the best image to use
      const bestImage =
        sanitized.hero_image ||
        filteredImage ||
        sanitized.img ||
        sanitized.featuredImage ||
        sanitized.image ||
        sanitized.imageUrl ||
        null;

      // If we have a valid image from the above sources, use it
      if (bestImage && bestImage !== "/images/azbyte.jpeg") {
        sanitized.img = bestImage;
      } else if (
        !bestImage &&
        sanitized.content &&
        typeof sanitized.content === "string"
      ) {
        // Only extract from content if no other image source exists
        const extractedImage = extractFirstImageFromContent(sanitized.content);
        if (extractedImage) {
          sanitized.img = extractedImage;
        }
      }

      // Use default image if no image found
      if (!sanitized.img || sanitized.img === "" || sanitized.img === null) {
        sanitized.img = "/images/azbyte.jpeg";
      }

      // Remove content from response to keep it manageable (we only needed it for image extraction)
      delete sanitized.content;

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
    });
  } catch (error: any) {
    console.error("❌ POSTS API ERROR:", error);
    // Return empty results instead of 500 error to prevent frontend crashes
    if (error.name === "MongoNetworkTimeoutError" || error.name === "MongoServerSelectionError") {
      console.error("❌ MongoDB connection timeout - returning empty results");
      return NextResponse.json(
        {
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 12,
            totalPages: 0,
          },
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
