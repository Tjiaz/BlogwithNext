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
  process.env.MONGODB_URI || "mongodb://localhost:27017/articles";

async function migrateArticles() {
  try {
    //conect to mongoDB
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    //conect to PostgreSQL
    const pgClient = await pgPool.connect();
    console.log("Connected to PostgreSQL");

    //Get articles from MongoDB
    const mongoArticles = await mongoose.connection.db
      .collection("articles")
      .find({})
      .toArray();
    console.log(`Found ${mongoArticles.length} articles to migrate`);

    //Prepare and execute insert statements for PostgreSQL
    for (const article of mongoArticles) {
      try {
        await pgClient.query(
          `INSERT INTO articles(title,content,author,date,description,filtered_images)
            VALUES ($1,$2,$3,$4,$5,$6, $7)`,
          [
            article.title,
            article.content,
            article.author,
            article.date,
            article.description || null,
            article.image || null,
            article.filtered_images || null,
          ]
        );
        console.log(`Migrated article: ${article.title}`);
      } catch (error) {
        console.error(
          `Error migrating article ${article.title}:`,
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
