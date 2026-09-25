"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getPostSlug } from "@/lib/utils";
import { getTopicBadgeStyle } from "@/lib/topic-colors";

const defaultPosts = [
  {
    id: "getting-started-ml",
    title: "Getting Started with Machine Learning",
    author: "Alice Johnson",
    date: "2024-08-01",
    topic: "Machine Learning",
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
    excerpt: "Practical approaches to speed up your queries and reduce costs.",
    image: "/images/posts/post4.jpg",
  },
  {
    id: "build-your-first-ai",
    title: "Building Your First AI Model",
    author: "Eve Martinez",
    date: "2024-06-10",
    topic: "AI",
    excerpt: "End-to-end guide from dataset to deployment for beginners.",
    image: "/images/posts/post5.jpg",
  },
  {
    id: "data-engineering-essentials",
    title: "Data Engineering Essentials",
    author: "Frank Nguyen",
    date: "2024-05-22",
    topic: "Data Engineering",
    excerpt: "Key concepts and tools to build reliable data pipelines.",
    image: "/images/posts/post6.jpg",
  },
  {
    id: "nlp-guide",
    title: "Natural Language Processing Guide",
    author: "Grace Park",
    date: "2024-05-05",
    topic: "NLP",
    excerpt: "Core NLP tasks, libraries and workflows for real projects.",
    image: "/images/posts/post7.jpg",
  },
  {
    id: "computer-vision-python",
    title: "Computer Vision with Python",
    author: "Henry Zhao",
    date: "2024-04-15",
    topic: "Computer Vision",
    excerpt: "Build image classification and detection systems using Python.",
    image: "/images/posts/post8.jpg",
  },
  {
    id: "mlops-best-practices",
    title: "MLOps Best Practices",
    author: "Isabella Rossi",
    date: "2024-03-30",
    topic: "MLOps",
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
    excerpt: "From classical n-grams to modern transformer-based LMs.",
    image: "/images/posts/post10.jpg",
  },
];

function formatPostDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

interface HeroSectionProps {
  initialPosts?: any[];
}

export default function HeroSection({ initialPosts = [] }: HeroSectionProps) {
  const itemsPerPage = 10;

  const initialTotalPages = Math.max(
    1,
    initialPosts.length > 0
      ? Math.ceil(initialPosts.length / itemsPerPage)
      : Math.ceil(defaultPosts.length / itemsPerPage),
  );

  const [posts, setPosts] = useState<any[]>(
    initialPosts.length > 0 ? initialPosts : defaultPosts,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialData = useRef(initialPosts.length > 0);
  const initialized = useRef(false);

  const currentPosts =
    posts.length > 0 ? posts : defaultPosts.slice(0, itemsPerPage);

  // Page 1: first article is featured; rest are list rows
  const featuredPost = currentPage === 1 ? currentPosts[0] : null;
  const listPosts =
    currentPage === 1 ? currentPosts.slice(1) : currentPosts;

  useEffect(() => {
    if (!initialized.current && initialPosts.length > 0) {
      setPosts(initialPosts);
      hasInitialData.current = true;
      initialized.current = true;
      setTotalPages(Math.max(1, Math.ceil(initialPosts.length / itemsPerPage)));
      fetch(`/api/posts?page=1&limit=${itemsPerPage}`)
        .then((res) => res.json())
        .then((json) => {
          let pages = 1;
          if (json?.pagination?.totalPages && json.pagination.totalPages > 0) {
            pages = json.pagination.totalPages;
          } else if (
            json?.pagination?.total != null &&
            json.pagination.total > 0
          ) {
            pages = Math.ceil(json.pagination.total / itemsPerPage);
          }
          setTotalPages(Math.max(1, pages));
        })
        .catch(() => {});
    }
  }, []);

  const loadPosts = async (page: number) => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/posts?page=${page}&limit=${itemsPerPage}`);
      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();

      let fetched: any[] = [];
      if (json?.success && Array.isArray(json.data)) fetched = json.data;
      else if (Array.isArray(json.posts)) fetched = json.posts;
      else if (Array.isArray(json)) fetched = json;

      const mapped = fetched.map((p: any) => {
        const articleId = p._id ?? p.id;
        const imageUrl = articleId
          ? `/api/article-image?id=${articleId}`
          : "/images/azbyte.jpeg";

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

      setPosts(mapped.length ? mapped : []);

      if (json?.pagination) {
        const p =
          json.pagination.totalPages ??
          Math.ceil((json.pagination.total || 0) / itemsPerPage);
        setTotalPages(Math.max(1, p));
      } else {
        const totalCount =
          json?.total || json?.pagination?.total || mapped.length;
        setTotalPages(Math.max(1, Math.ceil(totalCount / itemsPerPage)));
      }
    } catch (e) {
      console.error("Failed to load posts:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialData.current || currentPage > 1) {
      loadPosts(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const onUpdate = () => loadPosts(currentPage);
    window.addEventListener("postsUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("postsUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [currentPage]);

  return (
    <section className="w-full min-w-0">
      {/* Featured article — page 1 only */}
      {featuredPost && (() => {
        const slug = getPostSlug(featuredPost);
        if (slug === "invalid-slug") return null;
        return (
          <article className="mb-8 sm:mb-10">
            <Link
              href={`/${slug}`}
              className="block group rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[16/9] sm:aspect-[2/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={featuredPost.image || "/images/azbyte.jpeg"}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-md bg-[#0a73b0] text-white">
                  New
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#0a73b0] dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {featuredPost.title}
                </h2>
                {featuredPost.excerpt ? (
                  <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatPostDate(featuredPost.date)}</span>
                  {featuredPost.author ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{featuredPost.author}</span>
                    </>
                  ) : null}
                  {featuredPost.topic ? (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-md"
                      style={getTopicBadgeStyle(featuredPost.topic)}
                    >
                      {featuredPost.topic}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          </article>
        );
      })()}

      {/* Section header */}
      <div className="mb-4 sm:mb-5 flex items-end justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Latest Articles
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {isLoading && (
        <div className="mb-4 text-sm text-gray-500">Loading...</div>
      )}

      {/* List feed — Real Python–style rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {listPosts.map((post) => {
          const slug = getPostSlug(post);
          if (slug === "invalid-slug") return null;
          return (
            <article key={post.id || post._id || slug} className="py-5 first:pt-1">
              <Link
                href={`/${slug}`}
                className="group flex flex-col sm:flex-row gap-4 sm:gap-5"
              >
                <div className="sm:w-40 md:w-44 lg:w-48 shrink-0">
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <img
                      src={post.image || "/images/azbyte.jpeg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#0a73b0] dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatPostDate(post.date)}</span>
                    {post.author ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{post.author}</span>
                      </>
                    ) : null}
                    {post.topic ? (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-md"
                        style={getTopicBadgeStyle(post.topic)}
                      >
                        {post.topic}
                      </span>
                    ) : null}
                  </div>
                  {post.excerpt ? (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-3 text-sm font-medium text-[#0a73b0] dark:text-blue-400 group-hover:underline">
                    Read more →
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
          className={`px-4 py-2 rounded-md border text-sm ${
            currentPage === 1 || isLoading
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Prev
        </button>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || isLoading}
          className={`px-4 py-2 rounded-md border text-sm ${
            currentPage === totalPages || isLoading
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Next
        </button>
      </div>
    </section>
  );
}
