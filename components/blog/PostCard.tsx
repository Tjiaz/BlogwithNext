import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Eye, Heart, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { BlogPost } from "@/lib/types";
import { getPostSlug, getBestImage } from "@/lib/utils";

interface PostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  // Get best image prioritizing hero_image and filtered_images (always returns default if none found)
  const imageUrl = getBestImage(post as any, (post as any).content);

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden ${
          featured ? "h-64 md:h-80" : "h-48"
        }`}
      >
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-800">
            {post.category}
          </span>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white text-sm">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{post.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <div className="flex items-center mr-4">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(post.publishedAt), "MMM dd, yyyy")}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {post.readingTime}
          </div>
        </div>

        <Link href={`/${getPostSlug(post)}`}>
          <h2
            className={`font-bold mb-3 text-gray-900 hover:text-[#0a73b0] transition-colors ${
              featured ? "text-2xl md:text-3xl" : "text-xl"
            }`}
          >
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author */}
        <div className="flex items-center">
          {post.authorImage && (
            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-white shadow-sm">
              <Image
                src={post.authorImage}
                alt={post.author}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{post.author}</p>
            <p className="text-sm text-gray-500">Author</p>
          </div>
        </div>
      </div>
    </article>
  );
}
