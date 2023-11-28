import React from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";

const getData = async () => {
  const response = await fetch("http:localhost:3000/api/categories", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("failed");
  }

  return response.json();
};
const CategoryList = async () => {
  const data = await getData();
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Popular Categories</h1>
      <div className={styles.categories}>
        {data?.map((item) => (
          <Link
            href="/blog?cat=style"
            className={`${styles.category} ${styles[item.slug]}`}
            key={item._id}
          >
            {item.img && <Image
              src={item.img}
              alt=""
              height={32}
              width={32}
              className={styles.image}
            />}
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;