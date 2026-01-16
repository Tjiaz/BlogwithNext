// app/admin/newsletter/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./newsletter.module.css";
import { templates } from "@/app/emailTemplates";
import { isAdminEmail } from "@/config/admin";

export default function NewsletterAdmin() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [subscribers, setSubscribers] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState(templates.welcome);
  const [loading, setLoading] = useState(false);
  const [fetchingSubscribers, setFetchingSubscribers] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");
  const [showSubscriberList, setShowSubscriberList] = useState(false);

  const [formStatus, setFormStatus] = useState({ type: "", message: "" });

  const isAdmin = session?.user?.email && isAdminEmail(session.user.email);

  useEffect(() => {
    // Wait for the session to be loaded
    if (authStatus === "loading") return;

    // Check if user is authenticated and admin
    if (authStatus === "authenticated") {
      const isAdmin = session?.user?.email && isAdminEmail(session.user.email);
      console.log("Is Admin Check:", isAdmin);

      if (!isAdmin) {
        console.log("Not admin, redirecting...");
        router.push("/");
      }
    } else if (authStatus === "unauthenticated") {
      console.log("Not authenticated, redirecting...");
      router.push("/");
    }
  }, [authStatus, session, router]);

  // Fetch subscribers
  useEffect(() => {
    const fetchSubscribers = async () => {
      setFetchingSubscribers(true);
      try {
        console.log("Starting to fetch subscribers...");

        const response = await fetch("/api/subscribers", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched subscribers data:", data);

        // Verify the data structure
        if (Array.isArray(data)) {
          setSubscribers(data);
          console.log("Updated subscribers state:", data.length);
        } else {
          console.error("Received non-array data:", data);
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching subscribers:", error);
        setFormStatus({
          type: "error",
          message: "Failed to load subscribers. Please refresh the page.",
        });
      } finally {
        setFetchingSubscribers(false);
      }
    };

    if (isAdmin) {
      fetchSubscribers();
    }
  }, [isAdmin]);

  // Add this to see when the component rerenders
  console.log("Newsletter Admin rendering with subscribers:", subscribers);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormStatus({ type: "", message: "" });

    if (subscribers.length === 0) {
      setFormStatus({
        type: "error",
        message: "No subscribers available to send newsletter",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/send_newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          content,
          subscribers: subscribers.map((sub) => sub.email),
        }),
      });

      if (response.ok) {
        setFormStatus({
          type: "success",
          message: `Newsletter sent successfully to ${subscribers.length} subscribers!`,
        });
        setSubject("");
        setContent(templates.welcome);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to send newsletter");
      }
    } catch (error) {
      setFormStatus({
        type: "error",
        message: error.message || "Error sending newsletter",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName);
    if (templateName === "welcome") {
      setContent(templates.welcome);
      setSubject("Welcome to AZbyteGems!");
    } else if (templateName === "digest") {
      setContent(templates.digest);
      setSubject("Your Weekly Digest from AZbyteGems");
    } else {
      setContent("");
      setSubject("");
    }
  };

  if (authStatus === "loading" || fetchingSubscribers) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.unauthorizedContainer}>
        <h1>Unauthorized Access</h1>
        <p>You dont have permission to access this page.</p>
        <button onClick={() => router.push("/")} className={styles.button}>
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Newsletter Management</h1>

      <div className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>{subscribers.length}</h3>
            <p>Total Subscribers</p>
          </div>
          <div className={styles.statCard}>
            <h3>{subscribers.filter(s => s.active !== false).length}</h3>
            <p>Active Subscribers</p>
          </div>
        </div>
        {subscribers.length === 0 && (
          <p className={styles.warning}>No subscribers available</p>
        )}
        {subscribers.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSubscriberList(!showSubscriberList)}
            className={styles.toggleButton}
          >
            {showSubscriberList ? "Hide" : "Show"} Subscriber List
          </button>
        )}
        {showSubscriberList && subscribers.length > 0 && (
          <div className={styles.subscriberList}>
            <h4>Subscribers ({subscribers.length})</h4>
            <div className={styles.subscriberGrid}>
              {subscribers.map((sub, index) => (
                <div key={index} className={styles.subscriberItem}>
                  {sub.email}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Template Selection */}
      <div className={styles.templateSection}>
        <h3>Quick Templates</h3>
        <div className={styles.templateButtons}>
          <button
            type="button"
            onClick={() => handleTemplateChange("welcome")}
            className={`${styles.templateButton} ${selectedTemplate === "welcome" ? styles.active : ""}`}
          >
            Welcome Email
          </button>
          <button
            type="button"
            onClick={() => handleTemplateChange("digest")}
            className={`${styles.templateButton} ${selectedTemplate === "digest" ? styles.active : ""}`}
          >
            Weekly Digest
          </button>
          <button
            type="button"
            onClick={() => handleTemplateChange("custom")}
            className={`${styles.templateButton} ${selectedTemplate === "custom" ? styles.active : ""}`}
          >
            Custom
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="subject">Email Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className={styles.input}
            placeholder="Enter newsletter subject"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">
            Email Content (HTML supported)
            <button
              type="button"
              onClick={handlePreview}
              className={styles.previewButton}
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
          </label>
          {showPreview ? (
            <div
              className={styles.preview}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className={styles.textarea}
              rows="15"
              placeholder="Enter newsletter content (HTML supported)"
            />
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading || subscribers.length === 0}
            className={`${styles.button} ${styles.sendButton}`}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Sending...
              </>
            ) : (
              "Send Newsletter"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSubject("");
              setContent(templates.welcome);
            }}
            className={`${styles.button} ${styles.resetButton}`}
          >
            Reset Form
          </button>
        </div>

        {formStatus.message && (
          <p className={`${styles.status} ${styles[formStatus.type]}`}>
            {formStatus.message}
          </p>
        )}
      </form>
    </div>
  );
}
