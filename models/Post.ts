import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for TypeScript
export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage?: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  featuredImage: string;
  isPublished: boolean;
  readingTime: string;
  views: number;
  likes: number;
  comments: Array<{
    user: string;
    text: string;
    createdAt: Date;
  }>;
}

// Schema definition
const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true, // keep index here (field-level)
    },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorImage: { type: String },
    publishedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    tags: [{ type: String, lowercase: true }],
    category: { type: String, required: true, lowercase: true },
    featuredImage: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    readingTime: { type: String, default: "5 min read" },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: [
      {
        user: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    collection: "Article", // ← This is what handles updatedAt automatically
  }
);

// Indexes
// PostSchema.index({ slug: 1 });
// PostSchema.index({ publishedAt: -1 });
// PostSchema.index({ category: 1, publishedAt: -1 });
// PostSchema.index({ tags: 1 });
// PostSchema.index({ isPublished: 1 });

// Prevent model recompilation in dev/SSR environments
const Post: Model<Document> =
  (mongoose.models && (mongoose.models.Post as Model<Document>)) ||
  mongoose.model("Post", PostSchema);

export default Post;
