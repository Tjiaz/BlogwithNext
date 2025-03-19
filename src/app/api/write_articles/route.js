import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { authOptions } from "@/utils/auth";
import { MongoClient, ObjectId } from "mongodb";

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

    // Connect to MongoDB
    const mongoClient = new MongoClient(process.env.DATABASE_URL);

    try {
      await mongoClient.connect();
      const db = mongoClient.db("ARTICLES");
      const topicsCollection = db.collection("Topic");

      // Find the topic document
      const topicDocument = await topicsCollection.findOne({
        name: `${topic.toLowerCase()}_articles`,
      });

      if (!topicDocument) {
        return NextResponse.json(
          { message: "Topic not found" },
          { status: 404 }
        );
      }

      // Create the new article document
      const articleDocument = {
        _id: new ObjectId(),
        title,
        description,
        content,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        author: session.user.email,
        filtered_images: [],
        createdAt: new Date(),
        content: [
          {
            heading: title,
            paragraphs: [description],
          },
        ],
      };

      // Update the topic document by pushing the new article
      const result = await topicsCollection.updateOne(
        { _id: topicDocument._id },
        {
          $push: {
            articles: articleDocument,
          },
        }
      );

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
          mongoId: articleDocument._id,
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
