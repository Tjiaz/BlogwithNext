import styles from "./page.module.css";

export default function Page({ article }) {
  return (
    <div>
      <h1>{article.title}</h1>
      <div
        dangerouslySetInnerHTML={{
          __html: article.content.replace(/<img/g, '<img class="imageResizer"'),
        }}
        className={styles.paragraphs}
      />
    </div>
  );
}
