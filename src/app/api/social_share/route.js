// app/api/social-share/route.js
import { TwitterApi } from "twitter-api-v2";
import axios from "axios";

export async function POST(req) {
  try {
    const { title, link, description, platform } = await req.json();
    console.log("Received share request:", {
      title,
      link,
      description,
      platform,
    });

    if (platform === "twitter") {
      // Add this debug log
      console.log("Twitter credentials check:", {
        hasApiKey: !!process.env.TWITTER_API_KEY,
        hasApiSecret: !!process.env.TWITTER_API_SECRET,
        hasAccessToken: !!process.env.TWITTER_ACCESS_TOKEN,
        hasAccessSecret: !!process.env.TWITTER_ACCESS_SECRET,
      });

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

      return new Response(
        JSON.stringify({
          success: true,
          platform: "twitter",
          tweetId: tweet.data.id,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (platform === "facebook") {
      // Facebook sharing
      const response = await axios.post(
        `https://graph.facebook.com/${process.env.FACEBOOK_PAGE_ID}/feed`,
        {
          message: title,
          link: link,
          access_token: process.env.FACEBOOK_ACCESS_TOKEN,
        }
      );

      if (!response.data.id) {
        throw new Error("Failed to post to Facebook");
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Social sharing error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.response?.data || error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
