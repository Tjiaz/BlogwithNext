"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import styles from "./write.module.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Write = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      alert("You must be logged in to write an article.");
      return;
    }

    const response = await fetch("/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        content,
        topic,
        author: session.user.email,
      }),
    });

    if (response.ok) {
      router.push("/");
    } else {
      alert("Failed to publish the article.");
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
          <option value="">Select Topic</option>
          <option value="AI">AI</option>
          <option value="Career Advice">Career Advice</option>
          <option value="Computer Vision">Computer Vision</option>
          <option value="Data Engineering">Data Engineering</option>
          <option value="Data Science">Data Science</option>
          <option value="Language Models">Language Models</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="MLOps">MLOps</option>
          <option value="NLP">NLP</option>
          <option value="Programming">Programming</option>
          <option value="Python">Python</option>
          <option value="SQL">SQL</option>
        </select>
        <button type="submit" className={styles.button}>
          Publish
        </button>
      </form>
    </div>
  );
};

export default Write;
