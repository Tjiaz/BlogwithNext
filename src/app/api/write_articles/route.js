import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { authOptions } from "@/utils/auth";
import { MongoClient } from "mongodb";

// Map to ensure consistent collection names
const TOPIC_COLLECTION_MAP = {
  nlp: "NLP_articles",
  ai: "Artificial_intelligence_articles",
  career_advice: "career_advice_articles",
  computer_vision: "computer_vision_articles",
  data_engineer: "data_engineer_articles",
  data_science: "data_science_articles",
  language_model: "language_model_articles",
  machine_learning: "machine_learning_articles",
  machine_learning_ops: "machine_learning_ops_articles",
  programming: "programming_articles",
  python: "py_articles",
  sql: "SQL_articles",
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

    // Get the correct collection name from the map
    const collectionName = TOPIC_COLLECTION_MAP[topic.toLowerCase()];

    if (!collectionName) {
      return NextResponse.json({ message: "Invalid topic" }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Connect to MongoDB
    const mongoClient = new MongoClient(process.env.DATABASE_URL);

    try {
      await mongoClient.connect();
      const db = mongoClient.db("ARTICLES");
      const collection = db.collection(collectionName);

      // Create the new article document
      const articleDocument = {
        title,
        description,
        content,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        author: session.user.email,
        filtered_images: [], // Add if you have images
        createdAt: new Date(),
      };

      // Insert the article into the appropriate collection
      const result = await collection.insertOne(articleDocument);

      // Also create the article in Prisma (if you still want to maintain this)
      const prismaArticle = await prisma.article.create({
        data: {
          title,
          description,
          content:
            typeof content === "object" ? JSON.stringify(content) : content,
          topic: topic.toLowerCase(),
          date: new Date(),
          author: session.user.email,
          userId: user.id,
        },
      });

      return NextResponse.json(
        {
          message: "Article published successfully",
          mongoId: result.insertedId,
          prismaId: prismaArticle.id,
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
