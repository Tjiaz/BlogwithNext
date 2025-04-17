require("dotenv").config();
const mongoose = require("mongoose");
const { Pool } = require("pg");

// PostgreSQL connection
const pgPool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "articles",
  password: process.env.PGPASSWORD || "yourpassword",
  port: parseInt(process.env.PGPORT || "5432"),
});

const mongoUri =
  "mongodb+srv://Olatunji:Olatunji@cluster0.8e6lboe.mongodb.net/ARTICLES?retryWrites=true&w=majority&appName=Cluster0";

async function migrateArticles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    mongoose.set("debug", true); // Enable query debugging
    console.log("Connected to MongoDB");

    // Connect to PostgreSQL
    const pgClient = await pgPool.connect();
    console.log("Connected to PostgreSQL");

    // Get articles from MongoDB
    const mongoArticles = await mongoose.connection.db
      .collection("Article")
      .find({})
      .toArray();

    console.log(`Found ${mongoArticles.length} articles to migrate`);

    for (const article of mongoArticles) {
      try {
        // Skip documents with missing required fields
        if (!article.title) {
          console.error("Skipping article due to missing title:", article);
          continue;
        }

        await pgClient.query(
          `INSERT INTO articles(title, content, author, date, description, image, filtered_images)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            article.title,
            article.content || null, // Use null if content is missing
            article.author || null, // Use null if author is missing
            article.date || null, // Use null if date is missing
            article.description || null, // Use null if description is missing
            null, // Placeholder for "image" (not present in MongoDB)
            null, // Placeholder for "filtered_images" (not present in MongoDB)
          ]
        );
        console.log(`Migrated article: ${article.title}`);
      } catch (error) {
        console.error(
          `Error migrating article ${article.title || "unknown"}:`,
          error.message
        );
      }
    }
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error.message);
  } finally {
    // Close connections
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    await pgPool.end();
    console.log("PostgreSQL connection closed");
  }
}

migrateArticles();
