"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

interface LikeButtonProps {
  slug: string;
  initialLikes: number;
  initialLiked?: boolean;
}

export default function LikeButton({
  slug,
  initialLikes,
  initialLiked = false,
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has already liked this article
  useEffect(() => {
    if (typeof window !== "undefined") {
      const likedArticles = JSON.parse(
        localStorage.getItem("likedArticles") || "[]",
      );
      setLiked(likedArticles.includes(slug));
    }
  }, [slug]);

  const handleLike = async () => {
    if (isLoading) return;

    // Check if already liked
    const likedArticles = JSON.parse(
      localStorage.getItem("likedArticles") || "[]",
    );
    const isCurrentlyLiked = likedArticles.includes(slug);

    setIsLoading(true);

    try {
      const action = isCurrentlyLiked ? "unlike" : "like";
      const response = await fetch(
        `/api/posts/${encodeURIComponent(slug)}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Update local state
        setLikes(data.likes || likes);
        setLiked(!isCurrentlyLiked);

        // Update localStorage
        if (isCurrentlyLiked) {
          const updated = likedArticles.filter((id: string) => id !== slug);
          localStorage.setItem("likedArticles", JSON.stringify(updated));
        } else {
          likedArticles.push(slug);
          localStorage.setItem("likedArticles", JSON.stringify(likedArticles));
        }

        // Update UI
        const likeElement = document.querySelector('[data-like-count]');
        if (likeElement) {
          likeElement.textContent = `${data.likes} likes`;
        }
      } else {
        toast.error(data.error || "Failed to update like");
      }
    } catch (error) {
      console.error("Failed to like article:", error);
      toast.error("Failed to like article. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1 transition-colors ${
        liked
          ? "text-red-500 hover:text-red-600"
          : "text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      aria-label={liked ? "Unlike this article" : "Like this article"}
    >
      <Heart
        className={`w-4 h-4 transition-all ${
          liked ? "fill-current" : ""
        } ${isLoading ? "animate-pulse" : ""}`}
      />
      <span data-like-count>{likes}</span>
      <span className="hidden sm:inline">likes</span>
    </button>
  );
}
