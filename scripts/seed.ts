import { connectDB } from "@/lib/db";
import Post from "@/models/Post";

const samplePosts = [
  {
    title: "Getting Started with Next.js 15",
    slug: "getting-started-with-nextjs-15",
    excerpt:
      "Learn the new features and improvements in Next.js 15, including React 19 support and performance enhancements.",
    content: "Next.js 15 brings exciting new features...",
    author: "Alex Johnson",
    category: "technology",
    tags: ["nextjs", "react", "javascript", "webdev"],
    featuredImage:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop",
    isPublished: true,
    readingTime: "5 min read",
    views: 1250,
    likes: 89,
  },
  // Add more sample posts as needed
];

async function seed() {
  try {
    await connectDB();

    // Clear existing posts
    await Post.deleteMany({});

    // Insert sample posts
    await Post.insertMany(samplePosts);

    console.log("✅ Database seeded successfully!");
    console.log(`✅ Created ${samplePosts.length} sample posts`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
