// app/api/linkedin/callback/route.js
import { NextResponse } from "next/server";
import axios from "axios";

// ✅ Tell Next this route is always dynamic
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // ✅ Use request.nextUrl (App Router) instead of new URL(request.url, ...)
    const url = request.nextUrl;

    console.log("Full Request URL:", url.toString());
    console.log("Callback Environment Debug:", {
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
      clientSecretPresent: process.env.LINKEDIN_CLIENT_SECRET
        ? "Present"
        : "Missing",
      nodeEnv: process.env.NODE_ENV,
      host: url.host,
    });

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");

    console.log("Callback Received Parameters:", {
      code: code ? "Present" : "Missing",
      state: state ? "Present" : "Missing",
      error: errorParam || "No error",
    });

    if (errorParam) {
      console.error("LinkedIn returned error:", errorParam);
    }

    // If no code, redirect back with error info
    if (!code) {
      console.error("No authorization code received");
      const redirectUrl = new URL(
        process.env.NEXT_PUBLIC_DOMAIN || "https://yourdomain.com"
      );
      redirectUrl.searchParams.set("linkedin_error", "no_code");
      return NextResponse.redirect(redirectUrl);
    }

    // Determine redirect URI
    const redirectUri =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api/linkedin/callback"
        : `${process.env.NEXT_PUBLIC_DOMAIN}/api/linkedin/callback`;

    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing LinkedIn Credentials", {
        clientIdPresent: !!clientId,
        clientSecretPresent: !!clientSecret,
      });

      const redirectUrl = new URL(
        process.env.NEXT_PUBLIC_DOMAIN || "https://yourdomain.com"
      );
      redirectUrl.searchParams.set("linkedin_error", "missing_credentials");
      return NextResponse.redirect(redirectUrl);
    }

    // 🔁 Exchange the authorization code for an access token
    let tokenResponse;
    try {
      tokenResponse = await axios({
        method: "POST",
        url: "https://www.linkedin.com/oauth/v2/accessToken",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          client_id: clientId.trim(),
          client_secret: clientSecret.trim(),
          redirect_uri: redirectUri,
        }).toString(),
      });
    } catch (tokenError) {
      console.error("Token Exchange Detailed Error:", {
        message: tokenError.message,
        response: tokenError.response?.data,
        status: tokenError.response?.status,
      });

      const redirectUrl = new URL(
        process.env.NEXT_PUBLIC_DOMAIN || "https://yourdomain.com"
      );
      redirectUrl.searchParams.set(
        "linkedin_error",
        encodeURIComponent(
          tokenError.response?.data?.error || tokenError.message
        )
      );

      return NextResponse.redirect(redirectUrl);
    }

    console.log("Token Exchange Debug:", {
      status: tokenResponse.status,
      accessTokenPresent: !!tokenResponse.data.access_token,
      expiresIn: tokenResponse.data.expires_in,
    });

    const { access_token, expires_in } = tokenResponse.data;

    // Redirect back to your frontend with success flags
    const redirectUrl = new URL(
      process.env.NEXT_PUBLIC_DOMAIN || "https://yourdomain.com"
    );
    redirectUrl.searchParams.set("linkedin_success", "true");
    redirectUrl.searchParams.set("expires_in", String(expires_in || ""));
    // ⚠️ usually you would NOT send the access token back in the URL to the browser,
    // better to store it on the server. Leaving this here only because your original code did:
    redirectUrl.searchParams.set("access_token", access_token || "");

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Overall LinkedIn Callback Error:", {
      message: error.message,
      stack: error.stack,
    });

    const redirectUrl = new URL(
      process.env.NEXT_PUBLIC_DOMAIN || "https://yourdomain.com"
    );
    redirectUrl.searchParams.set(
      "linkedin_error",
      encodeURIComponent(error.message)
    );

    return NextResponse.redirect(redirectUrl);
  }
}
