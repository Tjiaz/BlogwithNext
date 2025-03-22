"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import styles from "./write.module.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Write = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("AI"); // Set a default value

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      alert("You must be logged in to write an article.");
      return;
    }

    if (!title || !description || !content || !topic) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize the topic name
      const normalizedTopic = topic.trim().toLowerCase().replace(/\s+/g, "_");
      // Extract images from content
      const extractedImages = extractImageFromContent(content);

      const articleData = {
        title: title.trim(),
        description: description.trim(),
        content: content,
        topic: normalizedTopic,
      
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

  const modules = {
    toolbar: [
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
  };

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
    "code-block",
  ];

  if (status === "loading") {
    return <div>Loading...</div>;
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
        <ReactQuill
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
