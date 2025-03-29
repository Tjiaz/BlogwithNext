import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { authOptions } from "@/utils/auth";
import { MongoClient, ObjectId } from "mongodb";

// Helper function to extract images from content
const extractImagesFromContent = (content) => {
  const images = [];

  // Helper function to extract images from a string
  const extractImagesFromString = (str) => {
    // Regex for various image formats
    const imageRegexes = [
      /!$$.*?$$$$(.*?)$$/g, // Markdown image syntax
      /<img[^>]+src="?([^"\s]+)"?\s*\/?>]/gi, // HTML image tag
      /https?:\/\/\S+\.(?:jpg|jpeg|gif|png|webp)/gi, // Direct image URLs
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

    const body = await req.json();
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
    const extractedImages = extractImagesFromContent(content);
    const normalizedImages = extractedImages.map((img) =>
      img.startsWith("/")
        ? `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"
          }${img}`
        : img
    );

    // Connect to MongoDB
    const mongoClient = new MongoClient(process.env.DATABASE_URL);

    try {
      await mongoClient.connect();
      const db = mongoClient.db("ARTICLES");
      const topicsCollection = db.collection("Topic");

      // Find the topic document (try both name and title)
      const topicDocument = await topicsCollection.findOne({
        $or: [
          { name: `${topic.toLowerCase()}_articles` },
          { title: `${topic.toLowerCase()}_articles` },
        ],
      });

      if (!topicDocument) {
        // If topic doesn't exist, create it
        const newTopicResult = await topicsCollection.insertOne({
          name: `${topic.toLowerCase()}_articles`,
          title: `${topic.toLowerCase()}_articles`,
          articles: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log("New topic created:", newTopicResult);
      }

      // Create the new article document
      const articleDocument = {
        _id: new ObjectId(),
        title,
        description,
        content: content,
        date: new Date().toISOString(),
        author: session.user.email,
        filtered_images: normalizedImages,
        createdAt: new Date(),
      };

      console.log("Full content being stored:", content);
      console.log("Article document being created:", articleDocument);

      // Update the topic by pushing the new article
      const updateResult = await topicsCollection.updateOne(
        {
          $or: [
            { name: `${topic.toLowerCase()}_articles` },
            { title: `${topic.toLowerCase()}_articles` },
          ],
        },
        {
          $push: { articles: articleDocument },
          $set: { updatedAt: new Date() },
        }
      );

      console.log("Topic update result:", updateResult);

      // Verify the update
      const updatedTopic = await topicsCollection.findOne({
        $or: [
          { name: `${topic.toLowerCase()}_articles` },
          { title: `${topic.toLowerCase()}_articles` },
        ],
      });

      console.log("Updated topic:", updatedTopic);

      // Also create the article in Prisma
      const prismaArticle = await prisma.article.create({
        data: {
          title,
          description,
          content:
            typeof content === "object" ? JSON.stringify(content) : content,
          topic: topic.toLowerCase(),
          date: new Date().toISOString(),
          author: session.user.email,
          userId: user.id,
          filtered_images: normalizedImages
            ? JSON.stringify(normalizedImages)
            : null,
        },
      });

      return NextResponse.json(
        {
          message: "Article published successfully",
          mongoId: articleDocument._id,
          prismaId: prismaArticle.id,
          extractedImages: normalizedImages,
          topicUpdateResult: updateResult,
        },
        { status: 201 }
      );
    } finally {
      await mongoClient.close();
    }
  } catch (error) {
    console.error("Article creation error:", error);
    return NextResponse.json(
      {
        message: "Failed to create article",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
