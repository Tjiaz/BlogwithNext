"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./article_details.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MdFacebook, MdSearch } from "react-icons/md";
import FeaturedCard from "@/components/featured/FeaturedCard";

// Function to fetch article by ID
async function getTopicDetails(slug) {
  const response = await fetch(`/api/article_details/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch article details");
  }
  return response.json();
}

export default function ArticleDetails() {
  const { slug } = useParams();
  
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [latestPosts, setLatestPosts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the page from query params
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = parseInt(pageParam, 10) || 1;

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/api/latest_articles?page=${page}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setLatestPosts(data); // If already an array, use it directly
        } else {
          console.error("Unexpected data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [page]);

  useEffect(() => {
    // Make sure the router is ready before accessing query params
    if (slug) {
      console.log("Article slug:", slug);
      const fetchArticle = async () => {
        try {
          const data = await getTopicDetails(slug); // Fetch article details
          setArticle(data); // Set article state
        } catch (error) {
          setError(error.message); // Set error state
        }
      };

      fetchArticle(); // Call the async function when id is available
    }
  }, [slug]);

  return error ? (
    <div>Error: {error}</div>
  ) : !article ? (
    <div>Loading ...</div>
  ) : (
    <div className={styles.container}>
      <div className={styles.advertContainer}>
        <div className={styles.imageadvert}>
          <Image src="/p1.jpeg" alt="" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          adverts link
        </Link>
      </div>
      <div className={styles.articleInfo}>
        <div className={styles.textContainer1}>
          <h1>{article.title}</h1>
          <p>
            By <b>{article.author}</b> on {article.date} in {article.topic}
          </p>
          <div className={styles.socialLink}>
            <Link href="https://facebook.com/">
              <MdFacebook className={styles.facebookIcon} />
            </Link>
            <Link href="https://facebook.com/">
              <MdFacebook className={styles.facebookIcon} />
            </Link>
            <Link href="https://facebook.com/">
              <MdFacebook className={styles.facebookIcon} />
            </Link>
            <Link href="https://facebook.com/">
              <MdFacebook className={styles.facebookIcon} />
            </Link>
            <Link href="https://facebook.com/">
              <MdFacebook className={styles.facebookIcon} />
            </Link>
          </div>
          <hr style={{ color: "#cccccc" }} />
          {article.content.map((section, index) => (
            <div key={index}>
              {article.filtered_images && article.filtered_images.length > 0 ? (
                <Image
                  src={article.filtered_images[2]}
                  alt="Article image"
                  layout="responsive"
                  width={700}
                  height={475}
                />
              ) : (
                <Image
                  src="/default-image.png"
                  alt="Default image"
                  style={{ width: "100%", height: "auto" }}
                />
              )}

              <h2>{section.heading}</h2>
              {section.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ))}
          <p>
            <strong>Author:</strong> {article.author}
          </p>
          <p>
            <strong>Date:</strong> {article.date}
          </p>
        </div>
        <div className={styles.textContainer2}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search AzByteGems..."
            />
            <MdSearch className={styles.searchIcon} />
          </div>
          <div className={styles.advertImgContainer}>
            <Image
              src="/dummy_img.png"
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href="/">Adverts</Link>
          </div>
          <div>
            <h3>Latest Posts</h3>
            <div style={{ display: "flex", width: "100%" }}>
              <div
                style={{ flex: "0 0 25%", borderBottom: "3px solid #0B73B1" }}
              ></div>
              <div
                style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}
              ></div>
            </div>
            {latestPosts && latestPosts.length > 0 ? (
              latestPosts.map((post) => (
                <FeaturedCard
                  key={post._id} // Use post._id for unique key
                  postImg={
                    post.filtered_images && post.filtered_images.length > 0
                      ? post.filtered_images[0]
                      : "/default-image.png"
                  }
                  postTitle={post.title}
                  postDesc={post.description}
                  postAuthor={post.author}
                  postDate={post.date}
                  postTopic={post.topic}
                  postId={post.id}
                />
              ))
            ) : (
              <div>No articles found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
