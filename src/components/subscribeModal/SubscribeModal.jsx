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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className={styles.title}>Get the FREE eBook & Cheat Sheets!</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Signing Up...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
          {status.message && (
            <p className={`${styles.statusMessage} ${styles[status.type]}`}>
              {status.message}
            </p>
          )}
          <p className={styles.privacyText}>
            By subscribing you agree to the AzByteGems Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
};

export default SubscribeModal;
