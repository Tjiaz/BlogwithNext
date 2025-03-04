// components/ShareButtons.jsx
import { FaTwitter, FaFacebookF } from "react-icons/fa";
import styles from "./ShareButtons.module.css";

const ShareButtons = ({ post, isTopPostPage = false }) => {
  const baseUrl = "https://azbytegems.com";

  // Create URLs for different scenarios
  const getShareUrl = () => {
    if (isTopPostPage) {
      return `${baseUrl}/blog`; // your top posts page URL
    }
    // For individual posts, check if post exists
    return post ? `${baseUrl}/article_details/${post.id}` : baseUrl;
  };

  const getShareTitle = () => {
    if (isTopPostPage) {
      return "Top Posts - AzByteGems";
    }
    return post ? post.title : "AzByteGems";
  };

  // AddToAny sharing URLs
  const createAddToAnyUrl = (platform) => {
    const shareUrl = encodeURIComponent(getShareUrl());
    const shareTitle = encodeURIComponent(getShareTitle());

    return `https://www.addtoany.com/add_to/${platform}?linkurl=${shareUrl}&linkname=${shareTitle}`;
  };

  return (
    <div className={styles.shareButtons}>
      <a
        href={createAddToAnyUrl("facebook")}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.shareButton} ${styles.facebook}`}
        aria-label="Share on Facebook"
      >
        <FaFacebookF /> Share
      </a>
      <a
        href={createAddToAnyUrl("twitter")}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.shareButton} ${styles.twitter}`}
        aria-label="Share on Twitter"
      >
        <FaTwitter /> Tweet
      </a>
    </div>
  );
};

export default ShareButtons;
