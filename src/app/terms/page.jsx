"use client";
import React, { useState, useEffect } from "react";
import styles from "./terms.module.css";
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
      <div className={styles.advertContainer}>
        <div className={styles.imageadvert}>
          <Image src="/ads.gif" alt="" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          Google-bigquery
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h1 className={styles.head}>Terms of Service</h1>

          <div className={styles.socialmedialinks}>
            <a href="#" className={styles.socialmedia}>
              <FaFacebookF />
            </a>
            <a href="#" className={styles.socialmedia}>
              <FaTwitter />
            </a>
            <a href="#" className={styles.socialmedia}>
              <FaLinkedin />
            </a>
            <a href="#" className={styles.socialmedia}>
              <FaYoutube />
            </a>
            <a href="#" className={styles.socialmedia}>
              <FaReddit />
            </a>
          </div>
          <hr style={{ color: "#bbbbbb" }} />
          <div className={styles.termsContainer}>
            <p>
              Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms
              of Service&quot;) carefully before using the www.azbytegems.com
              website (the &quot;Service&quot;) operated by Azbyte Gems
              (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;). Your access
              to and use of the Service is conditioned upon your acceptance of
              and compliance with these Terms. These Terms apply to all
              visitors, users, and others who wish to access or use the Service.
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these
              Terms. If you disagree with any part of the terms, then you do not
              have permission to access the Service.
            </p>
            <h2>Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of Azbyte Gems and its
              licensors. The Service is protected by copyright, trademark, and
              other laws of both the United Kingdom and foreign countries. Our
              trademarks and trade dress may not be used in connection with any
              product or service without the prior written consent of Azbyte
              Gems.
            </p>
            <p>
              You may not repost our content, including our blogs, charts,
              images, or other items published on Azbyte Gems, or translate our
              content to other languages, without obtaining explicit written
              permission from Azbyte Gems.
            </p>
            <h2>Links to Other Websites</h2>
            <p>
              Our Service may contain links to third-party websites or services
              that are not owned or controlled by Azbyte Gems. Azbyte Gems has
              no control over, and assumes no responsibility for, the content,
              privacy policies, or practices of any third-party websites or
              services. We do not warrant the offerings of any of these
              entities/individuals or their websites. You acknowledge and agree
              that Azbyte Gems shall not be responsible or liable, directly or
              indirectly, for any damage or loss caused or alleged to be caused
              by or in connection with the use of or reliance on any such
              content, goods, or services available on or through any such
              third-party websites or services. We strongly advise you to read
              the terms and conditions and privacy policies of any third-party
              websites or services that you visit.
            </p>
            <h2>Termination</h2>
            <p>
              We may terminate or suspend access from certain IP addresses to
              the Service immediately, without prior notice or liability, under
              our sole discretion, if we find excessive access to Azbyte
              Gems&apos; site or attempts to hack into our site or other
              security risks from those IPs, or for other reasons, including but
              not limited to a breach of the Terms. All provisions of the Terms
              which by their nature should survive termination shall survive
              termination, including, without limitation, ownership provisions,
              warranty disclaimers, indemnity, and limitations of liability.
            </p>
            <h2>Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Azbyte Gems and
              its licensee and licensors, and their employees, contractors,
              agents, officers, and directors, from and against any and all
              claims, damages, obligations, losses, liabilities, costs, or debt,
              and expenses (including but not limited to attorney&apos;s fees),
              resulting from or arising out of a) your use and access of the
              Service, or b) a breach of these Terms.
            </p>
            <h2>Limitation of Liability</h2>
            <p>
              In no event shall Azbyte Gems, nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from (i) your
              access to or use of or inability to access or use the Service;
              (ii) any conduct or content of any third party on the Service;
              (iii) any content obtained from the Service; and (iv) unauthorized
              access, use, or alteration of your transmissions or content,
              whether based on warranty, contract, tort (including negligence)
              or any other legal theory, whether or not we have been informed of
              the possibility of such damage, and even if a remedy set forth
              herein is found to have failed of its essential purpose.
            </p>
            <h2>Disclaimer</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is
              provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;
              basis. The Service is provided without warranties of any kind,
              whether express or implied, including, but not limited to, implied
              warranties of merchantability, fitness for a particular purpose,
              non-infringement, or course of performance. Azbyte Gems, its
              subsidiaries, affiliates, and its licensors do not warrant that a)
              the Service will function uninterrupted, secure, or available at
              any particular time or location; b) any errors or defects will be
              corrected; c) the Service is free of viruses or other harmful
              components; or d) the results of using the Service will meet your
              requirements.
            </p>
            <h2>Exclusions</h2>
            <p>
              Some jurisdictions do not allow the exclusion of certain
              warranties or the exclusion or limitation of liability for
              consequential or incidental damages, so the limitations above may
              not apply to you.
            </p>
            <h2>Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the
              laws of the United Kingdom, without regard to its conflict of law
              provisions. Our failure to enforce any right or provision of these
              Terms will not be considered a waiver of those rights. If any
              provision of these Terms is held to be invalid or unenforceable by
              a court, the remaining provisions of these Terms will remain in
              effect. These Terms constitute the entire agreement between us
              regarding our Service, and supersede and replace any prior
              agreements we might have had between us regarding the Service.
            </p>
            <h2>Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days&apos; notice prior to any new terms
              taking effect. What constitutes a material change will be
              determined at our sole discretion. By continuing to access or use
              our Service after any revisions become effective, you agree to be
              bound by the revised terms. If you do not agree to the new terms,
              you are no longer authorized to use the Service.
            </p>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at
              support@azbytegems.com.
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
              width={100}
              height={100}
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
              src="/dummy_Image.png"
              alt="advert"
              width={100}
              height={100}
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
