import { MongoClient } from 'mongodb';



const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);


export async function GET(req) {
         const { searchParams } = new URL(req.url);
         const page=parseInt(searchParams.get('page'),8) || 1; // Default to 1 if page is not provided
         const limit = 8; // Number of articles per page
         const skip = (page - 1) * limit; // Calculate how many articles to skip
         
         const databaseName = 'ARTICLES';  // Your MongoDB database name

         try {
            await client.connect();
            const collectionsToQuery = ['Artificial_intelligence_articles'
                ,'NLP_articles','SQL_articles','career_advice_articles',
                'computer_vision_article','data_engineer_article',
                'data_science_articles','language_model_articles',
                'machine_learning_articles','machine_learning_ops_articles',
                'programming_articles']

            

            let results = []
            for (const collectionName of collectionsToQuery) { 
                const collection = client.db(databaseName).collection(collectionName);

               
                
                // Fetch articles sorted by date in descending order
                const latest_articles = await collection
                .find({})
                .sort({ date: -1 }) // Sort by date, newest first
                .toArray();

                results.push(...latest_articles);


            }
            
            // Sort all combined articles by date
            results.sort((a,b)=> new Date(b.date) - new Date(a.date))

            const paginatedArticles = results.slice(skip, skip + limit)
           

        

            // Process the results as needed (e.g., deduplicate, format)
            const processedResults = paginatedArticles.map((article) => { 
                // Modify the article structure as desired
                return { 
                    filtered_images:article.filtered_images,
                    title:article.title,
                    description:article.description,
                    author:article.author,
                    date:article.date,
                    content:article.content

                }
            })
            return new Response(JSON.stringify(processedResults),{status:200})

            }
         catch (error) {
                console.error("Error fetching articles:", error);
                return new Response(JSON.stringify({ message: "Error fetching articles" }), { status: 500 });
            } 
         finally {
                 await client.close();
                }

}