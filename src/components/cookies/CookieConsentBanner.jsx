"use client";
import React, { useState, useEffect } from "react";
import styles from "./CookieConsentBanner.module.css";

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={styles.cookieConsentBanner}>
      <p>This website uses cookies to enhance the user experience.</p>
      <button onClick={handleAccept}>I understand</button>
    </div>
  );
};

export default CookieConsentBanner;
