import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

// Helper function to extract images from content
const extractImagesFromContent = (content) => {
  const images = [];

  if (Array.isArray(content)) {
    content.forEach((section) => {
      if (section.paragraphs && Array.isArray(section.paragraphs)) {
        section.paragraphs.forEach((paragraph) => {
          // Use regex to find image URLs
          const imageRegex = /!$$.*?$$$$(.*?)$$/g; // Markdown image syntax
          const htmlImageRegex = /<img[^>]+src="?([^"\s]+)"?\s*\/?>]/gi; // HTML image tag

          let match;

          // Check Markdown image syntax
          while ((match = imageRegex.exec(paragraph)) !== null) {
            if (match[1] && !images.includes(match[1])) {
              images.push(match[1]);
            }
          }

          // Check HTML image tag
          while ((match = htmlImageRegex.exec(paragraph)) !== null) {
            if (match[1] && !images.includes(match[1])) {
              images.push(match[1]);
            }
          }
        });
      }
    });
  }

  return images;
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;
  const databaseName = "ARTICLES";

  try {
    await client.connect();
    const collection = client.db(databaseName).collection("Topic");

    // Fetch all articles from the Topic collection
    const topics = await collection.find().toArray();

    if (!Array.isArray(topics)) {
      throw new Error("Expected an array of topics");
    }
    console.log("=== DEBUGGING ARTICLE RETRIEVAL ===");
    console.log(`Total Topics Found: ${topics.length}`);

    let results = [];
    let seenArticles = new Set();

    // Combine articles from all topics
    topics.forEach((topic) => {
      if (Array.isArray(topic.articles)) {
        console.log("Articles in this topic:", topic.articles.length);
        topic.articles.forEach((article) => {
          const articleKey = `${article.title}-${article.date}`;
          if (!seenArticles.has(articleKey)) {
            seenArticles.add(articleKey);

            results.push({
              ...article,
              topic: topic.name,
            });
            // Log the article details
            console.log(`Article: ${article.title}, Date: ${article.date}`);
          }
        });
      }
    });
    // Log the sorted results
    console.log("=== SORTED ARTICLES ===");
    results.forEach((article) => {
      console.log(`Article: ${article.title}, Date: ${article.date}`);
    });

    const parseDate = (dateString) => {
      return new date(
        dateString.replace(/(\w{3}) (\d{2}),(\d{4})/, "$2 $1 $3")
      );
    };
    // Sort all combined articles by date
    results.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateB - dateA;
    });

    // Apply pagination after deduplication
    const paginatedArticles = results.slice(skip, skip + limit);

    // Log the paginated results
    console.log("=== PAGINATED ARTICLES ===");
    paginatedArticles.forEach((article) => {
      console.log(`Article: ${article.title}, Date: ${article.date}`);
    });

    // Process the results
    const processedResults = paginatedArticles.map((article) => {
      // Extract images from content if filtered_images is empty
      const extractedImages =
        article.filtered_images && article.filtered_images.length > 0
          ? article.filtered_images
          : extractImagesFromContent(article.content);

      return {
        ...article,
        filtered_images: extractedImages,
        title: article.title,
        description: article.description,
        author: article.author,
        date: article.date,
        content: article.content,
        topic: article.topic,
        id: article._id.toString(),
      };
    });

    return new Response(JSON.stringify(processedResults), { status: 200 });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching articles" }),
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
