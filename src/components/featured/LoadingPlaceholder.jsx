// LoadingPlaceholder.jsx
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

// Add corresponding CSS
const loadingStyles = `
.loadingCard {
  animation: pulse 1.5s infinite;
  background: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  height: 200px;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
`;

export default LoadingPlaceholder;
