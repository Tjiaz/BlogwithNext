// scripts/check-articles.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking Article model...\n");

  const count = await prisma.article.count();
  console.log(`Total Articles: ${count}\n`);

  if (count > 0) {
    const sample = await prisma.article.findFirst();
    console.log("Sample Article:");
    console.log(JSON.stringify(sample, null, 2));

    console.log("\n--- Field Summary ---");
    console.log("Has title:", !!sample.title);
    console.log("Has author:", !!sample.author);
    console.log("Has date:", !!sample.date);
    console.log("Has topic:", !!sample.topic);
    console.log("Has filtered_images:", !!sample.filtered_images);
    console.log("Has img:", !!sample.img);
    console.log("Has content:", !!sample.content);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
