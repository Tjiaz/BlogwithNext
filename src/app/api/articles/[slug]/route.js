import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export async function GET(req, { params }) {
  const { slug } = params;  // Get the topic slug from the URL params
  const databaseName = 'ARTICLES';  // Your MongoDB database name
  const collectionName = `${slug}_articles`;  // Dynamically create the collection name based on the topic

  console.log("Received slug:", slug);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    
    const db = client.db(databaseName);  // Access the correct database
    console.log(`Using database: ${databaseName}`);

    const collection = db.collection(collectionName);  // Access the collection dynamically based on slug
    console.log(`Fetching from collection: ${collectionName}`);

    const article = await collection.find().toArray();  // Find the first article in the collection
    console.log("Fetched article:", article);

    if (!article) {
      console.error("No article found.");
      return new Response(JSON.stringify({ error: 'Article Not Found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(article), {
      status: 200,
    });

  } catch (error) {
    console.error("Error fetching article:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch article' }), {
      status: 500,
    });
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}