import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  try {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set");
      return new Response(
        JSON.stringify({
          articles: [],
          totalCount: 0,
          page: 1,
          totalPages: 0,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { db } = await connectToDatabase();

    // Use Articles collection - fetch all and sort in JavaScript for reliability
    const collection = db.collection("Articles");

    // Fetch articles with projection (faster than aggregation for mixed date types)
    const allArticles = await Promise.race([
      collection
        .find(
          {},
          {
            projection: {
              _id: 1,
              title: 1,
              description: 1,
              author: 1,
              date: 1,
              topic: 1,
              filtered_images: 1,
            },
          }
        )
        .toArray(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), 8000)
      ),
    ]);

    // Sort articles by date in JavaScript (handles mixed date formats reliably)
    const sortedArticles = allArticles.sort((a, b) => {
      const parseDate = (dateValue) => {
        if (!dateValue) return new Date(0);
        if (dateValue instanceof Date) return dateValue;
        if (typeof dateValue === "string") {
          // Try ISO format first
          if (dateValue.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
            const isoDate = new Date(dateValue);
            if (!isNaN(isoDate.getTime())) return isoDate;
          }
          // Try human-readable format "Mar 22, 2024"
          const humanDate = new Date(dateValue);
          if (!isNaN(humanDate.getTime())) return humanDate;
        }
        return new Date(0); // Fallback
      };

      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB.getTime() - dateA.getTime(); // Descending (newest first)
    });

    // Apply pagination
    const articles = sortedArticles.slice(skip, skip + limit);

    // Skip totalCount to save time - can be calculated client-side if needed
    // const totalCount = await collection.countDocuments();

    // Process results
    const processedResults = articles.map((article) => ({
      id: article._id.toString(),
      _id: article._id.toString(), // Include _id for backward compatibility
      title: article.title,
      description: article.description,
      author: article.author,
      date: article.date,
      topic: article.topic,
      filtered_images: article.filtered_images || [],
    }));

    return new Response(
      JSON.stringify({
        articles: processedResults,
        totalCount: processedResults.length, // Approximate count
        page,
        totalPages: Math.ceil(processedResults.length / limit),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error fetching latest articles:",
      error.message,
      error.stack
    );
    // Return empty array instead of error to prevent frontend issues
    return new Response(
      JSON.stringify({
        articles: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
