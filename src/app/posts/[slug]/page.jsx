import React from "react";
import styles from "./singlePage.module.css";
import Image from "next/image";
import Menu from "@/components/menu/Menu";
import Comments from "@/components/comments/Comments";

const getData = async (slug) => {
  const response = await fetch(`http:localhost:3000/api/posts/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("failed");
  }

  return response.json();
};
const SinglePage = async ({ params }) => {
  const { slug } = params;

  const data = await getData(slug);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{data?.title}</h1>
          <div className={styles.user}>
            <div className={styles.userImageContainer}>
              {data?.user?.image && (
                <Image
                  src={data.user.image}
                  alt=""
                  fill
                  className={styles.avatar}
                />
              )}
            </div>
            <div className={styles.userTextContainer}>
              <span className={styles.username}>ta</span>
              <span className={styles.date}>{data.created_At}</span>
            </div>
          </div>
        </div>
        <div className={styles.imageContainer}>
          {data?.img && (
            <Image src={data.image} alt="" fill className={styles.image} />
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.post}>
          <div
            className={styles.description}
            // dangerouslySetInnerHTML={{ __html: data?.desc }}
          />

          <div className={styles.comment}>
            <Comments postSlug={slug} />
          </div>
        </div>
        <Menu />
      </div>
    </div>
  );
};

export default SinglePage;
