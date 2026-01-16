import { connectToDatabase } from "@/utils/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const finalArticlesCollection = db.collection("final_articles");

    // Search for articles with partial title matches
    const searchTerms = [
      "Making Python Programs Blazingly Fast",
      "Differences Between Coding in Data Science",
      "Python For Everybody",
      "A Simple Way to Time Code in Python",
      "GitHub Actions For Machine Learning",
      "New Ways of Sharing Code Blocks",
      "7 Ways ChatGPT Makes You Code",
      "Data Scientists, You Need to Know How to Code",
      "Top Programming Languages",
      "Master The Art Of Command Line",
      "Top 5 AI Coding Assistants",
      "Write Clean Python Code Using Pipes",
      "5 Rules For Good Data Science Project Documentation",
      "5 Crucial Steps to Develop an Effective Coding Routine",
      "How to Conduct Time Series Analysis in R",
      "Build an Effective Data Analytics Team",
      "14 Essential Git Commands"
    ];

    const queries = searchTerms.map(term => ({
      title: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: "i" }
    }));

    const articles = await finalArticlesCollection
      .find({
        $or: queries
      })
      .project({
        _id: 1,
        title: 1,
        topic: 1,
        topic_id: 1
      })
      .toArray();

    return Response.json({
      found: articles.length,
      articles: articles.map(a => ({
        _id: a._id?.toString() || a._id,
        title: a.title,
        topic: a.topic,
        topic_id: a.topic_id?.toString() || a.topic_id
      }))
    });
  } catch (error) {
    return Response.json({
      error: error.message
    }, { status: 500 });
  }
}
