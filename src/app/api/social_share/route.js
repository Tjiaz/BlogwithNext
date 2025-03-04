// app/api/social-share/route.js
import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";

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
      console.log("Attempting Facebook share...");

      const pageId = process.env.FACEBOOK_PAGE_ID;
      const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

      if (!pageId || !accessToken) {
        throw new Error("Missing Facebook credentials");
      }

      // Create the post content
      const postData = {
        message: `${title}\n\n${description || ""}`,
        link: link,
        access_token: accessToken,
      };

      console.log("Facebook post data:", {
        pageId,
        hasToken: !!accessToken,
        postContent: postData,
      });

      try {
        const response = await axios({
          method: "post",
          url: `https://graph.facebook.com/v18.0/${pageId}/feed`,
          data: postData,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Facebook API response:", response.data);

        if (!response.data.id) {
          throw new Error("No post ID returned from Facebook");
        }

        return new Response(
          JSON.stringify({
            success: true,
            platform: "facebook",
            postId: response.data.id,
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (fbError) {
        console.error("Facebook API error details:", {
          status: fbError.response?.status,
          data: fbError.response?.data,
          message: fbError.message,
        });

        throw new Error(
          fbError.response?.data?.error?.message || "Failed to post to Facebook"
        );
      }
    }

    if (platform === "linkedin") {
      console.log("Attempting LinkedIn share...");

      const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
      const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;

      if (!accessToken || !organizationId) {
        throw new Error("Missing LinkedIn credentials");
      }

      const shareContent = {
        author: `urn:li:organization:${organizationId}`,
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
                title: {
                  text: title,
                },
                description: {
                  text: description || "",
                },
              },
            ],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      try {
        const response = await axios({
          method: "POST",
          url: "https://api.linkedin.com/v2/ugcPosts",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "LinkedIn-Version": "202304",
          },
          data: shareContent,
        });

        return NextResponse.json({
          success: true,
          platform: "linkedin",
          postId: response.data.id,
        });
      } catch (error) {
        console.error("LinkedIn API error:", error.response?.data || error);
        throw new Error(
          error.response?.data?.message || "Failed to post to LinkedIn"
        );
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
