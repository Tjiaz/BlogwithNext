import React from "react";
import styles from "./menu.module.css";

import MenuPosts from "../menuPosts/menuPosts";
import MenuCategories from "../menuCategories/menuCategories";

const Menu = () => {
  return (
    <div className={styles.container}>
      <h2>{`What's happening`}</h2>
      <h1>Most Popular</h1>
      <MenuPosts withImage={false} />
      <h2 className={styles.subtitle}>Discover by topics</h2>
      <h1 className={styles.title}>categories</h1>
      <MenuCategories />
      <h2>Chosen by the editor</h2>
      <h1>{"Editor's pick"}</h1>
      <MenuPosts withImage={true} />
    </div>
  );
};

export default Menu;
