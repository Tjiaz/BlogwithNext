"use client";

import {
  Share2,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

export default function SocialShare({
  title,
  url,
  description,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || "");
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only update URL if we're on the client and no URL was provided
    if (typeof window !== "undefined" && !url) {
      setShareUrl(window.location.href);
    }
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setHasNativeShare(!!navigator.share);
    }
  }, [url]);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-[#0a73b0] dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Share this article
        </h3>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handleShare("facebook")}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare("twitter")}
          className="p-2 bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
          aria-label="Share on X"
          title="Share on X"
        >
          <XIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare("linkedin")}
          className="p-2 text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: "#4D9FD1" }}
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </button>
        <button
          onClick={handleCopyLink}
          className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          aria-label="Copy link"
          title={copied ? "Copied!" : "Copy link"}
        >
          {copied ? (
            <Copy className="w-5 h-5" />
          ) : (
            <LinkIcon className="w-5 h-5" />
          )}
        </button>
        {mounted && hasNativeShare && (
          <button
            onClick={handleNativeShare}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            aria-label="Share"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
