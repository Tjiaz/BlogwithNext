// app/api/linkedin/callback/route.js
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request) {
  try {
    // Safely parse the URL
    const url = new URL(request.url, `https://${request.headers.get("host")}`);

    console.log("Full Request URL:", url.toString());
    console.log("Callback Environment Debug:", {
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
      clientSecretPresent: process.env.LINKEDIN_CLIENT_SECRET
        ? "Present"
        : "Missing",
      nodeEnv: process.env.NODE_ENV,
      host: request.headers.get("host"),
    });

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Extensive logging
    console.log("Callback Received Parameters:", {
      code: code ? "Present" : "Missing",
      state: state ? "Present" : "Missing",
      error: error || "No error",
    });

    // Validate inputs
    if (!code) {
      console.error("No authorization code received");
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_DOMAIN}?linkedin_error=no_code`)
      );
    }

    // Determine redirect URI
    const redirectUri =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api/linkedin/callback"
        : `${process.env.NEXT_PUBLIC_DOMAIN}/api/linkedin/callback`;

    // Validate client credentials
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing LinkedIn Credentials", {
        clientIdPresent: !!clientId,
        clientSecretPresent: !!clientSecret,
      });
      return NextResponse.redirect(
        new URL(
          `${process.env.NEXT_PUBLIC_DOMAIN}?linkedin_error=missing_credentials`
        )
      );
    }

    // Exchange code for access token
    try {
      const tokenResponse = await axios({
        method: "POST",
        url: "https://www.linkedin.com/oauth/v2/accessToken",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          client_id: clientId.trim(), // Ensure no whitespace
          client_secret: clientSecret.trim(),
          redirect_uri: redirectUri,
        }).toString(),
      });

      console.log("Token Exchange Debug:", {
        status: tokenResponse.status,
        accessTokenPresent: !!tokenResponse.data.access_token,
        expiresIn: tokenResponse.data.expires_in,
      });

      const { access_token, expires_in } = tokenResponse.data;

      // Construct redirect URL more safely
      const redirectUrl = new URL(
        process.env.NEXT_PUBLIC_DOMAIN || "https://yourdomain.com"
      );
      redirectUrl.searchParams.set("linkedin_success", "true");
      redirectUrl.searchParams.set("access_token", access_token);
      redirectUrl.searchParams.set("expires_in", expires_in.toString());

      return NextResponse.redirect(redirectUrl);
    } catch (tokenError) {
      console.error("Token Exchange Detailed Error:", {
        message: tokenError.message,
        response: tokenError.response?.data,
        status: tokenError.response?.status,
      });

      // Redirect with error details
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
  } catch (error) {
    console.error("Overall LinkedIn Callback Error:", {
      message: error.message,
      stack: error.stack,
    });

    // Redirect with general error
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
