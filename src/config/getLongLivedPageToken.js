// Get a long-lived page access token
async function getLongLivedPageToken() {
  try {
    // First, get a long-lived user access token
    const response = await axios.get(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: "your_short_lived_token",
        },
      }
    );

    const longLivedUserToken = response.data.access_token;

    // Then, get the page access token
    const pageResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}`,
      {
        params: {
          fields: "access_token",
          access_token: longLivedUserToken,
        },
      }
    );

    return pageResponse.data.access_token;
  } catch (error) {
    console.error("Error getting long-lived token:", error);
    throw error;
  }
}
