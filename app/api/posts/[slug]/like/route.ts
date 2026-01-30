import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { action } = body; // "like" or "unlike"
    
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    let post: any = null;

    // Try by ObjectId first
    if (ObjectId.isValid(slug)) {
      try {
        const objectId = new ObjectId(slug);
        post = await collection.findOne({ _id: objectId });
      } catch (e) {
        console.error("Error searching by ObjectId:", e);
      }
    }

    // Try by string _id
    if (!post) {
      try {
        post = await collection.findOne({ _id: slug as any });
      } catch (e) {
        console.error("Error searching by string _id:", e);
      }
    }

    // Try by slug field
    if (!post) {
      post = await collection.findOne({ slug: slug });
    }

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Initialize likes field if it doesn't exist
    if (post.likes === undefined || post.likes === null) {
      await collection.updateOne(
        { _id: post._id },
        { $set: { likes: 0 } },
      );
    }

    // Increment or decrement likes atomically
    const increment = action === "like" ? 1 : action === "unlike" ? -1 : 0;
    
    if (increment !== 0) {
      const result = await collection.updateOne(
        { _id: post._id },
        { $inc: { likes: increment } },
      );

      if (result.modifiedCount > 0) {
        // Fetch updated post to return new like count
        const updatedPost = await collection.findOne({ _id: post._id });
        return NextResponse.json({
          success: true,
          likes: updatedPost?.likes || (post.likes || 0) + increment,
          action: action,
        });
      }
    }

    return NextResponse.json({
      success: true,
      likes: post.likes || 0,
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
