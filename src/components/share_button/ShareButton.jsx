// Unified Social Share Function
const shareSocialMedia = async (post, platform) => {
  try {
    // Construct article URL
    const articleUrl = `${
      process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"
    }/article_details/${post.id}`;

    // Prepare share data
    const shareData = {
      title: post.title,
      link: articleUrl,
      description: post.description || post.desc || "",
      // Include image if available
      image:
        post.filtered_images && post.filtered_images.length > 0
          ? post.filtered_images[0]
          : null,
    };

    // Validate platform
    const validPlatforms = ["facebook", "twitter", "linkedin", "reddit"];
    if (!validPlatforms.includes(platform)) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Send to backend for sharing
    const response = await fetch("/api/social_share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...shareData,
        platform: platform,
      }),
    });

    const data = await response.json();
    console.log(
      `${platform.charAt(0).toUpperCase() + platform.slice(1)} share response:`,
      data
    );

    if (data.success) {
      toast.success(
        `Successfully shared to ${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        }!`
      );
    } else {
      throw new Error(data.error || `Failed to share to ${platform}`);
    }
  } catch (error) {
    console.error(
      `${platform.charAt(0).toUpperCase() + platform.slice(1)} share error:`,
      error
    );
    toast.error(
      `Failed to share to ${
        platform.charAt(0).toUpperCase() + platform.slice(1)
      }. Please try again.`
    );
  }
};

// Enhanced ShareButton Component
const ShareButton = ({ platform, post, onClick, children }) => {
  const getButtonClass = () => {
    switch (platform) {
      case "twitter":
        return styles.twitter;
      case "facebook":
        return styles.facebook;
      case "linkedin":
        return styles.linkedin;
      case "reddit":
        return styles.reddit;
      default:
        return "";
    }
  };

  // Handle click with optional custom onClick or default social share
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default to social media sharing if no custom onClick provided
      shareSocialMedia(post, platform);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${styles.shareButton} ${getButtonClass()}`}
      aria-label={`Share on ${platform}`}
    >
      {children}
    </button>
  );
};

// Alternative Direct Share Method (Fallback)
const directSocialShare = (post, platform) => {
  const articleUrl = `${
    process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"
  }/article_details/${post.id}`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      post.title
    )}&url=${encodeURIComponent(articleUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      articleUrl
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      articleUrl
    )}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(
      articleUrl
    )}&title=${encodeURIComponent(post.title)}`,
  };

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  } else {
    console.error(`No share URL for platform: ${platform}`);
  }
};

// Usage in a component
const SocialShareButtons = ({ post }) => {
  return (
    <div className={styles.socialShareContainer}>
      <ShareButton platform="twitter" post={post}>
        Share on Twitter
      </ShareButton>

      <ShareButton platform="facebook" post={post}>
        Share on Facebook
      </ShareButton>

      <ShareButton platform="linkedin" post={post}>
        Share on LinkedIn
      </ShareButton>

      <ShareButton platform="reddit" post={post}>
        Share on Reddit
      </ShareButton>

      {/* Fallback direct share option */}
      <button
        onClick={() => directSocialShare(post, "twitter")}
        className={styles.fallbackShareButton}
      >
        Direct Twitter Share
      </button>
    </div>
  );
};

export { ShareButton, shareSocialMedia, directSocialShare };
