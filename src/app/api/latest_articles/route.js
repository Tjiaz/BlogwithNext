import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);


export async function GET(req) {
         const { searchParams } = new URL(req.url);
         searchParams.get('page') || 1; // Get the page number from query
         const limit = 8; // Number of articles per page
         const skip = (page - 1) * limit; // Calculate how many articles to skip
         const databaseName = 'ARTICLES';  // Your MongoDB database name

         try {
            await client.connect();
            const collection = client.db(databaseName).collection("articles");

        

            // Fetch articles sorted by date in descending order
            const latest_articles = await collection
                .find({})
                .sort({ date: -1 }) // Sort by date, newest first
                .skip(skip)
                .limit(limit)
                .toArray();

            return new Response(JSON.stringify({latest_articles}),{status:200})

            }
         catch (error) {
                console.error("Error fetching articles:", error);
                return new Response(JSON.stringify({ message: "Error fetching articles" }), { status: 500 });
            } 
         finally {
                 await client.close();
                }

}