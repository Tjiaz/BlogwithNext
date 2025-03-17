// app/api/social-share/route.js
import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { title, link, description, platform, image } = await req.json();
    console.log("Received share request:", {
      title,
      link,
      description,
      platform,
      image, // Optional image URL
    });

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

      // Create tweet text
      const tweetText = `${title}\n\n${link}`;
      console.log("Attempting to post tweet:", tweetText);

      const tweet = await twitterClient.v2.tweet(tweetText);
      console.log("Tweet posted successfully:", tweet);

      return NextResponse.json({
        success: true,
        platform: "twitter",
        tweetId: tweet.data.id,
      });
    }

    if (platform === "facebook") {
      // Construct a more comprehensive Facebook sharing URL
      const shareUrl = `https://www.facebook.com/dialog/share?app_id=${
        process.env.FACEBOOK_APP_ID
      }&href=${encodeURIComponent(link)}&quote=${encodeURIComponent(title)}`;

      // Optional: Add Open Graph meta tags for better sharing
      const ogMetaTags = `
        <meta property="og:url" content="${link}" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description || ""}" />
        <meta property="og:site_name" content="AzByteGems" />
      `;

      return NextResponse.json({
        success: true,
        platform: "facebook",
        shareUrl: shareUrl,
        ogMetaTags: ogMetaTags,
      });
    }

    if (platform === "linkedin") {
      const accessToken = req.headers.get("linkedin-access-token");
      const shareContent = {
        author: `urn:li:person:${process.env.LINKEDIN_ORGANIZATION_ID}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: `${title}\n\n${description || ""}\n\nRead more: ${link}`,
            },
            shareMediaCategory: "ARTICLE",
            media: [
              {
                status: "READY",
                originalUrl: link,
                title: { text: title },
                description: { text: description || "" },
              },
            ],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      try {
        const response = await axios.post(
          "https://api.linkedin.com/v2/ugcPosts",
          shareContent,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
              "LinkedIn-Version": "202304",
            },
          }
        );

        console.log("LinkedIn API response:", response.data);

        return NextResponse.json({
          success: true,
          platform: "linkedin",
          postId: response.data.id,
        });
      } catch (error) {
        console.error("LinkedIn share error:", error.response?.data || error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
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
