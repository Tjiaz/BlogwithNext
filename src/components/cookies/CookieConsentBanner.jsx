"use client";
import React, { useState, useEffect } from "react";
import styles from "./CookieConsentBanner.module.css";
import { FaCookie, FaTimes } from "react-icons/fa";

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
      // Trigger animation after component mounts
      setTimeout(() => setIsVisible(true), 10);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`${styles.cookieConsentBanner} ${
        isVisible ? styles.visible : ""
      }`}
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <FaCookie className={styles.icon} />
        </div>
        <div className={styles.textContainer}>
          <p className={styles.title}>We use cookies</p>
          <p className={styles.description}>
            This website uses cookies to enhance your browsing experience and
            provide personalized content. By continuing to use this site, you
            consent to our use of cookies.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={handleDecline} className={styles.declineButton}>
          Decline
        </button>
        <button onClick={handleAccept} className={styles.acceptButton}>
          Accept
        </button>
      </div>
      <button
        onClick={handleAccept}
        className={styles.closeButton}
        aria-label="Close"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default CookieConsentBanner;
