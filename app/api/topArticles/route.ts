import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { extractFirstImageFromContent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    // Get top articles sorted by date (newest first)
    // Include content to extract images
    const articles = await collection
      .find({}, { maxTimeMS: 5000 })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const processedResults = articles.map((article) => {
      // Prioritize hero_image and filtered_images for cover image
      const filteredImage =
        article.filtered_images &&
        Array.isArray(article.filtered_images) &&
        article.filtered_images.length > 0
          ? article.filtered_images[0]
          : null;

      // Determine the best image to use
      let imageUrl =
        article.hero_image ||
        filteredImage ||
        article.img ||
        article.featuredImage ||
        article.image ||
        article.imageUrl ||
        null;

      // Only extract from content if no other image source exists
      if (
        (!imageUrl || imageUrl === "" || imageUrl === null) &&
        article.content
      ) {
        const extractedImage = extractFirstImageFromContent(article.content);
        if (extractedImage) {
          imageUrl = extractedImage;
        }
      }

      // Use default image if no image found
      if (!imageUrl || imageUrl === "" || imageUrl === null) {
        imageUrl = "/images/azbyte.jpeg";
      }

      return {
        id: article._id.toString(),
        _id: article._id.toString(),
        title: article.title,
        description: article.description,
        author: article.author || "",
        date: article.date || article.publishedAt || "",
        topic: article.topic || "",
        img: imageUrl,
      };
    });

    return NextResponse.json(processedResults);
  } catch (error: any) {
    console.error("Error fetching top articles:", error);
    if (error.name === "MongoNetworkTimeoutError" || error.name === "MongoServerSelectionError") {
      console.error("❌ MongoDB connection timeout - returning empty array");
    }
    return NextResponse.json([], { status: 200 });
  }
}
