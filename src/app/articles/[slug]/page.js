"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./article.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdFacebook, MdSearch } from "react-icons/md";
import { FaLinkedinIn } from "react-icons/fa";
import { BsEnvelope, BsMailbox, BsMessenger, BsTwitterX } from "react-icons/bs";
import ArticleCard from "./ArticleCard";
import { getCurrentAdvert } from "@/utils/advert";

const ArticlePage = ({ params }) => {
  const { slug } = params; // Destructure slug from params

  const [articles, setArticles] = useState([]);
  const [articleCount, setArticleCount] = useState(0);
  const [topicTitle, setTopicTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [topPosts, setTopPosts] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const articleRef = useRef(null);


  

  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const { top } = articleRef.current.getBoundingClientRect();
        setIsScrolled(top < -100); // Adjust this value as needed
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/api/articles/${slug}`);
        const data = await response.json();

        if (data.articles) {
          setArticles(data.articles);
          setArticleCount(data.articleCount);
          setTopicTitle(data.topicTitle.replace("_articles", ""));
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
  }, [slug]);

  // Fetch top 5 articles for the topPosts section
  useEffect(() => {
    async function fetchTopPosts() {
      try {
        const response = await fetch(`/api/topArticles?page=1`);
        const data = await response.json();
        console.log("Top Posts Data:", data);

        if (Array.isArray(data)) {
          setTopPosts(data.slice(0, 7)); // Limit to 5 articles
        } else {
          console.error("Unexpected data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch top posts", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopPosts();
  }, []); // Empty dependency array to run once on component mount
  // Log articles to see its structure before rendering

  const currentAdvert = getCurrentAdvert();

  return loading ? (
    <div className={styles.spinner}></div>
  ) : !articles ? (
    <div>Article not found</div>
  ) : (
    <div className={styles.container}>
      <div className={styles.advertsContainer}>
        <div className={styles.imageadvert}>
          <Image
            src={currentAdvert.gif1}
            alt=""
            fill
            className={styles.image}
          />
        </div>
        <Link href={currentAdvert.link} className={styles.advert}>
          {currentAdvert.name}
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1} ref={articleRef}>
          <h2 className={styles.head}>
            {topicTitle}
            <span
              style={{
                marginLeft: "10px",
                fontSize: "0.7em",
                color: "#0B73B1",
                fontWeight: "normal",
              }}
            >
              ({articleCount} {articleCount === 1 ? "Article" : "Articles"})
            </span>
            <div className={styles.socialLinksWrapper}>
              <div
                className={`${styles.socialLink} ${isScrolled ? styles.vertical : styles.horizontal}`}
              >
                <button
                  onClick={() => shareToSocial("facebook")}
                  className={`${styles.socialButton} ${styles.facebookButton}`}
                  disabled={isSharing}
                >
                  <MdFacebook className={styles.facebookIcon} />
                </button>

                <button
                  onClick={() => shareToSocial("linkedin")}
                  className={`${styles.socialButton} ${styles.linkedinButton}`}
                  disabled={isSharing}
                >
                  <FaLinkedinIn className={styles.linkedIcon} />
                </button>

                <button
                  onClick={() => shareToSocial("twitter")}
                  className={`${styles.socialButton} ${styles.xButton}`}
                  disabled={isSharing}
                >
                  <BsTwitterX className={styles.xIcon} />
                </button>

                <button
                  onClick={() => shareToSocial("twitter")}
                  className={`${styles.socialButton} ${styles.emailButton}`}
                  disabled={isSharing}
                >
                  <BsEnvelope className={styles.emailIcon} />
                </button>
              </div>
            </div>
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div style={{ flex: 1, borderBottom: "2px solid #0B73B1" }}></div>
            <span
              style={{
                padding: "0 10px",
                color: "#0B73B1",
                fontWeight: "bold",
              }}
            >
              ✦
            </span>
            <div style={{ flex: 1, borderBottom: "2px solid #0B73B1" }}></div>
          </div>
          <div className={styles.postItem}>
            {articles && articles.length > 0 ? (
              articles.map((article) => (
                <div key={article._id}>
                  {/* Display the article using ArticleCard */}
                  <ArticleCard
                    key={article._id}
                    postImg={
                      article.filtered_images &&
                      article.filtered_images.length > 0
                        ? article.filtered_images[0] // Display the first image
                        : "/azbyte.jpeg" // Fallback image if none exists
                    }
                    postTitle={
                      <Link href={`/article_details/${article._id}`}>
                        {article.title}
                      </Link>
                    }
                    postDesc={article.description}
                    postAuthor={article.author}
                    postDate={article.date}
                  />
                </div>
              ))
            ) : (
              <div>No articles found.</div>
            )}
          </div>
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
              src={currentAdvert.gif2}
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href={currentAdvert.link}>{currentAdvert.name}</Link>
          </div>
          <div>
            <h3>Top Articles</h3>
            <div style={{ display: "flex", width: "100%" }}>
              <div
                style={{ flex: "0 0 25%", borderBottom: "3px solid #0B73B1" }}
              ></div>
              <div
                style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}
              ></div>
            </div>
          </div>
          <div className={styles.topPosts}>
            <ol className={styles.noListStyle}>
              {topPosts && topPosts.length > 0 ? (
                topPosts.map((post) => (
                  <li key={post.id} className={styles.listItem}>
                    <Link
                      href={`/article_details/${post.id}`}
                      onClick={(e) => {
                        console.log("Clicked post:", post._id);
                      }}
                    >
                      {post.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No top posts found.</li>
              )}
            </ol>
          </div>
          <div className={styles.advertImgContainer}>
            <Image
              src={currentAdvert.gif3}
              alt="advert"
              width={100}
              height={100}
              className={styles.advertImg}
            />
            <Link href={currentAdvert.link}>{currentAdvert.name}</Link>
          </div>
          <div className={styles.signupContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Your Email"
            />
            <button href="/" className={styles.signupbutton}>
              sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
