import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

const extractImagesFromContent = (content) => {
  const images = new Set(); // Use a Set to avoid duplicates

  // Helper function to extract images from a string
  const extractImagesFromString = (str) => {
    if (typeof str !== "string") return;

    // More comprehensive image extraction regexes
    const imageRegexes = [
      /https?:\/\/[^\s]+?\.(?:jpg|jpeg|gif|png|webp|svg)/gi, // Direct image URLs
      /<img[^>]+src=["']([^"']+)["']/gi, // HTML img tags
      /!$$.*?$$$$(https?:\/\/[^\s]+?\.(?:jpg|jpeg|gif|png|webp|svg))$$/gi, // Markdown image syntax
    ];

    imageRegexes.forEach((regex) => {
      let match;
      while ((match = regex.exec(str)) !== null) {
        if (match[1]) {
          // Normalize the URL
          const normalizedUrl = match[1].startsWith("/")
            ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"}${
                match[1]
              }`
            : match[1];

          images.add(normalizedUrl);
        }
      }
    });
  };

  // Handle different content structures
  if (typeof content === "string") {
    extractImagesFromString(content);
  } else if (Array.isArray(content)) {
    content.forEach((section) => {
      if (typeof section === "string") {
        extractImagesFromString(section);
      } else if (section && section.paragraphs) {
        section.paragraphs.forEach((paragraph) => {
          if (typeof paragraph === "string") {
            extractImagesFromString(paragraph);
          }
        });
      }
    });
  }

  return Array.from(images);
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
