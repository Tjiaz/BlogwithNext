"use client";
import React, { useState, useEffect } from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import CatCard from "./CatCard";
import MenuCategories from "../menuCategories/MenuCategories";
import MenuPostCard from "../menuPosts/MenuPostCard";

const CategoryList = () => {
  const [moreRecentPosts, setMoreRecentPosts] = useState([]);
  const [menuPosts, setMenuPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParam = useSearchParams();
  const moreParam = searchParam.get("page");
  const page = parseInt(moreParam) || 1;

  useEffect(() => {
    async function fetchRecentPosts() {
      try {
        const response = await fetch(`/api/moreRecent_articles?page=${page}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setMoreRecentPosts(data);
        } else {
          console.error("Unexpected data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch more recent articles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecentPosts();
  }, [page]);

  useEffect(() => {
    async function fetchMenuArticles() {
      try {
        const response = await fetch(`/api/categories?page=${page}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setMenuPosts(data);
        } else {
          console.error("Unexpected data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenuArticles();
  }, [page]);

  return (
    <div className={styles.container}>
      <div className={styles.recentContainer1}>
        <div className={styles.category}>
          <h3 className={styles.title}>More Recent Posts</h3>
          {loading ? (
            <p>Loading...</p>
          ) : moreRecentPosts.length > 0 ? (
            moreRecentPosts.map((item) => (
              <CatCard
                key={item.id}
                postTitle={
                  <Link href={`/article_details/${item.id}`} postId={item.id}>
                    {item.title}
                  </Link>
                }
              />
            ))
          ) : (
            <p>No categories available at the moment.</p>
          )}
        </div>
      </div>
      <div className={styles.recentContainer2}>
        <div className={styles.menuContainer}>
          <h2 className={styles.title}>Most Popular Articles</h2>
          {loading ? (
            <p>Loading...</p>
          ) : menuPosts.length > 0 ? (
            menuPosts.map((post) => (
              <MenuPostCard
                key={post._id}
                withImage={true}
                topic={post.topic}
                title={post.title}
                author={post.author}
                date={post.date}
                image={
                  post.filtered_images && post.filtered_images.length > 0
                    ? post.filtered_images[0]
                    : "/AZBYTEGEMS.png"
                }
              />
            ))
          ) : (
            <p>No popular post available at the moment.</p>
          )}

          <h2 className={styles.subtitle}>Discover by topics</h2>
          <MenuCategories />
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
