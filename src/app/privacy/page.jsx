"use client";
import React, { useState, useEffect } from "react";
import styles from "./privacy.module.css";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaReddit,
  FaLinkedin,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";

const Page = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/api/latest_articles`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setLatestPosts(data); // If already an array, use it directly
        } else {
          console.error("Unexpected data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.advertsContainer}>
        <div className={styles.imageadvert}>
          <Image src="/ads.gif" alt="" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          Google-bigquery
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h1 className={styles.head}>Privacy Policy</h1>

          <div className={styles.socialmedialinks}>
            <a
              href="https://www.facebook.com/profile.php?id=61572544476793"
              className={`${styles.socialmedia} ${styles.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://x.com/azbytegems"
              className={`${styles.socialmedia} ${styles.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com/azbytegems"
              className={`${styles.socialmedia} ${styles.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="#"
              className={`${styles.socialmedia} ${styles.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
            <a
              href="#"
              className={`${styles.socialmedia} ${styles.reddit}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reddit"
            >
              <FaReddit />
            </a>
          </div>
          <hr style={{ borderColor: "rgba(0, 0, 0, 0.1)", margin: "20px 0" }} />
          <div>
            <p>
              We respect your privacy. We do not sell your information to
              advertisers. We only send our subscribers emails relevant to AI,
              Analytics, Big Data, Data Science, Data Mining, or Machine
              Learning, which includes Azbyte Gems News, features, opinions,
              tutorials, software, courses, meetings, webcasts, publications,
              jobs, our top stories, and relevant offers from our partners.
            </p>
            <h2>Data We Collect on Azbyte Gems Website</h2>
            <p>
              Azbyte Gems does not collect any personal information. We use
              Google Analytics to provide us with an aggregate view of our
              visitors. We also periodically analyze web logs to improve our
              service and security, and we analyze aggregate log data on IPs,
              browsers, and devices used to access Azbyte Gems.
            </p>
            <h2>Email List Information Collection</h2>
            <p>
              For each visitor that signs up for our email list, we collect only
              the email address and your name (if provided) as requested on the
              Azbyte Gems signup form. Our web servers may collect the IP
              address of visitors to our web pages. We may also collect
              clickstream information. In our email messages, we may include
              information from third-party providers for relevant products and
              services, which may be advertised or promoted within the messages
              we send to you. The privacy policies of those third-party provider
              sites govern the method by which they collect and use such
              information.
            </p>
            <h2>Use of Website Information Collected</h2>
            <p>
              The information we collect may be used to create an aggregate
              demographic profile of our user base so that we can improve
              content and services and provide aggregate information to
              potential advertisers (no individual information is provided to
              any advertiser). We may customize the content and/or layout of our
              email messages or pages for each individual visitor, notify you
              about updates to our website and services, send you our opt-in
              email newsletter(s), and provide you with the products and/or
              services for which you signed up or registered. This may include
              sending service disruption notices or other service- or
              product-related information via email. We do not share your
              information with other organizations for commercial purposes
              without your consent. We may share collected information with
              another company in the event that we merge with or are acquired by
              another company. Upon request, we will provide you with the
              information (e.g., email address, name, etc.) that we maintain
              about you.
            </p>
            <h2>Unsubscribe</h2>
            <p>
              To unsubscribe, just click the &quot;unsubscribe&quot; link at the
              bottom of each Azbyte Gems newsletter.
            </p>
            <h2>Cookies</h2>
            <p>
              We, and some of our partners who provide services and products on
              our site, may use cookies to record session information, such as
              information on what pages users access or visit, record past
              activity at a site to provide better service when you return to
              our site, and customize web page or email message content based on
              your browser type or other information.
            </p>
            <h2>Ad Servers and Other Partners</h2>
            <p>
              To bring you offers and information that may be of interest to
              you, we may have relationships with other companies that we allow
              to place ads or provide other services or products in our email
              newsletter(s). As a result of your visit to our site, these
              companies may collect non-personally identifiable information such
              as your domain type, IP address, and clickstream information. For
              further information, consult the privacy policies of these
              companies.
            </p>
            <h2>Advertising</h2>
            <p>
              This site is affiliated with CMI Marketing, Inc., d/b/a Raptive
              (“Raptive”) for the purposes of placing advertising on the site,
              and Raptive will collect and use certain data for advertising
              purposes. To learn more about Raptive’s data usage, click here.
            </p>
            <h2>Security</h2>
            <p>
              We, and providers of the email list management service used for
              this list, strive to maintain appropriate security measures in our
              respective physical facilities to protect against the loss,
              misuse, or alteration of information that we have collected from
              you for being part of our email list. Although we take reasonable
              measures to secure our data, we cannot guarantee that the measures
              taken are or will remain adequate. Since we may include links from
              messages sent to the email list to other companies&apos; websites,
              please refer to the privacy policies of those sites for
              information on how they handle security for information they
              collect.
            </p>
            <h2>CCPA Compliance</h2>
            <p>
              Azbyte Gems does not buy or sell personal information. Azbyte Gems
              does not meet any of the three requirements for CCPA in terms of
              either $25M Gross Annual Revenue, obtaining PI from 50,000+
              California residents, households, or devices per year, or earning
              50% or more of annual revenue from selling California
              residents&apos; PI.
            </p>
            <h2>Changes to Our Privacy Policy</h2>
            <p>
              From time to time, we may use customer information for new,
              unanticipated uses not previously disclosed in this Privacy Policy
              notice. If our information practices change in the future, we will
              post the policy changes to this Privacy Policy page to notify you
              of these changes and provide you with the ability to opt out of
              our list. If you are concerned about how your information is used,
              you should check back at this Privacy Policy page periodically.
            </p>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at support@azbytegems.com.
            </p>
          </div>
        </div>
        <div className={styles.textContainer2}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search AzByteGems..."
            />
            <MdSearch className={styles.searchIcon} />
          </div>
          <div className={styles.advertImageContainer}>
            <Image
              src="/ads2.gif"
              alt="advert"
              width={300}
              height={250}
              className={styles.advertImage}
            />
            <Link href="/">Adverts</Link>
          </div>
          <div>
            <h3>Latest Posts</h3>
            <div style={{ display: "flex", width: "100%" }}>
              <div
                style={{ flex: "0 0 25%", borderBottom: "3px solid #0B73B1" }}
              ></div>
              <div
                style={{ flex: "1", borderBottom: "2px solid #0B73B1" }}
              ></div>
            </div>
          </div>
          <div className={styles.topPosts}>
            <ol className={styles.noListStyle}>
              {latestPosts && latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <li key={post.id} className={styles.listItem}>
                    <Link href={`/article_details/${post.id}`}>
                      {post.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No top posts found.</li>
              )}
            </ol>
          </div>
          <div className={styles.advertImageContainer}>
            <Image
              src="/ads2.gif"
              alt="advert"
              width={300}
              height={250}
              className={styles.advertImage}
            />
            <Link href="/">Adverts</Link>
          </div>
          <div className={styles.signupContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Your Email"
            />
            <button href="/" className={styles.signupbutton}>
              sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Page;
