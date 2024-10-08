import { MongoClient } from "mongodb";

// Function to fetch topic details based on the slug
async function getTopicDetails(slug) {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const collectionsToQuery = [
      "Artificial_intelligence_articles",
      "NLP_articles",
      "SQL_articles",
      "career_advice_articles",
      "computer_vision_articles",
      "data_engineer_articles",
      "data_science_articles",
      "language_model_articles",
      "machine_learning_articles",
      "machine_learning_ops_articles",
      "programming_articles",
    ];

    let topicDetails = null;

    for (const collectionName of collectionsToQuery) {
      const collection = client.db("ARTICLES").collection(collectionName);

      // Find the article by slug
      const article = await collection.findOne({ slug: slug });

      if (article) {
        topicDetails = {
          title: article.title,
          content: article.content,
          author: article.author,
          date: article.date,
        };
        break; // Stop searching once you find the article
      }
    }

    return topicDetails;
  } finally {
    await client.close();
  }
}

// Page component for the article details
export default async function ArticleDetails({ params }) {
  const { slug } = params; // Extract slug from the URL params
  const topicDetails = await getTopicDetails(slug); // Fetch topic details

  if (!topicDetails) {
    return <div>No topic details found for {slug}</div>;
  }

  return (
    <div>
      <h1>{topicDetails.title}</h1>
      {topicDetails.content.map((section, index) => (
        <div key={index}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      ))}
      <p>
        <strong>Author:</strong> {topicDetails.author}
      </p>
      <p>
        <strong>Date:</strong> {topicDetails.date}
      </p>
    </div>
  );
}
