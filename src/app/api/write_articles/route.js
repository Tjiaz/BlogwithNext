import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { authOptions } from "@/utils/auth";
import { MongoClient, ObjectId } from "mongodb";

const extractImagesFromContent = (content) => {
  const images = [];

  try {
    // For ReactQuill HTML content
    if (typeof content === "string") {
      // This regex specifically targets img tags in HTML
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;

      while ((match = imgRegex.exec(content)) !== null) {
        if (match[1]) {
          images.push(match[1]);
        }
      }

      // If no images found with the first regex, try others
      if (images.length === 0) {
        // Try other patterns
        const otherPatterns = [
          /!$$.*?$$$$(.*?)$$/g, // Markdown image
          /https?:\/\/\S+\.(?:jpg|jpeg|gif|png|webp)/gi, // Direct URLs
        ];

        for (const pattern of otherPatterns) {
          while ((match = pattern.exec(content)) !== null) {
            if (match[1]) {
              images.push(match[1]);
            }
          }
        }
      }
    }

    return images;
  } catch (error) {
    console.error("Error extracting images:", error);
    return [];
  }
};

function removeBase64Images(html) {
  return html.replace(/<img[^>]+src=["']data:image\/[^"']+["'][^>]*>/gi, "");
}

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
    const { title, description, content, topic, author, date } = body;

    // Remove base64 images from content (extra safety)
    const cleanedContent = removeBase64Images(content);

    // Validate required fields
    if (!title || !description || !content || !topic || !author) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Validate and parse the incoming date
    let articleDate;
    if (date) {
      // Try to create a date object from the frontend input
      articleDate = new Date(date);
      // Check if the date is valid. If not, fall back to the current date.
      if (isNaN(articleDate.getTime())) {
        console.warn("Invalid date provided, using current date.");
        articleDate = new Date();
      }
    } else {
      // If no date is provided, use the current date
      articleDate = new Date();
    }

    // Convert the final date to an ISO string for consistent storage
    const dateToStore = articleDate.toISOString();

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Extract and normalize images
    const extractedImages = extractImagesFromContent(cleanedContent);
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
        content: cleanedContent,
        date: new Date().toISOString(), // 3. Use the validated date from the frontend (or current date)
        date: dateToStore,
        author: author,
        filtered_images: normalizedImages,
        createdAt: new Date(),
      };

      console.log(
        "Article document being created with date:",
        articleDocument.date
      );

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
            typeof content === "object"
              ? JSON.stringify(cleanedContent)
              : cleanedContent,
          topic: topic.toLowerCase(),
          // 4. Use the same validated date for Prisma
          date: dateToStore,
          author: author,
          userId: user.id,
          filtered_images: normalizedImages,
        },
      });

      return NextResponse.json(
        {
          message: "Article published successfully",
          mongoId: articleDocument._id,
          prismaId: prismaArticle.id,
          extractedImages: normalizedImages,
          publishedDate: dateToStore, // Send back the date that was used
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
