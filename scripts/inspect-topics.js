// scripts/inspect-topics.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all Topics with full details...\n");

  const topics = await prisma.topic.findMany();

  topics.forEach((topic, index) => {
    console.log(`Topic ${index + 1}:`);
    console.log("  ID:", topic.id);
    console.log("  Title:", topic.title);
    console.log("  Title type:", typeof topic.title);
    console.log("  Title length:", topic.title?.length);
    console.log("  Description:", topic.description);
    console.log("  Raw:", JSON.stringify(topic));
    console.log("---");
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
