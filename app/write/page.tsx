"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/editor/RichTextEditor";

export default function WritePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    topic: "",
    tags: "",
    author: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Set default author from session when authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user && !formData.author) {
      setFormData((prev) => ({
        ...prev,
        author: session.user?.name || session.user?.email || "",
      }));
    }
  }, [status, session]);

  // Fetch topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoadingTopics(true);
        const response = await fetch("/api/topics");
        const data = await response.json();

        if (data.success && Array.isArray(data.topics)) {
          // Sort topics alphabetically for better UX
          const sortedTopics = [...data.topics].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base" }),
          );
          setTopics(sortedTopics);
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error);
        toast.error("Failed to load topics");
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a73b0] dark:border-blue-400"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate content - strip HTML tags and check if there's actual text
    const textContent = formData.content.replace(/<[^>]*>/g, "").trim();
    if (!textContent) {
      toast.error("Please add some content to your article");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...(coverImageUrl.trim()
            ? { hero_image: coverImageUrl.trim() }
            : {}),
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          author:
            formData.author ||
            session?.user?.name ||
            session?.user?.email ||
            "Anonymous",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      toast.success("Article created successfully!");
      // Use slug or id for navigation
      const articleSlug = data.data.slug || data.data.id || data.data._id;
      router.push(`/${articleSlug}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-[#0a73b0] dark:text-blue-400 hover:text-[#2a9bd0] dark:hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Write New Article
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none"
                placeholder="Enter article title"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none"
                placeholder="Brief description of your article"
              />
            </div>

            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Author *
              </label>
              <input
                id="author"
                type="text"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none"
                placeholder="Author name"
              />
            </div>

            <div>
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Topic *
              </label>
              {loadingTopics ? (
                <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0a73b0] dark:border-blue-400 mr-2"></div>
                  Loading topics...
                </div>
              ) : (
                <select
                  id="topic"
                  required
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer"
                >
                  <option value="">Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover image{" "}
                <span className="text-gray-500 dark:text-gray-400 font-normal">
                  (optional — used on cards and social previews)
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Upload a cover here, or rely on the first image you insert in the article body
                below.
              </p>
              <div className="flex flex-wrap items-start gap-4">
                {coverImageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="max-h-40 w-auto max-w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                      aria-label="Remove cover image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center w-full sm:w-48 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-[#0a73b0] dark:hover:border-blue-400 transition-colors ${
                      coverUploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden"
                      disabled={coverUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        setCoverUploading(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/upload-image", {
                            method: "POST",
                            body: fd,
                          });
                          const data = await res.json();
                          if (!res.ok || !data.success) {
                            throw new Error(data.error || "Upload failed");
                          }
                          setCoverImageUrl(data.url);
                          toast.success("Cover image uploaded");
                        } catch (err: unknown) {
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : "Cover upload failed",
                          );
                        } finally {
                          setCoverUploading(false);
                        }
                      }}
                    />
                    {coverUploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0a73b0] border-t-transparent" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Upload cover
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Content *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Start writing your article... Use the toolbar above to format your text, add headings, links, images, and videos."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] hover:opacity-90 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Publishing..." : "Publish Article"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
