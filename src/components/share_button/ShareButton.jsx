// components/ShareButton.jsx
const ShareButton = ({ platform, onClick, children }) => {
  const getButtonClass = () => {
    switch (platform) {
      case "twitter":
        return styles.twitter;
      case "facebook":
        return styles.facebook;
      case "linkedin":
        return styles.linkedin; // Add LinkedIn style
      default:
        return "";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${styles.shareButton} ${getButtonClass()}`}
      aria-label={`Share on ${platform}`}
    >
      {children}
    </button>
  );
};

export default ShareButton;
