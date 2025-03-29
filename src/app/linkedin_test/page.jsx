// pages/linkedin-test.js
"use client";
import { useState } from "react";

export default function LinkedInTest() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      const response = await fetch("/api/linkedin_connection");
      const data = await response.json();

      if (data.success) {
        setStatus("Connection successful!");
        setError(null);
      } else {
        setError(data.error || "Connection failed");
        setStatus(null);
      }
    } catch (error) {
      setError(error.message);
      setStatus(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>LinkedIn Connection Test</h1>
      <button onClick={testConnection}>Test LinkedIn Connection</button>
      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
