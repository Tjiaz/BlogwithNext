import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    let post: any = null;

    // Try by ObjectId first
    if (ObjectId.isValid(slug)) {
      post = await collection.findOne({ _id: new ObjectId(slug) });
    }

    // Try by slug field
    if (!post) {
      post = await collection.findOne({ slug: slug });
    }

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      comments: post.comments || [],
    });
  } catch (error) {
    console.error("❌ GET COMMENTS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST a new comment or reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await req.json();
    const { text, parentId, emoji } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment text is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("final_articles");

    let post: any = null;

    // Try by ObjectId first
    if (ObjectId.isValid(slug)) {
      post = await collection.findOne({ _id: new ObjectId(slug) });
    }

    // Try by slug field
    if (!post) {
      post = await collection.findOne({ slug: slug });
    }

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    const newComment = {
      _id: new ObjectId().toString(),
      user: session.user.name || session.user.email || "Anonymous",
      userEmail: session.user.email || "",
      userImage: session.user.image || "",
      text: text.trim(),
      emoji: emoji || null,
      createdAt: new Date(),
      replies: [],
      likes: 0,
      parentId: parentId || null,
    };

    if (parentId) {
      // This is a reply - find the parent comment and add reply
      const comments = post.comments || [];
      
      // Find parent comment index
      const parentIndex = comments.findIndex((c: any) => c._id === parentId);
      
      if (parentIndex === -1) {
        return NextResponse.json(
          { success: false, error: "Parent comment not found" },
          { status: 404 }
        );
      }

      // Initialize replies array if it doesn't exist
      if (!comments[parentIndex].replies) {
        comments[parentIndex].replies = [];
      }

      // Add reply to parent comment
      comments[parentIndex].replies.push(newComment);

      // Update the document
      await collection.updateOne(
        { _id: post._id },
        {
          $set: { comments: comments },
        }
      );
    } else {
      // This is a top-level comment
      await collection.updateOne(
        { _id: post._id },
        {
          $push: { comments: newComment },
        }
      );
    }

    // Fetch updated comments
    const updatedPost = await collection.findOne({ _id: post._id });

    return NextResponse.json({
      success: true,
      comment: newComment,
      comments: updatedPost?.comments || [],
    });
  } catch (error) {
    console.error("❌ POST COMMENT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
