"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./topic.module.css";

export default function TopicPage() {
  const { topic } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRssFeed() {
      try {
        const response = await fetch(`/api/rssfeed/${topic}`);
        if (!response.ok) {
          throw new Error("Failed to fetch RSS feed");
        }
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRssFeed();
  }, [topic]);

  if (loading) {
    return <div className={styles.spinner}></div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>{topic.toUpperCase()} RSS Feed</h1>
      <div className={styles.articles}>
        {articles.map((article) => (
          <div key={article.guid} className={styles.article}>
            <h2>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h2>
            <p>{article.description}</p>
            <div className={styles.meta}>
              <span>By {article.author}</span>
              <span>
                Published on {new Date(article.pubDate).toLocaleDateString()}
              </span>
            </div>
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className={styles.image}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
