"use client";
import React, { useEffect, useState, useRef } from "react";
import { getPostSlug } from "@/lib/utils";
// import AdSenseRectangle from "@/components/ads/AdSenseRectangle";

const defaultPosts = [
  {
    id: "getting-started-ml",
    title: "Getting Started with Machine Learning",
    author: "Alice Johnson",
    date: "2024-08-01",
    topic: "Machine Learning",
    subtopic: "Introduction",
    excerpt:
      "A beginner-friendly walkthrough to build and evaluate your first ML model.",
    image: "/images/posts/post1.jpg",
  },
  {
    id: "python-best-practices",
    title: "Python Best Practices for Data Science",
    author: "Bob Smith",
    date: "2024-07-28",
    topic: "Programming",
    subtopic: "Python",
    excerpt:
      "Tips and patterns to write clean, efficient Python for data work.",
    image: "/images/posts/post2.jpg",
  },
  {
    id: "understanding-nn",
    title: "Understanding Neural Networks",
    author: "Clara Lee",
    date: "2024-07-15",
    topic: "AI",
    subtopic: "Neural Networks",
    excerpt:
      "Core concepts behind modern neural architectures explained simply.",
    image: "/images/posts/post3.jpg",
  },
  {
    id: "sql-optimization",
    title: "SQL Optimization Tips and Tricks",
    author: "Daniel Kim",
    date: "2024-06-30",
    topic: "Data Engineering",
    subtopic: "SQL",
    excerpt: "Practical approaches to speed up your queries and reduce costs.",
    image: "/images/posts/post4.jpg",
  },
  {
    id: "build-your-first-ai",
    title: "Building Your First AI Model",
    author: "Eve Martinez",
    date: "2024-06-10",
    topic: "AI",
    subtopic: "Practical",
    excerpt: "End-to-end guide from dataset to deployment for beginners.",
    image: "/images/posts/post5.jpg",
  },
  {
    id: "data-engineering-essentials",
    title: "Data Engineering Essentials",
    author: "Frank Nguyen",
    date: "2024-05-22",
    topic: "Data Engineering",
    subtopic: "Pipelines",
    excerpt: "Key concepts and tools to build reliable data pipelines.",
    image: "/images/posts/post6.jpg",
  },
  {
    id: "nlp-guide",
    title: "Natural Language Processing Guide",
    author: "Grace Park",
    date: "2024-05-05",
    topic: "NLP",
    subtopic: "Techniques",
    excerpt: "Core NLP tasks, libraries and workflows for real projects.",
    image: "/images/posts/post7.jpg",
  },
  {
    id: "computer-vision-python",
    title: "Computer Vision with Python",
    author: "Henry Zhao",
    date: "2024-04-15",
    topic: "Computer Vision",
    subtopic: "Implementation",
    excerpt: "Build image classification and detection systems using Python.",
    image: "/images/posts/post8.jpg",
  },
  {
    id: "mlops-best-practices",
    title: "MLOps Best Practices",
    author: "Isabella Rossi",
    date: "2024-03-30",
    topic: "MLOps",
    subtopic: "Production",
    excerpt:
      "Strategies to reliably deploy and monitor ML models in production.",
    image: "/images/posts/post9.jpg",
  },
  {
    id: "language-models-overview",
    title: "Language Models: An Overview",
    author: "Jack Wilson",
    date: "2024-02-18",
    topic: "Language Models",
    subtopic: "Overview",
    excerpt: "From classical n-grams to modern transformer-based LMs.",
    image: "/images/posts/post10.jpg",
  },
];

interface HeroSectionProps {
  initialPosts?: any[];
}

export default function HeroSection({ initialPosts = [] }: HeroSectionProps) {
  const itemsPerPage = 10;
  
  // Calculate initial totalPages from initialPosts to avoid hydration mismatch
  // Use a minimum of 1 to ensure consistent rendering
  const initialTotalPages = Math.max(1, initialPosts.length > 0 
    ? Math.ceil(initialPosts.length / itemsPerPage) 
    : Math.ceil(defaultPosts.length / itemsPerPage));
  
  const [posts, setPosts] = useState<any[]>(
    initialPosts.length > 0 ? initialPosts : defaultPosts,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialData = useRef(initialPosts.length > 0);
  const initialized = useRef(false);
  
  // Ensure we always have posts to render (prevents hydration mismatch)
  const currentPosts = posts.length > 0 ? posts : defaultPosts.slice(0, itemsPerPage);

  // Initialize with server-side data if available (only once on mount)
  useEffect(() => {
    if (!initialized.current && initialPosts.length > 0) {
      setPosts(initialPosts);
      hasInitialData.current = true;
      initialized.current = true;
      setTotalPages(Math.max(1, Math.ceil(initialPosts.length / itemsPerPage)));
      // Fetch actual total count from dedicated endpoint (reliable pagination)
      fetch("/api/posts/count")
        .then((res) => res.json())
        .then((json) => {
          const total = json?.total ?? 0;
          const pages = total > 0 ? Math.ceil(total / itemsPerPage) : 1;
          setTotalPages(Math.max(1, pages));
        })
        .catch(() => {});
    }
  }, []);

  // fetch posts from the server API for a specific page
  const loadPosts = async (page: number) => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `/api/posts?page=${page}&limit=${itemsPerPage}`
      );

      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();

      let fetched: any[] = [];
      if (json?.success && Array.isArray(json.data)) fetched = json.data;
      else if (Array.isArray(json.posts)) fetched = json.posts;
      else if (Array.isArray(json)) fetched = json;

      const mapped = fetched.map((p: any) => {
        const articleId = p._id ?? p.id;
        // Use image proxy for consistent loading (same as homepage initial)
        const imageUrl = articleId ? `/api/article-image?id=${articleId}` : "/images/azbyte.jpeg";

        return {
          id: articleId?.toString() ?? p.slug,
          _id: articleId,
          title: p.title ?? "",
          author: p.author ?? p.authorName ?? "Unknown",
          date: p.publishedAt ?? p.date ?? p.createdAt ?? null,
          excerpt: p.excerpt ?? p.description ?? p.summary ?? "",
          topic: p.topic ?? p.category ?? "",
          image: imageUrl,
        };
      });

      if (mapped.length) {
        setPosts(mapped);
      } else {
        setPosts([]); // no results for this page
      }

      // use API pagination info if available (never show "Page 1 of 0")
      if (json?.pagination) {
        const p = json.pagination.totalPages ?? Math.ceil((json.pagination.total || 0) / itemsPerPage);
        setTotalPages(Math.max(1, p));
      } else {
        const totalCount = json?.total || json?.pagination?.total || mapped.length;
        setTotalPages(Math.max(1, Math.ceil(totalCount / itemsPerPage)));
      }
    } catch (e) {
      console.error("Failed to load posts:", e);
      // keep existing posts (fallback / previous page)
    } finally {
      setIsLoading(false);
    }
  };

  // initial load + reload when page changes
  // Skip initial load if we have server-side data
  useEffect(() => {
    if (!hasInitialData.current || currentPage > 1) {
      loadPosts(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // optional: allow manual refresh triggers
  useEffect(() => {
    const onUpdate = () => loadPosts(currentPage);
    window.addEventListener("postsUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("postsUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [currentPage]);

  // Ensure consistent rendering between server and client
  // Always render the same structure to avoid hydration mismatches
  // Note: Don't use <main> here since we're already inside a <main> from layout.tsx
  // Remove wrapper div to match parent's grid column structure
  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 lg:p-8 w-full">
          {/* ...hero header omitted for brevity... */}

          <div className="mt-8 mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Latest Articles</h2>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Articles grid */}
          <div className="mt-6">
            {isLoading && (
              <div className="mb-4 text-sm text-gray-500">Loading...</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {currentPosts.map((post) => {
                const slug = getPostSlug(post);
                if (slug === "invalid-slug") return null;
                return (
                <article
                  key={post.id || post._id || slug}
                  className="border rounded-lg overflow-hidden flex flex-col bg-white dark:bg-gray-800"
                >
                  <div className="h-40 md:h-48 w-full overflow-hidden">
                    <img
                      src={post.image || "/images/azbyte.jpeg"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <a
                      href={`/${slug}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#0a73b0] transition-colors"
                    >
                      {post.title}
                    </a>

                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="mr-2">{post.author || "Unknown"}</span>•
                      <span className="mx-2">
                        {post.date
                          ? new Date(post.date).toLocaleDateString()
                          : ""}
                      </span>
                      <span className="text-xs inline-block ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {post.topic || ""}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {post.excerpt || ""}
                    </p>

                    <div className="mt-4 pt-2">
                      <a
                        href={`/${slug}`}
                        className="text-sm text-[#0a73b0] hover:text-[#2a9bd0] hover:underline transition-colors"
                      >
                        Read more →
                      </a>
                    </div>
                  </div>
                </article>
              );
              })}
            </div>


            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className={`px-4 py-2 rounded-md border ${
                  currentPage === 1 || isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Prev
              </button>

              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || isLoading}
                className={`px-4 py-2 rounded-md border ${
                  currentPage === totalPages || isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </section>
  );
}
