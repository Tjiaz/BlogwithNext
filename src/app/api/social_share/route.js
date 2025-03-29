// app/api/social-share/route.js
import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import { NextResponse } from "next/server";

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
