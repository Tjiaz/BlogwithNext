// app/api/social-share/route.js
import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import { NextResponse } from "next/server";

// Helper function to fetch article details
async function fetchArticleDetails(articleId) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"}/api/article_details/${articleId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch article details");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching article details:", error);
    return null;
  }
}

// Helper function to extract image from content
function extractImageFromContent(content) {
  try {
    if (!content) return null;

    // Convert content to string if it's not already
    const contentString =
      typeof content === "string" ? content : JSON.stringify(content);

    // First try to match img tags
    const imgTagMatch = contentString.match(/<img[^>]+src="([^">]+)"/);
    if (imgTagMatch && imgTagMatch[1]) {
      return imgTagMatch[1];
    }

    // If no img tag found, try other formats
    const otherPatterns = [
      /!$$.*?$$$$(.*?)$$/, // Markdown image
      /https?:\/\/\S+\.(?:jpg|jpeg|gif|png|webp)/, // Direct URLs
    ];

    for (const pattern of otherPatterns) {
      const match = contentString.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting image from content:", error);
    return null;
  }
}

export async function POST(req) {
  try {
    const { title, link, description, platform, image, articleId } =
      await req.json();
    console.log("Received share request:", {
      title,
      link,
      description,
      platform,
      image,
      articleId,
    });

    // Get article details if articleId is provided
    let article = null;
    if (articleId) {
      article = await fetchArticleDetails(articleId);
    }

    // Determine the best image to use
    const imageUrl =
      image ||
      (article && article.filtered_images?.[0]) ||
      (article && extractImageFromContent(article.content)) ||
      `${process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"}/azbyte.jpeg`;

    // Create a canonical URL
    const canonicalUrl =
      link ||
      (articleId &&
        `${process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"}/article_details/${articleId}`) ||
      `${process.env.NEXT_PUBLIC_DOMAIN || "https://azbytegems.com"}`;

    console.log("Using image URL:", imageUrl);
    console.log("Using canonical URL:", canonicalUrl);

    if (platform === "twitter") {
      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
      });

      // Verify app permissions
      try {
        const currentUser = await twitterClient.v2.me();
        console.log("Twitter user verification:", currentUser);
      } catch (error) {
        console.error("Twitter authentication error:", error);
        throw new Error("Failed to verify Twitter credentials");
      }

      // Download and upload the image to Twitter
      let mediaId;
      if (imageUrl) {
        try {
          console.log("Downloading image from:", imageUrl);

          // Download the image
          const imageResponse = await axios.get(imageUrl, {
            responseType: "arraybuffer",
          });
          const imageBuffer = Buffer.from(imageResponse.data, "binary");

          console.log("Image downloaded, uploading to Twitter...");

          // Upload to Twitter
          const mediaResponse = await twitterClient.v1.uploadMedia(
            imageBuffer,
            {
              mimeType: imageResponse.headers["content-type"] || "image/jpeg",
            }
          );

          mediaId = mediaResponse;
          console.log("Image uploaded to Twitter, media ID:", mediaId);
        } catch (error) {
          console.error("Error processing image:", error);
          // Continue without the image if there's an error
        }
      }

      // Create tweet text with the canonical URL
      const tweetText = `${title}\n\n${canonicalUrl}`;

      // Prepare tweet options
      const tweetOptions = {
        text: tweetText,
      };

      // Add media if available
      if (mediaId) {
        tweetOptions.media = { media_ids: [mediaId] };
      }

      console.log("Attempting to post tweet:", tweetOptions);

      const tweet = await twitterClient.v2.tweet(tweetOptions);
      console.log("Tweet posted successfully:", tweet);

      return NextResponse.json({
        success: true,
        platform: "twitter",
        tweetId: tweet.data.id,
        tweetUrl: `https://twitter.com/user/status/${tweet.data.id}`,
      });
    }

    if (platform === "facebook") {
      return NextResponse.json({
        success: true,
        platform: "facebook",
        message: "Facebook share dialog opened",
      });
    }

    if (platform === "linkedin") {
      return NextResponse.json({
        success: true,
        platform: "linkedin",
        message: "LinkedIn share dialog opened",
      });
    }

    // If platform is not recognized
    return NextResponse.json(
      {
        error: "Unsupported sharing platform",
        platform: platform,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Social sharing error:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.response?.data || error,
      },
      { status: 500 }
    );
  }
}
