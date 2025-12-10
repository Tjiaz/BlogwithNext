"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./newsletterPopup.module.css";
import { HiOutlineMail } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";

const NewsletterPopup = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the popup
    const popupDismissed = localStorage.getItem("newsletterPopupDismissed");
    const lastPopupTime = localStorage.getItem("lastPopupTime");
    const now = Date.now();
    
    // Show popup if:
    // 1. Not dismissed, or dismissed more than 7 days ago
    // 2. And no popup shown in last 24 hours
    const shouldShow =
      (!popupDismissed || (now - parseInt(popupDismissed || 0)) > 7 * 24 * 60 * 60 * 1000) &&
      (!lastPopupTime || (now - parseInt(lastPopupTime)) > 24 * 60 * 60 * 1000);

    if (shouldShow) {
      // Show popup after 3 seconds delay
      const timer = setTimeout(() => {
        setShow(true);
        localStorage.setItem("lastPopupTime", now.toString());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

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
        // Close modal after success
        setTimeout(() => {
          handleClose();
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

  const handleClose = () => {
    setShow(false);
    // Mark as dismissed (expires after 7 days)
    localStorage.setItem("newsletterPopupDismissed", Date.now().toString());
  };

  const handleNoThanks = () => {
    handleClose();
  };

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className={styles.closeButton}
          aria-label="Close"
        >
          <IoMdClose />
        </button>
        
        <div className={styles.iconContainer}>
          <HiOutlineMail className={styles.emailIcon} />
        </div>

        <h2 className={styles.title}>
          Get the FREE ebook 'AzByteGems Tech Insights Guide' along with the leading newsletter on Data Science, Machine Learning, AI & Programming straight to your inbox.
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputContainer}>
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
              {loading ? "SIGNING UP..." : "SIGN UP"}
            </button>
          </div>

          {status.message && (
            <p className={`${styles.statusMessage} ${styles[status.type]}`}>
              {status.message}
            </p>
          )}

          <p className={styles.privacyText}>
            By subscribing you accept{" "}
            <Link href="/privacy" className={styles.privacyLink}>
              AzByteGems Privacy Policy
            </Link>
            .
          </p>

          <button
            type="button"
            onClick={handleNoThanks}
            className={styles.noThanksButton}
          >
            No, thanks!
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterPopup;

