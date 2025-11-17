"use client";

import { useState, useEffect } from "react";
import styles from "./consentModal.module.css";
import { accordionItems } from "@/utils/accordian";


export default function ConsentModal() {
  const [showModal, setShowModal] = useState(true);
  const [manageSettings, setManageSettings] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  useEffect(() => {
    // Reset modal to show every time user visits
    setShowModal(true);
  }, []);

  const handleAccept = () => {
    setShowModal(false);
  };

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  if (!showModal) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {!manageSettings ? (
          <>
            <h2 className={styles.title}>Manage Your Privacy</h2>
            <p className={styles.text}>
              To provide the best experience, we and our partners use
              technologies like cookies to store and/or access device
              information. Consenting to these technologies will allow us and
              our partners to process personal data such as browsing behavior or
              unique IDs on this site.
            </p>
            <p className={styles.text}>
              You can update your choices at any time by clicking on the Update
              Privacy Preferences link at the bottom of the screen.
            </p>

            <div className={styles.actions}>
              <button
                onClick={() => setManageSettings(true)}
                className={styles.manageButton}
              >
                Manage Settings
              </button>
              <button onClick={handleAccept} className={styles.acceptButton}>
                Accept All
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Manage Your Privacy</h2>
            <p className={styles.text}>
              We and selected companies may access and use your data for the
              purposes below. Click into any purpose to customize your
              preferences and to learn who is requesting consent and/or claiming
              legitimate interest to process your data for that purpose.
            </p>
            <p className={styles.text}>
              Please note that when all purposes are disallowed, some site
              functionality may be affected.
            </p>

            {/* Accordion Section */}
            <div className={styles.accordion}>
              {accordionItems.map((item, index) => (
                <div key={index} className={styles.accordionItem}>
                  <button
                    className={styles.accordionHeader}
                    onClick={() => toggleAccordion(index)}
                  >
                    {item.title}
                    <span>{openAccordion === index ? "−" : "+"}</span>
                  </button>
                  {openAccordion === index && (
                    <div className={styles.accordionContent}>
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                onClick={() => setManageSettings(false)}
                className={styles.backButton}
              >
                Back
              </button>
              <button onClick={handleAccept} className={styles.acceptButton}>
                Save & Accept
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

