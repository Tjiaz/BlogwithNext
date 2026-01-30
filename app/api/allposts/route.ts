// GET /api/posts/all
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  await connectDB();
  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collA = db.collection("Articles");
    const collB = db.collection("Article");

    // fetch a reasonable number from each collection to merge and sort in JS
    const [docsA, docsB] = await Promise.all([
      collA
        .find({})
        .limit(300)
        .toArray()
        .catch(() => []),
      collB
        .find({})
        .limit(500)
        .toArray()
        .catch(() => []),
    ]);

    const normalized = [...docsA, ...docsB].map(normalizeDoc).filter(Boolean);

    // sort by date (newest first), docs without date go to the end
    normalized.sort((a: any, b: any) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    // return top 50 by default (client will slice as needed)
    const payload = normalized.slice(0, 50);

    return NextResponse.json({ posts: payload }, { status: 200 });
  } catch (err: any) {
    console.error("Error /api/posts:", err?.message || err);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}


function extractFirstImageFromHtml(html: any) {
  if (!html || typeof html !== "string") return null;
  const m = html.match(/<img[^>]+src=(?:'|")([^'"]+)(?:'|")/i);
  return m ? m[1] : null;
}

function normalizeDoc(doc: any) {
  const id = doc._id ? String(doc._id) : undefined;
  const title = doc.title || "";
  const author = doc.author || "Unknown";
  // try several date fields
  let date = null;
  const d = doc.date || doc.createdAt || doc.updatedAt || doc.migratedAt;
  try {
    date = d ? new Date(d) : null;
    if (date && isNaN(date.getTime())) date = null;
  } catch {
    date = null;
  }
  // excerpt: prefer description, else if content array use first text, else strip html
  let excerpt = "";
  if (doc.description) excerpt = String(doc.description);
  else if (Array.isArray(doc.content) && doc.content.length) {
    const first = doc.content[0];
    excerpt = typeof first === "string" ? first : JSON.stringify(first);
  } else if (typeof doc.content === "string") {
    excerpt = doc.content.replace(/<[^>]+>/g, "").slice(0, 300);
  }
  const topic = doc.topic || "";
  // try to get an image either from content html or from content array
  let image = null;
  if (typeof doc.content === "string")
    image = extractFirstImageFromHtml(doc.content);
  if (!image && Array.isArray(doc.content)) {
    for (const c of doc.content) {
      if (typeof c === "string") {
        const found = extractFirstImageFromHtml(c);
        if (found) {
          image = found;
          break;
        }
      }
    }
  }
  // fallback image null
  return {
    id,
    title,
    author,
    date: date ? date.toISOString() : null,
    excerpt,
    topic,
    image,
  };
}
