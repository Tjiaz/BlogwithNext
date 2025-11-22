import React from "react";
import styles from ".blogPage.module.css";
import Image from "next/image";
import Link from "next/link";

const ProfileCard = ({
  profileImg,
  profileDesc,
  profileName,
  profileSocial,
  profileId,
}) => {
  return (
    <div className={styles.articleCard}>
      <div className={styles.postImage}>
        <Image
          src={profileImg}
          alt={postTitle}
          width={100}
          height={100}
          className={styles.image}
        />
      </div>
      <div className={styles.postContent}>
        <Link
          href={`/article_details/${profileId}`}
          className={styles.postTitle}
        >
          <h4>{profileName}</h4>
        </Link>
        <p className={styles.postDesc}>{profileDesc}</p>
        <div className={styles.author}>
          <strong>
            <Link href="/" title="social" rel="social">
              {profileSocial}
            </Link>
          </strong>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
