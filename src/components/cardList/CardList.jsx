import React from "react";

import styles from "./cardList.module.css";

import Card from "../card/Card";

const getData = async (page,cat) => {
  const response = await fetch(
    `http:localhost:3000/api/posts?page=${page}&cat=${cat || ""}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("failed");
  }

  return response.json();
};
const CardList = async ({ page, cat }) => {
  const { posts } = await getData(page, cat);

 

  return (
    <div className={styles.container}>
      
      <div className={styles.posts}>
        {posts?.map((item) => {
          <Card item={item} key={item._id} />;
        })}
      </div>
      
    </div>
  );
};

export default CardList;
