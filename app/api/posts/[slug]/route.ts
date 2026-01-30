import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    console.log("🔵 API: Fetching post with slug:", slug);

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    // Try to find by _id first (if slug is a valid ObjectId)
    let post = null;
    if (ObjectId.isValid(slug)) {
      console.log("🔵 API: Slug is valid ObjectId, searching by _id");
      post = await collection.findOne({ _id: new ObjectId(slug) });
      if (post) {
        console.log("🔵 API: Found post by _id (ObjectId)");
      } else {
        console.log("🔵 API: No post found by _id (ObjectId)");
      }
    } else {
      console.log("🔵 API: Slug is not a valid ObjectId");
    }

    // If not found by _id, try to find by slug field
    if (!post) {
      console.log("🔵 API: Searching by slug field");
      post = await collection.findOne({ slug: slug });
      if (post) {
        console.log("🔵 API: Found post by slug");
      } else {
        console.log("🔵 API: No post found by slug");
      }
    }

    if (!post) {
      // Debug: List some document IDs
      const sampleDocs = await collection.find({}).limit(3).toArray();
      console.log(
        "🔵 API: Sample document IDs:",
        sampleDocs.map((d) => d._id.toString()),
      );

      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
          debug: {
            searchedSlug: slug,
            isValidObjectId: ObjectId.isValid(slug),
            sampleIds: sampleDocs.map((d) => d._id.toString()),
          },
        },
        { status: 404 },
      );
    }

    // Convert _id to string
    const postData = {
      ...post,
      _id: post._id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: postData,
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
