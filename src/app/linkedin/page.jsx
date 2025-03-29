"use client";
import { useState, useEffect, useCallback } from "react";

export default function LinkedInAuth() {
  const [status, setStatus] = useState("initializing");
  const [authUrl, setAuthUrl] = useState("");
  const [error, setError] = useState(null);

  // Improved error handling and logging
  const fetchAuthUrl = useCallback(async () => {
    try {
      // More specific API endpoint
      const response = await fetch("/api/linkedin/get-auth-url");

      // Check response status
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch LinkedIn auth URL");
      }

      const data = await response.json();

      // Validate the returned data
      if (!data.authUrl) {
        throw new Error("No authentication URL received");
      }

      setAuthUrl(data.authUrl);
      setStatus("ready");

      // Optional: Log the generated state for debugging
      console.log("LinkedIn Auth State:", data.state);
    } catch (error) {
      console.error("LinkedIn Auth URL Fetch Error:", {
        message: error.message,
        stack: error.stack,
      });

      setError(error.message);
      setStatus("error");
    }
  }, []);

  // Use useEffect to fetch auth URL
  useEffect(() => {
    fetchAuthUrl();
  }, [fetchAuthUrl]);

  // Enhanced auth handling with error tracking
  const handleAuth = () => {
    if (!authUrl) {
      setError("Authentication URL is not available");
      return;
    }

    try {
      // Open LinkedIn auth in a popup with more robust error handling
      const popup = window.open(
        authUrl,
        "LinkedIn Auth",
        "width=600,height=600,resizable=yes,scrollbars=yes"
      );

      // Check if popup was blocked
      if (!popup) {
        setError("Popup blocked. Please allow popups for this site.");
        return;
      }

      // Optional: Focus on the popup
      popup.focus();
    } catch (error) {
      console.error("LinkedIn Auth Popup Error:", error);
      setError("Failed to open LinkedIn authentication");
    }
  };

  // Add a listener for popup messages (optional, for more advanced flow)
  useEffect(() => {
    const handleAuthMessage = (event) => {
      // Validate the origin and message structure
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === "LINKEDIN_AUTH_RESULT") {
        if (event.data.success) {
          // Handle successful authentication
          setStatus("authenticated");
        } else {
          // Handle authentication failure
          setError(event.data.error || "Authentication failed");
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => {
      window.removeEventListener("message", handleAuthMessage);
    };
  }, []);

  // Render different states with more informative messages
  return (
    <div className="linkedin-auth-container">
      <h1>Connect AzByteGems LinkedIn Page</h1>

      {status === "initializing" && (
        <div className="loading">
          <p>Initializing LinkedIn Authentication...</p>
        </div>
      )}

      {status === "ready" && (
        <button
          onClick={handleAuth}
          className="linkedin-auth-button"
          disabled={!authUrl}
        >
          Connect LinkedIn Page
        </button>
      )}

      {status === "error" && (
        <div className="error-container">
          <p className="error-message">
            {error || "Error initializing LinkedIn authentication"}
          </p>
          <button onClick={fetchAuthUrl} className="retry-button">
            Retry Authentication
          </button>
        </div>
      )}

      {status === "authenticated" && (
        <div className="success-container">
          <p className="success-message">Successfully connected to LinkedIn!</p>
        </div>
      )}

      <style jsx>{`
        .linkedin-auth-container {
          padding: 20px;
          text-align: center;
          margin-top: 80px;
          max-width: 400px;
          margin: 0 auto;
        }
        .linkedin-auth-button {
          background-color: #0077b5;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .linkedin-auth-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        .error-message {
          color: red;
          margin-bottom: 15px;
        }
        .retry-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        .loading,
        .error-container,
        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
      `}</style>
    </div>
  );
}
