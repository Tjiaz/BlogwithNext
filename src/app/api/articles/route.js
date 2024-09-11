import { PrismaClient } from '@prisma/client';

// Create separate Prisma clients for each database inside the cluster
const prismaDb1 = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_DB1, // Database 1 connection string
    },
  },
});

const prismaDb2 = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_DB2, // Database 2 connection string
    },
  },
});

// Fetch articles function
async function fetchArticlesFromDb(prismaClient) {
  return await prismaClient.article.findMany({
    orderBy: {
      date: 'desc',
    },
    take: 15, // Fetch the 15 most recent articles from each database
    include: {
      content: true, // Fetch related content
    },
  });
}

export async function GET(req) {
  try {
    // Fetch articles from multiple databases
    const [articlesDb1, articlesDb2] = await Promise.all([
      fetchArticlesFromDb(prismaDb1),
      fetchArticlesFromDb(prismaDb2),
    ]);

    // Combine articles from both databases
    const allArticles = [...articlesDb1, ...articlesDb2];

    // Randomize the order of the combined articles
    const shuffledArticles = allArticles.sort(() => 0.5 - Math.random());

    // Select the 15 most recent articles from the shuffled array
    const paginatedArticles = shuffledArticles.slice(0, 15);

    return new Response(JSON.stringify(paginatedArticles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return new Response(JSON.stringify({ error: 'Unable to fetch articles' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    await prismaDb1.$disconnect();
    await prismaDb2.$disconnect();
  }
}