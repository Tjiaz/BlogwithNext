import React from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";
import { FaFacebookSquare } from "react-icons/fa";
import { FaTwitterSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaRedditSquare } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { MdOutlineAddBox } from "react-icons/md";

const featuredParams = () => {
  return (
    <div className={styles.container}>
      <div className={styles.advertContainer}>
        <div className={styles.imageadvert}>
          <Image src="/p1.jpeg" alt="" fill className={styles.image} />
        </div>
        <Link href="/" className={styles.advert}>
          adverts link
        </Link>
      </div>
      <div className={styles.post}>
        <div className={styles.textContainer1}>
          <h1 className={styles.postTitle}>
            LLM Portfolio Projects Ideas to Wow Employers
          </h1>
          <p className={styles.postDesc}>
            Build interesting AI projects using LangChain, VectorDB, FastAPI,
            OpenAI API, Zyte, Ollama, and Hugging Face.
          </p>
          <div className={styles.author}>
            By{" "}
            <strong>
              <Link href="/" title="posted by author" rel="author">
                {" "}
                Name{" "}
              </Link>
            </strong>
            KDnuggets Assistant Editor on June 26, 2024 in{" "}
            <Link href="/">Language Models</Link>
          </div>
          <div className={styles.postSocial}>
            <Link className={styles.facebook} href="/facebook" rel="facebook">
              <FaFacebookSquare />
            </Link>
            <Link className={styles.twitter} href="/twitter" rel="twitter">
              <FaTwitterSquare />
            </Link>
            <Link className={styles.linkedin} href="/linkedin" rel="linkedin">
              <FaLinkedin />
            </Link>
            <Link className={styles.reddit} href="/reddit" rel="reddit">
              <FaRedditSquare />
            </Link>
            <Link className={styles.email} href="/email" rel="emailk">
              <MdEmail />
            </Link>
            <Link className={styles.addbox} href="/addbox" rel="addbox">
              <MdOutlineAddBox />
            </Link>
          </div>
          <hr />
          <center>
            <div className={styles.image_dummy}>
              <Image
                src="/dummy_img.png"
                alt=""
                width={800}
                height={500}
                className={styles.dummy_image}
              />
            </div>
            <p>Image by Author</p>
          </center>

          <Link href="/">
            <Link href="/" className={styles.readMore}>
              Read More
            </Link>
          </Link>
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

          <button className={styles.button}>Read More</button>
        </div>
      </div>
    </div>
  );
};

export default featuredParams;
