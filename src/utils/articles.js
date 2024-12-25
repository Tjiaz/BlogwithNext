import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to fetch articles by slug (e.g., ai, data-science)
export async function getArticleBySlug(slug) {
  const article = await prisma.article.findFirst({
    where: {
      topic: slug.replace('-', ' ') // Convert slug to topic name, e.g. "data-science" -> "Data Science"
    },
    include: {
      content: true, // Assuming your article has a relation with content
    },
  });

  return article;
}

// Function to fetch all articles (used in getStaticPaths)
export async function getAllArticles() {
  const articles = await prisma.article.findMany();
  return articles;
}