import React from "react";
import styles from "./menu.module.css";

import MenuPosts from "../menuPosts/MenuPosts";
import MenuCategories from "../menuCategories/MenuCategories";

const Menu = () => {
  return (
    <div className={styles.container}>
      <h2>Most Popular</h2>
      <MenuPosts withImage={false} />
      <h2 className={styles.subtitle}>Discover by topics</h2>
      <MenuCategories />
    </div>
  );
};

export default Menu;
