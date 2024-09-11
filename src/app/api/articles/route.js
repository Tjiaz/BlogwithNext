import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        date: 'desc',
      },
    //   take: 15, // Fetch the 15 most recent articles
    });
    
    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Unable to fetch articles' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}