// LoadingPlaceholder.jsx
import styles from "./LoadingPlaceholder.module.css";

const LoadingPlaceholder = ({ count }) => {
  return Array(count)
    .fill(0)
    .map((_, i) => (
      <div key={i} className={styles.loadingCard}>
        <div className={styles.loadingImage}></div>
        <div className={styles.loadingContent}>
          <div className={styles.loadingTitle}></div>
          <div className={styles.loadingDesc}></div>
          <div className={styles.loadingMeta}></div>
        </div>
      </div>
    ));
};

export default LoadingPlaceholder;
