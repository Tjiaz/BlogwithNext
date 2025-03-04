// src/app/api/linkedin/get-auth-url/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const authUrl =
      `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_DOMAIN + "/api/linkedin/callback"
      )}&` +
      `scope=${encodeURIComponent(
        [
          "r_organization_social",
          "w_organization_social",
          "r_basicprofile",
          "w_member_social",
        ].join(" ")
      )}&` +
      `state=azbytegems_${Date.now()}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
