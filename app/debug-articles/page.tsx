import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function DebugArticles() {
  try {
    const client = await clientPromise;
    const db = client.db("ARTICLES");
    const collection = db.collection("Article");

    const articles = await collection.find({}).limit(10).toArray();

    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Debug: Articles in Database</h1>
        <p className="mb-4">Total articles found: {articles.length}</p>
        <div className="space-y-4">
          {articles.map((article: any) => (
            <div key={article._id.toString()} className="p-4 border rounded">
              <p><strong>_id:</strong> {article._id.toString()}</p>
              <p><strong>Title:</strong> {article.title || "No title"}</p>
              <p><strong>Slug:</strong> {article.slug || "No slug"}</p>
              <a
                href={`/${article._id.toString()}`}
                className="text-blue-600 hover:underline"
              >
                Test Link: /{article._id.toString()}
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Debug: Error</h1>
        <pre className="bg-red-100 p-4 rounded">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}

