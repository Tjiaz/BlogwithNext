import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { authOptions } from "@/utils/auth";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { notifySubscribersAboutNewArticle } from "@/utils/notifySubscribers";

// Helper function to extract images from content
const extractImagesFromContent = (content) => {
  const images = [];

  // Helper function to extract images from a string
  const extractImagesFromString = (str) => {
    // Regex for various image formats
    const imageRegexes = [
      /!\[.*?\]\((.*?)\)/g, // Markdown image syntax
      /<img[^>]+src=["']([^"'>]+)["'][^>]*>/gi, // HTML image tag (handles both single and double quotes, and base64)
      /https?:\/\/\S+\.(?:jpg|jpeg|gif|png|webp)/gi, // Direct image URLs
      /data:image\/[^;]+;base64,[^"\s<>]+/gi, // Base64 encoded images
    ];

    imageRegexes.forEach((regex) => {
      let match;
      while ((match = regex.exec(str)) !== null) {
        if (match[1] && !images.includes(match[1])) {
          images.push(match[1]);
        }
      }
    });
  };

  // Handle different content structures
  if (typeof content === "string") {
    extractImagesFromString(content);
  } else if (Array.isArray(content)) {
    content.forEach((section) => {
      if (section.paragraphs && Array.isArray(section.paragraphs)) {
        section.paragraphs.forEach((paragraph) => {
          if (typeof paragraph === "string") {
            extractImagesFromString(paragraph);
          }
        });
      }
    });
  }

  return images;
};

// Helper function to validate and normalize image URLs
const normalizeImageUrls = (images) => {
  return images
    .map((img) => {
      // Remove any relative paths or resolve them
      if (img.startsWith("/")) {
        return `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"
        }${img}`;
      }

      // Ensure it's a valid URL
      try {
        new URL(img);
        return img;
      } catch {
        return null;
      }
    })
    .filter((img) => img !== null);
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { message: "Invalid request data", error: parseError.message },
        { status: 400 }
      );
    }

    const { title, description, content, topic, authorName } = body;

    // Validate required fields
    if (!title || !description || !content || !topic) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Determine author name: use form value, fallback to user.name, then email
    const finalAuthorName = authorName?.trim() || user.name || session.user.email;

    // Extract and normalize images
    let extractedImages = [];
    let normalizedImages = [];
    try {
      extractedImages = extractImagesFromContent(content);
      normalizedImages = extractedImages.map((img) =>
        img.startsWith("/")
          ? `${
              process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"
            }${img}`
          : img
      );
      console.log(`[write_articles] Extracted ${extractedImages.length} images from content`);
      console.log(`[write_articles] Normalized images:`, normalizedImages.map(img => img.substring(0, 100)));
    } catch (imageError) {
      console.error("[write_articles] Error extracting images:", imageError);
      // Continue without images if extraction fails
    }

    // Connect to MongoDB using connection pool
    console.log("Connecting to MongoDB...");
    const { db } = await connectToDatabase();
    const topicsCollection = db.collection("Topic");
    const articlesCollection = db.collection("Articles");
    const finalArticlesCollection = db.collection("final_articles");

    // Create article document once
    const articleId = new ObjectId();
    const articleDate = new Date();
    const normalizedTopic = topic.toLowerCase().trim();
    
    // Log the topic normalization for debugging
    console.log(`[write_articles] Original topic: "${topic}", Normalized: "${normalizedTopic}"`);

    const articleDocument = {
      _id: articleId,
      title,
      description,
      content: content,
      date: articleDate.toISOString(), // Keep for backward compatibility (string format)
      published_at: articleDate, // Primary date field (Date object)
      author: finalAuthorName,
      topic: normalizedTopic,
      filtered_images: normalizedImages || [],
      source: "html_source", // Mark as HTML source (not RSS)
      createdAt: new Date(),
    };
    
    console.log(`[write_articles] Article document prepared:`, {
      title: articleDocument.title.substring(0, 50),
      topic: articleDocument.topic,
      published_at: articleDocument.published_at,
      source: articleDocument.source,
      filtered_images_count: articleDocument.filtered_images?.length || 0,
      filtered_images: articleDocument.filtered_images?.map(img => img.substring(0, 50)) || [],
    });

    // Prepare operations to run in parallel
    const operations = [];

    // 1. Insert article into final_articles collection (primary collection)
    operations.push(
      finalArticlesCollection.insertOne(articleDocument).then(() => {
        console.log("Article inserted into final_articles collection");
      })
    );

    // 2. Insert article into Articles collection (for backward compatibility)
    operations.push(
      articlesCollection.insertOne(articleDocument).then(() => {
        console.log("Article inserted into Articles collection");
      })
    );

    // 3. Update/Create topic document (for backward compatibility)
    operations.push(
      topicsCollection
        .updateOne(
          {
            $or: [
              { name: `${normalizedTopic}_articles` },
              { title: `${normalizedTopic}_articles` },
            ],
          },
          {
            $push: { articles: articleDocument },
            $set: { updatedAt: new Date() },
          },
          { upsert: true } // Create if doesn't exist
        )
        .then((result) => {
          console.log("Topic update result:", result);
        })
    );

    // 4. Create article in Prisma (run in parallel too)
    operations.push(
      prisma.article
        .create({
          data: {
            title,
            description,
            content:
              typeof content === "object" ? JSON.stringify(content) : content,
            topic: normalizedTopic,
            date: articleDate,
            author: finalAuthorName,
            userId: user.id,
            filtered_images:
              normalizedImages.length > 0
                ? JSON.stringify(normalizedImages)
                : null,
          },
        })
        .then((prismaArticle) => {
          console.log("Article created in Prisma:", prismaArticle.id);
          return prismaArticle;
        })
    );

    // Execute all operations in parallel
    const results = await Promise.all(operations);
    const prismaArticle = results[3]; // Prisma is the 4th operation

    console.log("All database operations completed successfully");

    // Prepare article data for notification (don't await - send in background)
    const articleForNotification = {
      id: articleId.toString(),
      title,
      description,
      author: finalAuthorName,
      topic: normalizedTopic,
      date: articleDate.toISOString(),
      filtered_images: normalizedImages,
      hero_image: normalizedImages?.[0] || null,
    };

    // Notify subscribers in the background (don't block the response)
    notifySubscribersAboutNewArticle(articleForNotification)
      .then((result) => {
        console.log("[write_articles] Notification result:", result);
      })
      .catch((error) => {
        console.error("[write_articles] Error notifying subscribers:", error);
        // Don't throw - we don't want notification failures to affect article creation
      });

    return NextResponse.json(
      {
        message: "Article published successfully",
        mongoId: articleId.toString(),
        prismaId: prismaArticle?.id || null,
        extractedImages: normalizedImages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Article creation error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        message: "Failed to create article",
        error: error.message || "Unknown error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
