"use client";
import { useState, useRef, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import styles from "./write.module.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function removeBase64Images(html) {
  return html.replace(/<img[^>]+src=["']data:image\/[^"']+["'][^>]*>/gi, "");
}

const Write = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("AI"); // Set a default value
  const [author, setAuthor] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [error, setError] = useState(null);
  const quillRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      alert("You must be logged in to write an article.");
      return;
    }

    if (!title || !description || !content || !topic || !author) {
      alert("Please fill in all fields");
      return;
    }

    // Automatically remove base64 images before submit
    const cleanedContent = removeBase64Images(content);

    setIsSubmitting(true);

    try {
      // Normalize the topic name
      const normalizedTopic = topic.trim().toLowerCase().replace(/\s+/g, "_");
      // Extract images from content
      const extractedImages = extractImageFromContent(cleanedContent);

      const articleData = {
        title: title.trim(),
        description: description.trim(),
        content: cleanedContent,
        topic: normalizedTopic,
        author: author.trim(),
        date: customDate,
      };

      console.log("Submitting article data:", articleData); // Debug log

      const response = await fetch("/api/write_articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Response data:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || "Failed to publish article");
      }

      alert("Article published successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "Failed to publish article");
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

  // --- IMPORTANT: memoized image handler ---
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const url = data.url;

      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url);
      quill.setSelection(range.index + 1);
    };
  }, []);

  // --- IMPORTANT: memoized modules & formats ---
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: "1" }, { header: "2" }, { font: [] }],
          [{ size: [] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image", "video"],
          ["clean"],
          ["code-block"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );
  const formats = useMemo(
    () => [
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
      "code-block",
    ],
    []
  );

  if (status === "loading") {
    return <div className={styles.loading}>Loading user session...</div>;
  }

  if (status !== "authenticated") {
    return <div>Please log in to write an article</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Write an Article</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className={styles.input}
        />

        <label htmlFor="article-date">Publication Date & Time:</label>
        <input
          type="datetime-local"
          id="article-date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className={styles.input}
        />

        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Write your article content here..."
        />

        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          className={styles.select}
        >
          <option value="ai">AI</option>
          <option value="career_advice">Career Advice</option>
          <option value="computer_vision">Computer Vision</option>
          <option value="data_engineer">Data Engineering</option>
          <option value="data_science">Data Science</option>
          <option value="language_models">Language Models</option>
          <option value="machine_learning">Machine Learning</option>
          <option value="machine_learning_ops">MLOps</option>
          <option value="nlp">NLP</option>
          <option value="programming">Programming</option>
          <option value="python">Python</option>
          <option value="sql">SQL</option>
        </select>

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
};

export default Write;
