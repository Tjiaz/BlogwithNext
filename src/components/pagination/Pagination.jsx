"use client";

import React from "react";
import styles from "./pagination.module.css";
import { useRouter } from "next/navigation";

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
        className={styles.button}
        disabled={!hasPrev}
        onClick={() => handlePageChange(page - 1)}
        aria-label="Previous page"
      >
        Previous
      </button>
      <button
        className={styles.button}
        disabled={!hasNext}
        onClick={() => handlePageChange(page + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
