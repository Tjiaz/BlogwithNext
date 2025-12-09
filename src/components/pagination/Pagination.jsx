"use client";

import React from "react";
import styles from "./pagination.module.css";
import { useRouter } from "next/navigation";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const Pagination = ({ page, hasPrev, hasNext }) => {
  const router = useRouter();

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      router.push(`?page=${newPage}`);
      // Optionally scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${styles.prevButton}`}
        disabled={!hasPrev}
        onClick={() => handlePageChange(page - 1)}
        aria-label="Previous page"
      >
        <BsChevronLeft className={styles.icon} />
        <span>Previous</span>
      </button>
      <div className={styles.pageInfo}>
        <span className={styles.pageNumber}>Page {page}</span>
      </div>
      <button
        className={`${styles.button} ${styles.nextButton}`}
        disabled={!hasNext}
        onClick={() => handlePageChange(page + 1)}
        aria-label="Next page"
      >
        <span>Next</span>
        <BsChevronRight className={styles.icon} />
      </button>
    </div>
  );
};

export default Pagination;
