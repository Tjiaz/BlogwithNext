import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    // Parse the request body
    const { title, link, description } = await request.json();

    // Facebook Page Access Token and Page ID
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    // Construct the post data
    const postData = {
      message: `${title}\n\n${description}`,
      link: link,
      access_token: pageAccessToken,
    };

    // Make the API call to Facebook Graph API
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      postData
    );

    // Return success response
    return NextResponse.json({
      success: true,
      postId: response.data.id,
    });
  } catch (error) {
    console.error("Facebook Page post error:", error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.error || "Failed to post to Facebook Page",
      },
      { status: 500 }
    );
  }
}
