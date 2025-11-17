// import { MongoClient } from "mongodb";
// const uri = process.env.DATABASE_URL;
// const client = new MongoClient(uri);



// export async function GET(req) {
//     try{
//         await client.connect();
//         const collection = client.db("ARTICLES").collection("Topic");

//         //Get today's date in the same format as your article dates
//         const today = new Date();
//         const todayString = today.toLocaleDateString("en-US", {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//         });

//         //Fetch all topics 
//         const topics = await collection.find().toArray();

//         let featuredArticles = [];

//         //Find articles published today
//         topics.forEach((topic)=> { 
//             if(Array.isArray(topic.articles)){
//                 topic.articles.forEach((article)=>{
//                     if(article.date === todayString){
//                         featuredArticles.push({
//                             ...article,
//                             topic: topic.name,
//                             url: `${process.env.NEXT_PUBLIC_DOMAIN}/article_details/${article._id.toString()}`
//                         });
//                     }
//                 });
//             }
//         });
    
//   // If no articles today, get the most recent articles
//    if (featuredArticles.length === 0) {
//       let allArticles = [];
//       topics.forEach((topic) => {
//         if (Array.isArray(topic.articles)) {
//           allArticles = allArticles.concat(
//             topic.articles.map(article => ({
//               ...article,
//               topic: topic.name,
//               url: `${process.env.NEXT_PUBLIC_DOMAIN}/article_details/${article._id.toString()}`
//             }))
//           );
//         }
//       });

//       // Sort by date and take the 3 most recent
//       allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
//       featuredArticles = allArticles.slice(0, 3);
//     }
//      return new Response(JSON.stringify(featuredArticles), { status: 200 });
//  } catch (error) {
//     console.error("Error fetching featured articles:", error);
//     return new Response(JSON.stringify({ message: "Error fetching featured articles" }), { 
//       status: 500 
//     });
//   } finally {
//     await client.close();
//   }
// }


import { getFeaturedArticles } from "../../../utils/featuredArticles.js";

// app/api/featured/route.js
import { getFeaturedArticles } from "@/lib/featuredArticles.js";

export async function GET() {
  try {
    const featuredArticles = await getFeaturedArticles();

    return new Response(JSON.stringify(featuredArticles), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching featured articles" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
