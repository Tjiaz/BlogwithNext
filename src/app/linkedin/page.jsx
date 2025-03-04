"use client";
import { useState, useEffect } from "react";
import { LINKEDIN_CONFIG } from "@/utils/linkedin-config";

export default function LinkedInAuth() {
  const [status, setStatus] = useState("initializing");
  const [authUrl, setAuthUrl] = useState("");

  useEffect(() => {
    // Get the authorization URL
    fetch("/api/linkedin")
      .then((res) => res.json())
      .then((data) => {
        setAuthUrl(data.authUrl);
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Error getting auth URL:", error);
        setStatus("error");
      });
  }, []);

  const handleAuth = () => {
    // Open LinkedIn auth in a popup
    window.open(authUrl, "LinkedIn Auth", "width=600,height=600");
  };

  return (
    <div className="linkedin-auth-container">
      <h1>Connect AzByteGems LinkedIn Page</h1>
      {status === "ready" && (
        <button onClick={handleAuth} className="linkedin-auth-button">
          Connect LinkedIn Page
        </button>
      )}
      {status === "error" && (
        <p className="error-message">
          Error initializing LinkedIn authentication
        </p>
      )}
      <style jsx>{`
        .linkedin-auth-container {
          padding: 20px;
          text-align: center;
          margin-top: 80px;
        }
        .linkedin-auth-button {
          background-color: #0077b5;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .error-message {
          color: red;
        }
      `}</style>
    </div>
  );
}
