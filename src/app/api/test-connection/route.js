// pages/api/linkedin/test-connection.js
import { getAccessToken } from "../../../utils/token-storage";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getAccessToken();
    if (!token) {
      return res.status(401).json({ message: "No valid token found" });
    }

    // Test the connection
    const response = await axios({
      method: "GET",
      url: `https://api.linkedin.com/v2/organizations/${process.env.LINKEDIN_ORGANIZATION_ID}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.status(200).json({
      success: true,
      organization: response.data,
    });
  } catch (error) {
    console.error("LinkedIn test connection error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
