import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { authOptions } from "@/utils/auth";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";

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

    const { title, description, content, topic } = body;

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
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

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
      console.log(`Extracted ${extractedImages.length} images from content`);
    } catch (imageError) {
      console.error("Error extracting images:", imageError);
      // Continue without images if extraction fails
    }

    // Connect to MongoDB using connection pool
    console.log("Connecting to MongoDB...");
    const { db } = await connectToDatabase();
    const topicsCollection = db.collection("Topic");
    const articlesCollection = db.collection("Articles");

    // Create article document once
    const articleId = new ObjectId();
    const articleDate = new Date().toISOString();
    const normalizedTopic = topic.toLowerCase();

    const articleDocument = {
      _id: articleId,
      title,
      description,
      content: content,
      date: articleDate, // Keep for backward compatibility
      published_at: new Date(articleDate), // Primary date field
      author: session.user.email,
      topic: normalizedTopic,
      filtered_images: normalizedImages || [],
      createdAt: new Date(),
    };

    // Prepare operations to run in parallel
    const operations = [];

    // 1. Insert article into Articles collection (most important - for latest_articles API)
    operations.push(
      articlesCollection.insertOne(articleDocument).then(() => {
        console.log("Article inserted into Articles collection");
      })
    );

    // 2. Update/Create topic document (for backward compatibility)
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

    // 3. Create article in Prisma (run in parallel too)
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
            author: session.user.email,
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
    const prismaArticle = results[2]; // Prisma is the 3rd operation

    console.log("All database operations completed successfully");

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
