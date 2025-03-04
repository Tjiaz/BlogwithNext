// src/app/api/linkedin/callback/route.js
import { NextResponse } from "next/server";
import axios from "axios";

// Hypothetical function to get session data
import { getSessionData } from "@/utils/session";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code missing" },
        { status: 400 }
      );
    }

    // Retrieve the stored state from your session or other server-side storage
    const storedState = await getSessionData("linkedin_oauth_state");

    if (state !== storedState) {
      return NextResponse.json(
        { error: "Invalid state parameter" },
        { status: 403 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await axios({
      method: "POST",
      url: "https://www.linkedin.com/oauth/v2/accessToken",
      params: {
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_DOMAIN + "/api/linkedin/callback",
      },
    });

    const { access_token, expires_in } = tokenResponse.data;

    // Store the token (implement your storage solution)
    // For now, we'll just return it
    return NextResponse.json({
      success: true,
      access_token,
      expires_in,
    });
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
