// components/subscribeModal/SubscribeModal.jsx
import React, { useState } from "react";
import styles from "./subscribeModal.module.css";

const SubscribeModal = ({ onClose, show }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Successfully subscribed! Check your email.",
        });
        setEmail("");

        // Trigger a refresh of the subscribers list if we're on the admin page
        if (window.location.pathname === "/admin/newsletter") {
          // You'll need to pass this function as a prop
          onSubscriptionSuccess?.();
        }

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to subscribe",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "20px",
          width: "90%",
          maxWidth: "400px",
          borderRadius: "10px",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        <p style={{ fontWeight: "bold", fontSize: "18px" }}>
          Get the FREE eBook & Cheat Sheets!
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              backgroundColor: "#0B73B1",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "uppercase",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              borderRadius: "5px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          {status.message && (
            <p
              style={{
                marginTop: "10px",
                color: status.type === "success" ? "green" : "red",
                fontSize: "14px",
              }}
            >
              {status.message}
            </p>
          )}
          <p
            style={{
              fontSize: "10px",
              color: "#ccc",
              marginTop: "10px",
            }}
          >
            By subscribing you agree to the AzByteGems Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
};

export default SubscribeModal;
