"use client";
import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./write.module.css";

// Fix dynamic import with proper loading and error handling
const ReactQuill = dynamic(
  () => import("react-quill").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className={styles.editorLoading}>
        <div className={styles.spinner}></div>
        <p>Loading editor...</p>
      </div>
    ),
  }
);

// Import Quill CSS dynamically
if (typeof window !== "undefined") {
  import("react-quill/dist/quill.snow.css");
}

const Write = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("AI"); // Set a default value
  const [authorName, setAuthorName] = useState(session?.user?.name || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      alert("You must be logged in to write an article.");
      return;
    }

    if (!title || !description || !content || !topic || !authorName) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize the topic name - keep it lowercase without underscores for consistency
      // The dropdown values are already lowercase (e.g., "python", "data_engineering")
      // But handle any spaces or special cases
      const normalizedTopic = topic.trim().toLowerCase().replace(/\s+/g, "_");
      console.log(`[Write] Original topic: "${topic}", Normalized: "${normalizedTopic}"`);
      
      // Extract images from content
      const extractedImages = extractImageFromContent(content);

      const articleData = {
        title: title.trim(),
        description: description.trim(),
        content: content,
        topic: normalizedTopic,
        authorName: authorName.trim(),
      };

      console.log("Submitting article data:", {
        title: articleData.title,
        description: articleData.description,
        topic: articleData.topic,
        contentLength: articleData.content?.length || 0,
      }); // Debug log

      // Add timeout to fetch request (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let response;
      try {
        response = await fetch("/api/write_articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
          credentials: "include",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error(
            "Request timed out. Please check your connection and try again."
          );
        }
        throw new Error(`Network error: ${fetchError.message}`);
      }

      let data;
      try {
        const text = await response.text();
        console.log("Raw response:", text.substring(0, 200)); // Log first 200 chars
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server. Please try again.");
      }

      console.log("Response data:", data); // Debug log

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Failed to publish article (${response.status})`
        );
      }

      alert("Article published successfully!");
      
      // Clear cache to ensure new article appears immediately
      if (typeof window !== "undefined") {
        // Clear localStorage cache for latest articles and topic pages
        const cacheKeys = Object.keys(localStorage);
        cacheKeys.forEach((key) => {
          if (key.startsWith("azbytegems_cache_")) {
            if (key.includes("latest_articles") || key.includes("articles/")) {
              localStorage.removeItem(key);
              console.log(`[Write] Cleared cache: ${key}`);
            }
          }
        });
      }
      
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error.message ||
        "Failed to publish article. Please check the browser console for details.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractImageFromContent = (content) => {
    try {
      // Fallback to content image extraction
      const imageRegexes = [
        /!$$.*?$$$$(.*?)$$/, // Your custom Markdown syntax
        /!$$.*?$$$$(.*?)$$/, // Standard Markdown image syntax
        /<img[^>]+src="([^">]+)"/, // HTML img tag
        /https?:\/\/\S+\.(?:jpg|jpeg|gif|png|webp)/, // Direct image URLs
      ];

      for (let regex of imageRegexes) {
        const match = content.match(regex);
        if (match && match[1]) return match[1];
      }

      return null;
    } catch (error) {
      console.error("Error extracting image from content:", error);
      return null;
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: "1" }, { header: "2" }, { header: "3" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image", "video"],
        [{ align: [] }],
        ["clean"],
        ["code-block"],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "code-block",
  ];

  // Update author name when session loads
  useEffect(() => {
    if (session?.user?.name && !authorName) {
      setAuthorName(session.user.name);
    }
  }, [session, authorName]);

  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className={styles.authRequired}>
        <h2>Authentication Required</h2>
        <p>Please log in to write an article</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Write an Article</h1>
        <p className={styles.subtitle}>
          Share your knowledge with the community
        </p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <input
            id="description"
            type="text"
            placeholder="Brief description of your article..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="authorName" className={styles.label}>
            Author Name
          </label>
          <input
            id="authorName"
            type="text"
            placeholder="Enter your name..."
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>
            Content
          </label>
          <div className={styles.editorWrapper}>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Write your article content here..."
              className={styles.editor}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="topic" className={styles.label}>
            Topic
          </label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className={styles.select}
          >
            <option value="ai">AI</option>
            <option value="career_advice">Career Advice</option>
            <option value="computer_vision">Computer Vision</option>
            <option value="data_engineering">Data Engineering</option>
            <option value="data_science">Data Science</option>
            <option value="language_models">Language Models</option>
            <option value="machine_learning">Machine Learning</option>
            <option value="machine_learning_ops">MLOps</option>
            <option value="nlp">NLP</option>
            <option value="programming">Programming</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className={styles.buttonSpinner}></span>
              Publishing...
            </>
          ) : (
            "Publish Article"
          )}
        </button>
      </form>
    </div>
  );
};

export default Write;
