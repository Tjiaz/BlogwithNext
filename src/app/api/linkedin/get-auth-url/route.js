// app/api/linkedin/get-auth-url/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Extensive logging
    console.log("Environment Variables Debug:", {
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
      clientIdType: typeof process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
      clientIdLength: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID?.length,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });

    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;

    // Additional validation
    if (!clientId) {
      console.error("CRITICAL: No LinkedIn Client ID found!");
      return NextResponse.json(
        {
          error: "LinkedIn Client ID is not configured",
          details: {
            clientId: clientId,
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV,
          },
        },
        { status: 400 }
      );
    }

    const redirectUri =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api/linkedin/callback"
        : `${process.env.NEXT_PUBLIC_DOMAIN}/api/linkedin/callback`;

    // Generate a unique state
    const state = `azbytegems_${Date.now()}`;

    // Define the authorization URL
    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId.trim()); // Ensure no whitespace
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", "w_member_social");

    console.log("Generated Auth URL Details:", {
      fullUrl: authUrl.toString(),
      clientId: clientId.trim(),
      redirectUri,
      state,
    });

    return NextResponse.json({
      authUrl: authUrl.toString(),
      state,
      clientId: clientId.trim(), // Send client ID for additional verification
    });
  } catch (error) {
    console.error("Detailed LinkedIn Auth URL Generation Error:", {
      message: error.message,
      stack: error.stack,
      env: {
        clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
        nodeEnv: process.env.NODE_ENV,
      },
    });

    return NextResponse.json(
      {
        error: "Failed to generate authentication URL",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
